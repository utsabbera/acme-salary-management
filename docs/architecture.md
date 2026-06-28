# System Architecture

This document is the high-level technical blueprint for the ACME Salary Management application. It is treated as a living document and is updated as the system evolves.

---

## 1. System Overview

```mermaid
flowchart TD
    subgraph Browser["Browser"]
        UI["Next.js App Router\n(Client Components)"]
    end

    subgraph Vercel["Frontend — Vercel"]
        RSC["React Server Components\n(data fetching)"]
        SA["Server Actions\n(mutations)"]
        SDK["openapi-ts generated SDK\n(typed HTTP client)"]
    end

    subgraph Render["Backend — Render (Python Runtime)"]
        direction TB
        MW["Logging Middleware"]
        Router["FastAPI Routers"]
        Service["Service Layer\n(business rules)"]
        Repo["Repository Layer\n(SQLAlchemy)"]
    end

    subgraph Neon["Database — Neon PostgreSQL / SQLite (dev)"]
        direction TB
        Tables["Core Tables\nemployees · salaries · exchange_rates"]
        RefTables["Reference Tables\ncountries · currencies · departments"]
        View["SQL View: active_employees\n(JOINs exchange_rates for live USD)"]
    end

    UI <-->|"URL search params / client state"| RSC
    UI -->|"form submit"| SA

    RSC -->|"GET via SDK"| SDK
    SA -->|"POST / PATCH / DELETE via SDK"| SDK
    SDK -->|"HTTP"| MW

    MW --> Router
    Router --> Service
    Service --> Repo
    Repo <-->|"asyncpg / aiosqlite"| Tables
    Repo <-->|"asyncpg / aiosqlite"| RefTables
    Repo <-->|"asyncpg / aiosqlite"| View
    View -.->|"live JOIN at query time"| Tables
    View -.->|"live JOIN at query time"| RefTables
```

---

## 2. Data Model

```mermaid
erDiagram
    departments {
        int id PK
        varchar name UK
    }

    currencies {
        int id PK
        char code UK "ISO 4217 (3 chars)"
        varchar name
    }

    countries {
        int id PK
        char code UK "ISO 3166-1 alpha-2"
        varchar name
        int default_currency_id FK
    }

    employees {
        int id PK
        varchar first_name
        varchar last_name
        varchar email UK
        int department_id FK
        int country_id FK
        bool is_active "soft-delete flag"
        timestamp created_at
        timestamp updated_at
    }

    salaries {
        int id PK
        int employee_id FK
        bigint base_salary_minor_units "local currency, minor units"
        bigint housing_allowance_minor_units "nullable"
        bigint equity_minor_units "nullable"
        bigint other_allowance_minor_units "nullable"
        int currency_id FK
        date valid_from
        date valid_to "NULL = currently active"
    }

    exchange_rates {
        int id PK
        char currency UK "ISO 4217 code"
        numeric rate "to USD, upserted daily"
    }

    countries ||--o{ employees : "employs"
    departments ||--o{ employees : "belongs to"
    currencies ||--|| countries : "default currency"
    employees ||--o{ salaries : "has"
    currencies ||--o{ salaries : "denominated in"
```

### Key Invariants

- **One active salary per employee:** `valid_to = NULL` marks the currently active salary row. Exactly one row per active employee satisfies this condition at any time.
- **Closing on adjustment:** When a new salary is recorded, the service atomically sets `valid_to = new.valid_from - 1 day` on the previous active row before inserting the new one.
- **Minor units everywhere:** All monetary amounts are stored as `BIGINT` integer minor units (e.g. cents) to eliminate floating-point precision bugs.

---

## 3. Sequence Diagrams

### 3a. List Employees (paginated, with filters)

