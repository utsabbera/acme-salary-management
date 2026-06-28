# ADR 0010: Decoupling USD from Profile API Schemas

## Context
Previously, our OpenAPI schemas for employee details (`EmployeeRead`, `SalaryHistoryItem`, and `CurrentSalary`) required a `salary_usd_minor_units` field. However, upon reviewing the frontend implementation (specifically `employee-profile-pane.tsx` and `employees-table.tsx`), the user interface strictly displays compensation in the employee's local currency. The only place USD is aggregated and displayed is on the top-level Dashboard.

If we were to keep `salary_usd_minor_units` in the employee profile API responses, we would be forced to compute historical USD values on the fly for every single past salary segment just to fulfill the API contract, despite the frontend never rendering this data.

## Decision
We will entirely remove the `salary_usd_minor_units` field from the transactional API schemas (`EmployeeRead`, `CurrentSalary`, `SalaryHistoryItem`). 

USD conversion will be strictly reserved for analytical API endpoints (e.g., `/dashboard/stats`) and the underlying SQL views (e.g., `active_employees`) that power them.

## Consequences
- **Positive:** 
  - The API contract perfectly matches the UI requirements, reducing over-fetching.
  - Eliminates the need to execute complex historical exchange rate math for basic profile reads.
  - Fully decouples the core HR profile domain from financial analytics logic.
- **Negative:** The frontend API client must be regenerated, and any frontend tests that currently mock the `salary_usd_minor_units` field on the profile object must be updated to prevent type errors.

## Future Extension (On-Demand USD View)
During implementation planning, it was acknowledged that the UI might eventually require displaying an individual employee's CTC in USD on demand. Rather than reverting this decoupling, the established pattern will be to create a dedicated, separate endpoint (e.g., `GET /employees/{id}/salary-usd`) which performs the on-the-fly currency conversion only when explicitly requested by the frontend.
