# Requirements: ACME Salary Management

## Problem Statement
Currently, the ACME organization's HR team manages salary data for 10,000 employees across multiple countries entirely via Excel spreadsheets. This process is highly tedious, error-prone, and non-collaborative. It makes it extremely difficult for the HR Manager to quickly answer high-level questions about how the organization pays people, analyze compensation distribution, or securely manage the data.

## Goal
To replace an error-prone, spreadsheet-based salary tracking process with a robust, web-based system of record. The application will empower the HR Manager to securely manage compensation data for 10,000 employees across multiple countries, and instantly analyze organizational pay trends without performance bottlenecks.

## Solution
A single-tenant, web-based Salary Management application tailored for the HR Manager persona. The application will serve as a robust, scalable system of record for employee compensation, providing a high-level analytics dashboard and a highly performant, paginated data table.

## Scope
The application focuses purely on HR workflows for viewing and managing salary data, delivering the following core features:

### Dashboard & Analytics
- **High-Level Metrics:** A live dashboard displaying Average Salary by Department, Total Payroll Cost by Country, and Pay Distribution/Spread to instantly surface compensation trends.
- **AI Querying (Stretch Goal):** A natural language command bar allowing users to ask ad-hoc data questions (e.g., "Who are the top 5 earners in Engineering?") for immediate, no-code insights.

### Employee Data Management
- **High-Performance Table:** A server-side paginated list optimized to render 10,000 employee records without browser lag.
- **Search & Filter:** Advanced drill-down capabilities by text, department, and country to quickly segment the workforce.
- **URL State Management:** Pagination and filter states are synced to the URL, enabling easy bookmarking and sharing of specific data views.

### Compensation Management
- **Record Keeping:** Full CRUD capabilities (add, update, remove) for employee records, ensuring the system remains the single source of truth.
- **Salary Components & History:** The ability to assign granular compensation components (e.g., Base Salary, Housing Allowance) to accurately track compensation growth and salary history over time.

## Out of Scope
To maintain strict focus on the core value proposition (managing and analyzing large datasets efficiently), we are intentionally excluding:

- **Authentication & Role-Based Access Control (RBAC):** 
  *Reasoning:* The MVP assumes a single-tenant environment operated solely by the HR Manager persona. Building login flows, session management, and permission matrices would significantly slow down development without validating the core data management features first.
- **Real-Time Currency Exchange Rates:**
  *Reasoning:* While the organization spans multiple countries, integrating a live FX API introduces external network dependencies, latency, and potential failure points. We will use static mock conversion rates to USD to prove the analytics functionality.