```mermaid
sequenceDiagram
    box Browser
        actor User
    end
    box Next.js
        participant RSC as employees/page.tsx
        participant SDK as openapi-ts SDK
    end
    box FastAPI
        participant API as Router
        participant Svc as EmployeeService
        participant Repo as EmployeeRepository
    end
    box PostgreSQL
        participant View as active_employees view
    end

    User->>RSC: Navigate to /employees?search=alice&department_id=2
    RSC->>SDK: listEmployeesEmployeesGet({ search, department_id, offset, limit })
    SDK->>API: GET /employees?search=alice&department_id=2&offset=0&limit=20
    API->>Svc: list_employees(offset, limit, search, department_id)
    par parallel queries
        Svc->>Repo: list_paginated(...)
        Repo->>View: SELECT * FROM active_employees WHERE ... ORDER BY last_name LIMIT 20
        View-->>Repo: List[row]
        Repo-->>Svc: List[EmployeeRead]
    and
        Svc->>Repo: count(...)
        Repo->>View: SELECT COUNT(*) FROM active_employees WHERE ...
        View-->>Repo: int
        Repo-->>Svc: int
    end
    Svc-->>API: PaginatedResponse[EmployeeRead]
    API-->>SDK: 200 { items, total, offset, limit }
    SDK-->>RSC: typed PaginatedResponse
    RSC-->>User: Rendered employee table + pagination
```

### 3b. Add Salary Adjustment

This is the most complex write path — it closes the current active salary and creates a new one in a single commit.

```mermaid
sequenceDiagram
    box Browser
        actor User
        participant Dialog as UpdateSalaryDialog
    end
    box Next.js
        participant SA as Server Action
        participant SDK as openapi-ts SDK
    end
    box FastAPI
        participant API as Router
        participant Svc as EmployeeService
        participant Repo as EmployeeRepository
    end
    box PostgreSQL
        participant DB as Database
    end

    User->>Dialog: Fill form (amount, currency, valid_from) and submit
    Dialog->>SA: addSalaryAdjustmentEmployeesEmployeeIdSalariesPost(...)
    SA->>SDK: POST /employees/{id}/salaries
    SDK->>API: HTTP POST /employees/{id}/salaries

    API->>Svc: add_salary_adjustment(employee_id, SalaryCreate)
    Svc->>Repo: get_by_id_with_salaries(employee_id)
    Repo->>DB: SELECT employee + salaries (selectinload) WHERE is_active=true
    DB-->>Repo: Employee with salaries[]
    Repo-->>Svc: Employee or None

    alt employee not found
        Svc-->>API: raise HTTPException 404
        API-->>SA: 404 NOT_FOUND
        SA-->>Dialog: Error toast shown
    end

    Svc->>Svc: Find active salary row (valid_to IS NULL)

    alt new valid_from is not after current valid_from
        Svc-->>API: raise HTTPException 400
        API-->>SA: 400 BAD_REQUEST
        SA-->>Dialog: Validation error shown
    end

    Svc->>DB: UPDATE salaries SET valid_to = new.valid_from - 1 WHERE id = active.id
    Svc->>DB: SELECT Currency WHERE code = currency_code
    DB-->>Svc: Currency
    Svc->>DB: INSERT INTO salaries (employee_id, ..., currency_id, valid_from, valid_to=NULL)
    Svc->>Repo: commit()
    Repo->>DB: COMMIT

    Svc->>Svc: get_employee(employee_id) — re-fetch full detail
    Svc-->>API: EmployeeDetailRead
    API-->>SDK: 201 EmployeeDetailRead
    SDK-->>SA: typed response
    SA->>SA: revalidatePath('/employees/{id}')
    SA-->>Dialog: success
    Dialog-->>User: Dialog closes, page refreshes with updated salary history
```

### 3c. Create Employee

```mermaid
sequenceDiagram
    box Browser
        actor User
        participant Dialog as AddEmployeeDialog
    end
    box Next.js
        participant SA as Server Action
        participant SDK as openapi-ts SDK
    end
    box FastAPI
        participant API as Router
        participant Svc as EmployeeService
        participant Repo as EmployeeRepository
    end
    box PostgreSQL
        participant DB as Database
    end

    User->>Dialog: Fill form (name, email, department, country) and submit
    Dialog->>SA: createEmployeeEmployeesPost(...)
    SA->>SDK: POST /employees
    SDK->>API: HTTP POST /employees

    API->>Svc: create_employee(EmployeeCreate)
    Svc->>Repo: get_by_email(email)
    Repo->>DB: SELECT WHERE email = ?

    alt email already registered
        Svc-->>API: raise HTTPException 409
        API-->>SA: 409 CONFLICT
        SA-->>Dialog: Email conflict error shown
    end

    Svc->>DB: SELECT Country WHERE code = country_code
    alt country not found
        Svc-->>API: raise HTTPException 404
        API-->>SA: 404 NOT_FOUND
        SA-->>Dialog: Error shown
    end

    Svc->>Repo: create(Employee(...))
    Repo->>DB: INSERT INTO employees, COMMIT, REFRESH
    DB-->>Repo: Employee (with generated id)

    Svc->>Repo: get_active_employee(id)
    Repo->>DB: SELECT FROM active_employees WHERE id = ?
    DB-->>Repo: EmployeeRead row
    Repo-->>Svc: EmployeeRead

    Svc-->>API: EmployeeRead
    API-->>SDK: 201 EmployeeRead
    SDK-->>SA: typed response
    SA->>SA: revalidatePath('/employees')
    SA-->>Dialog: success
    Dialog-->>User: Dialog closes, new employee appears in table
```

