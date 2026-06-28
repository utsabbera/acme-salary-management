# ADR 0006: Decoupling Profile Updates and Salary Adjustments

## Context
Initially, the employee update endpoint (`PATCH /employees/{id}`) was responsible for handling both basic profile information updates (like name, email, department, country) and salary adjustments (modifying compensation history). This coupled approach violated the single responsibility principle and introduced complexity in managing two fundamentally different types of changes.

## Decision
We decided to decouple Type 1 slowly changing dimensions (profile updates) from Type 2 dimensions (salary events). 
- `PATCH /employees/{id}` is now exclusively used for profile edits.
- Salary adjustments and history will be handled by a new dedicated endpoint (`POST /employees/{id}/salary`), which acts as an append-only log that closes previous salary validity periods.

## Consequences
- **Backend**: Reduced complexity in the `PATCH` endpoint logic and schema, resulting in cleaner and more focused controllers and validators.
- **Frontend**: The UI requires two distinct workflows. "Edit Profile" forms can remain simple, while "Adjust Salary" actions will have their own dedicated UI to handle financial data and effective dates.
- **Data Integrity**: Salary history is preserved as an immutable timeline without being accidentally mangled during routine HR profile edits.
