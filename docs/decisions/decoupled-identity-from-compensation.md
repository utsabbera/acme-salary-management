# Decoupling Identity Creation from Compensation

## Context
Previously, an Employee could not exist in the system without an initial salary record. The `POST /employees` endpoint required salary information, and the `active_employees` database view relied on an `INNER JOIN` with the `salaries` table. This tightly coupled identity to compensation, breaking real-world HR onboarding workflows (where an employee identity is often created before their compensation package is finalized) and cluttering the API schemas.

## Decision
We completely decoupled Employee Identity from Compensation across the stack:
1. **Database:** Updated `active_employees` to use a `LEFT JOIN` on `salaries`, allowing employees without compensation to appear in standard queries.
2. **API Schema:** Refactored the `EmployeeRead` schema to extract the flat salary fields into a nested `CurrentSalary` object (`current_salary: CurrentSalary | None`). This accurately reflects the domain model where an employee optionally "has a" compensation package.
3. **Creation Workflow:** `POST /employees` no longer accepts or requires salary fields. A separate flow (`POST /employees/{id}/salary`) will handle initial compensation assignment.
4. **UI Integration:** The UI treats missing compensation as a primary state (e.g., prompting to "Add Salary" directly from the Employee Table row), rather than abstracting it into a separate dedicated tab, ensuring it remains deeply contextualized to the employee record.

## Consequences
- **Robust Domain Modeling:** The system now accurately models the real world, supporting "Pending" employees.
- **Type Safety:** The frontend client can safely assume that if `current_salary` exists, all its sub-fields (like currency and amount) are present, removing the need for widespread `undefined` checks.
- **Cleaner UI:** The employee creation and edit forms are drastically simpler, removing financial inputs from basic identity management.
