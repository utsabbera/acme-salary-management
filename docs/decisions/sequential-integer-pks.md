# Sequential Integer Primary Keys

## Status
Accepted

## Context
We needed to decide the format for the primary keys for core entities (`Employee`, `Salary`) in the ACME Salary Management tool. We initially started with `UUIDv7` to conform to modern scalable backend design.

## Decision
We decided to use auto-incrementing sequential integers (`SERIAL`/`AUTOINCREMENT`) for the Primary Keys. 
Because ACME Salary Management is designed exclusively as an **internal tool** (single-tenant) rather than a B2B SaaS platform, the primary arguments against sequential IDs—such as leaking business metrics (like total employee count) or cross-tenant ID collisions—do not apply.

By reverting to sequential integers, we gain:
1. **Radical Simplicity:** Only one identifier to manage per entity.
2. **Storage and Speed:** Integer B-Tree indexes are significantly smaller and faster to join than 16-byte UUIDs.
3. **Usability:** A human-readable identifier (e.g. `employee_id = 45`) is much easier for HR and developers to reference directly when auditing logs or databases.

## Consequences
- The database schema must be recreated to alter existing tables from UUID to Integer types.
- API endpoints will expose sequential IDs (e.g., `/api/employees/45`).
- If in the future we introduce entities that require obfuscation or external references (e.g., sharing a public link), we can introduce a separate `external_id` (UUID) field specifically for those entities.
