# ADR 0002: Historical Salary Tracking & Soft Deletes

## Context

In many simple CRUD applications, updating a user's salary might be implemented by simply overwriting a `salary` column on an `employees` table. However, in the domain of HR and financial software, overwriting compensation data is a severe anti-pattern. It permanently destroys temporal data, making it impossible to audit past salaries, correctly calculate retroactive pay, or visualize compensation trends across the organization.

## Decision

We will implement full historical salary tracking throughout the stack (Database, API, and UI).

Specifically:
1.  **Salaries Table**: Instead of storing the salary directly on the `employees` table, we will create a dedicated `salary_history` table (One-to-Many). When a salary is updated, a new record is inserted with an `effective_date`.
2.  **Soft Deletes**: The `employees` table will include an `is_active` boolean. Deletions from the UI will flag this column rather than executing a SQL `DELETE`.
3.  **UI & Metrics**: The UI will not just hide this data. We will expose an employee's salary history in their detail view, allowing HR to see compensation growth over time.
4.  **SQL Views**: To simplify the dashboard and AI text-to-SQL logic, we will create a SQL View (e.g., `current_active_employees`) that projects a flat view of only the *latest* active salary for active employees.

## Consequences

-   **Positive:** We preserve the integrity and auditability of financial records. By exposing this in the UI, we build a truly useful HR tool rather than a glorified address book. The AI integration becomes significantly more powerful, capable of answering temporal questions.
-   **Negative:** The backend data fetching logic, SQLAlchemy models, and UI components become slightly more complex (e.g., needing an Employee Detail View with a timeline).
