# ADR 0008: Local Currency as the Source of Truth

## Context
The salary management platform operates globally, meaning employment contracts are signed in various local currencies. The system previously stored both the local currency amounts (e.g., `base_salary_minor_units`) and a statically computed `salary_usd_minor_units` on the `salaries` table at the time of record creation or update.

This approach has a potential critical data staleness bug. Exchange rates fluctuate daily, but the stored USD value was permanently frozen at the rate from the day the salary row was last updated. When the finance team queried the dashboard for current total payroll, the system summed up USD values calculated using mixed, outdated exchange rates from potentially years ago.

## Decision
1. **Local Currency is the Absolute Source of Truth:** We will strictly store compensation amounts in the legal contract currency on the `salaries` table.
2. **Dynamic Conversion on Read:** We will remove `salary_usd_minor_units` and `exchange_rate_id` from the `salaries` table. All USD conversion will happen dynamically at read time for analytical queries (e.g., in the `active_employees` view), using the most up-to-date exchange rate for that day.

## Consequences
- **Positive:** Company-wide financial analytics will always use the most up-to-date exchange rates, ensuring 100% reporting accuracy. The database structure perfectly aligns with the legal reality of employment contracts.
- **Negative:** Querying active employees with USD values requires a SQL `JOIN` against an exchange rates table, slightly increasing read complexity compared to reading a pre-calculated column.