### 3d. Dashboard Load (exchange-rate-aware aggregation)

```mermaid
sequenceDiagram
    box Browser
        actor User
    end
    box Next.js
        participant RSC as dashboard/page.tsx
        participant SDK as openapi-ts SDK
    end
    box FastAPI
        participant API as Router
        participant DashRepo as DashboardRepository
    end
    box PostgreSQL
        participant View as active_employees view
        participant DB as Database
    end

    User->>RSC: Navigate to /dashboard
    RSC->>SDK: getDashboardStatsDashboardStatsGet()
    SDK->>API: GET /dashboard/stats

    API->>DashRepo: get_stats()

    par four aggregation queries
        DashRepo->>View: SELECT department, AVG(salary_usd_minor_units) GROUP BY department
        View-->>DashRepo: department_averages[]
    and
        DashRepo->>View: SELECT country, SUM(salary_usd_minor_units) GROUP BY country
        View-->>DashRepo: country_totals[]
    and
        DashRepo->>DB: SELECT SUM(component / rate) per component<br/>FROM salaries JOIN employees JOIN currencies<br/>OUTER JOIN exchange_rates WHERE active salary
        DB-->>DashRepo: component_totals (base, housing, equity, other)
    and
        DashRepo->>View: SELECT department, salary_usd_minor_units per employee
        View-->>DashRepo: raw salaries[]
        DashRepo->>DashRepo: Calculate p25, p50, p75 percentiles
    end

    DashRepo-->>API: DashboardStats
    API-->>SDK: 200 DashboardStats
    SDK-->>RSC: typed DashboardStats
    RSC-->>User: KPI cards + charts rendered
```

### 3e. Error Propagation

```mermaid
sequenceDiagram
    box FastAPI
        participant Svc as Service Layer
        participant API as Router
        participant EH as Exception Handlers
    end
    box Next.js
        participant SDK as openapi-ts SDK
        participant SA as Server Action
    end

    Svc->>API: raise HTTPException(status_code, detail)
    API->>EH: http_exception_handler(request, exc)
    Note over EH: Maps status code to semantic error code<br/>404 -> NOT_FOUND, 409 -> CONFLICT, etc.
    EH-->>API: JSONResponse { error: { code, message } }
    API-->>SDK: HTTP 4xx

    alt Pydantic validation failure
        API->>EH: validation_exception_handler(request, exc)
        EH-->>API: 422 { error: { code: VALIDATION_ERROR, details: [{field, issue}] } }
    end

    alt SQLAlchemy IntegrityError (bad FK reference)
        API->>EH: integrity_error_handler(request, exc)
        EH-->>API: 400 { error: { code: BAD_REQUEST, message: "Invalid reference data" } }
    end

    SDK-->>SA: typed error response (non-2xx)
    SA->>SA: Does NOT call revalidatePath (no stale data risk)
    SA-->>SA: Returns error to Client Component
    SA-->>SA: Client Component shows error toast or inline message
```

---

## 4. Frontend Component Boundary

```mermaid
flowchart TD
    subgraph Nextjs["Next.js"]
        subgraph RSC["React Server Components"]
            EmpPage["employees/page.tsx\nfetches: employee list + reference data"]
            EmpDetailPage["employees/[id]/page.tsx\nfetches: employee detail + reference data in parallel"]
            DashPage["dashboard/page.tsx\nfetches: DashboardStats"]
        end

        subgraph CC["Client Components"]
            AddDialog["AddEmployeeDialog\nform + Server Action"]
            EditDialog["EditEmployeeDialog\nform + Server Action"]
            DelDialog["DeleteEmployeeDialog\nconfirm + Server Action"]
            SalaryDialog["UpdateSalaryDialog\nform + Server Action"]
            Filters["Filters / SearchInput\nupdates URL search params"]
            Pagination["Pagination\nupdates URL search params"]
            Charts["DashboardCharts\nclient-rendered"]
        end
    end

    EmpPage --> AddDialog
    EmpPage --> Filters
    EmpPage --> Pagination
    EmpDetailPage --> EditDialog
    EmpDetailPage --> DelDialog
    EmpDetailPage --> SalaryDialog
    DashPage --> Charts
```

