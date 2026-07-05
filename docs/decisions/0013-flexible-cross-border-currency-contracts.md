# ADR 0013: Flexible Cross-Border Currency Contracts

## Context
Global enterprise payroll frequently involves complex employment agreements that span multiple jurisdictions and currencies. A strict data model would assume that an employee residing in a specific country (e.g., the UK) must be paid in that country's default currency (e.g., GBP). However, real-world scenarios—such as paying expatriates in their home currency or issuing contracts in stable foreign currencies to combat local hyperinflation—require systemic flexibility. 

## Decision
We will decouple the employee's compensation currency from their physical country of employment. The system will support flexible, cross-border currency contracts by explicitly omitting any validation rules that mandate an exact match between a salary's currency code and the employee's country default currency. Any employee can have their compensation denominated in any supported currency in the system.

## Consequences
- **Positive:**
  - **Real-World Alignment:** Fully supports standard global HR use cases like expats and multi-national contract structures without requiring database workarounds or custom overrides.
  - **Simplicity:** Keeps the domain logic and validation layers clean, focused strictly on data integrity rather than geofenced business rules.
- **Negative:**
  - **Data Entry Errors:** HR operators could accidentally select an incorrect currency from the dropdown during manual entry. The system relies on human review and organizational processes to catch these typographical errors, rather than systemic guardrails.
