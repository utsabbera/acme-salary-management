# ADR 0009: Exchange Rates in Database

## Context
With the decision to convert local currencies to USD dynamically on the fly (see ADR 0008), the system requires a mechanism to look up current exchange rates during database queries (e.g., when the dashboard fetches total payroll costs). 

One option is to fetch exchange rates synchronously from a third-party API at runtime. Another option is to store exchange rates locally in the database.

## Decision
We will store exchange rates locally in the `exchange_rates` database table. A background worker (e.g., a daily cron job) will be responsible for fetching the latest rates from an external provider (like OpenExchangeRates or Fixer) and inserting them into the database. All application views and queries will `JOIN` against this local table.

## Consequences
- **Positive:** 
  - **Performance:** SQL `JOIN`s against a local table are instantaneous (sub 10ms for our scale), avoiding the high latency of third-party HTTP requests during dashboard loads.
  - **Reliability:** If the external API goes down or rate limits are exceeded, our application continues to function normally using the latest cached rates.
  - **Historical Accuracy:** Over time, the database builds an immutable ledger of historical exchange rates, enabling accurate Point-In-Time (PIT) financial reporting.
- **Negative:** Introduces the operational complexity of maintaining a background worker/cron job to sync rates daily.