**RSC boundary rules:**
- RSCs own **all data fetching** — they call the openapi-ts SDK with `await` directly in the component body.
- Client Components own **all interactivity** — dialogs, filters, charts, URL manipulation.
- Mutations cross back to the server via **Server Actions**, which call the SDK and then `revalidatePath` on success to invalidate the RSC cache.

---

## 5. CI/CD Pipeline

```mermaid
flowchart TD
    Push["git push to main or open PR"]
    DC["detect-changes\ndorny/paths-filter"]

    Push --> DC

    DC -->|"backend/** changed"| BC["backend-checks\n1. uv sync\n2. ruff lint\n3. mypy typecheck\n4. pytest — coverage >= 90%"]
    DC -->|"frontend/** changed"| FC["frontend-checks\n1. pnpm install\n2. biome lint\n3. tsc typecheck\n4. vitest — coverage >= 80%"]

    BC -->|"passed + push to main"| DB["deploy-backend\nHTTP POST to Render Deploy Hook"]
    FC -->|"passed + push to main"| DF["deploy-frontend\nvercel pull --yes --environment=production\nvercel build --prod\nvercel deploy --prebuilt --prod"]

    DB --> Render["Render\nPython runtime, uv sync"]
    DF --> VercelProd["Vercel Production"]

    Render <-->|"asyncpg"| Neon["Neon Serverless PostgreSQL"]
```

**Key decisions ([ADR 0008](decisions/0008-ci-cd-pipeline-design.md)):**
- A single `deploy.yml` with a `detect-changes` gate keeps frontend and backend CI/CD fully independent.
- Render is deployed via **Deploy Hook** (not native Git integration) so the CI guard is enforced — Render only deploys after `backend-checks` passes.
- The frontend uses the **3-step Vercel CLI pattern** (`pull → build → deploy --prebuilt`) to separate build failures from upload failures.
- No Docker in production. Both stacks deploy via a single HTTP call or CLI command, with no image artifacts to manage.

---

## 6. Architectural Principles

### Frontend (Next.js)
- **Server-First:** RSCs fetch data and render HTML. The browser receives minimal JavaScript.
- **URL-Driven State:** Pagination, search, and filters live in `searchParams` — views are deep-linkable and require no client-side state synchronization.
- **Server Actions for mutations:** All writes go through Server Actions, which call the typed SDK and invoke `revalidatePath` on success.
- **Type-safe API contract:** `openapi-ts` generates a fully typed SDK from the backend's `openapi.json`. There are no manual `fetch` calls anywhere in the frontend.

### Backend (FastAPI)
- **Repository Pattern:** SQLAlchemy query logic is isolated behind repository classes. Services never build ORM queries directly.
- **Service Layer owns business rules:** Salary closing logic, email uniqueness checks, and currency/country resolution all live exclusively in the service layer — not in routers, not in repositories.
- **Strict Pydantic contracts:** All input/output shapes are Pydantic models. The resulting OpenAPI spec is the single source of truth for the frontend SDK.
- **Structured error envelope:** All 4xx/5xx responses follow `{ error: { code, message } }`. Validation errors additionally include a `details` array with per-field information.

### Data Tier
- **Local currency is the source of truth** ([ADR 0011](decisions/0011-local-currency-source-of-truth.md)): Salaries are stored in the employee's legal contract currency. USD conversion happens dynamically at read time via the `active_employees` view — never frozen at write time.
- **Temporal salary model:** `valid_from` / `valid_to` date ranges on `salaries` provide a full immutable audit trail. The system never overwrites or deletes salary rows.
- **SQL View for analytics:** The `active_employees` view joins `salaries`, `currencies`, `exchange_rates`, `departments`, and `countries` in one place, exposing a flat projection. Application code never assembles this join itself.
