## Problem Statement

Currently, the ACME org's HR team manages salary data for 10,000 employees across multiple countries entirely via Excel spreadsheets. This process is highly tedious, error-prone, and non-collaborative. It makes it extremely difficult for the HR Manager to quickly answer high-level questions about how the organization pays people, analyze compensation distribution, or securely manage the data.

## Solution

A single-tenant, web-based Salary Management application tailored for the HR Manager persona. The core MVP will provide a robust dashboard highlighting key compensation metrics and a highly performant, server-side paginated data table to manage the 10,000 employee records.
**Stretch Goal (Not a must-have):** If time permits after core functionality is complete, the application will also feature an integrated AI-powered Natural Language to SQL command bar, allowing the HR Manager to ask ad-hoc questions about the data.

## User Stories

1. As an HR Manager, I want to view a dashboard with Average Salary by Department, Total Payroll Cost by Country, and Pay Distribution/Spread so that I can instantly understand overall compensation trends across the organization.
2. As an HR Manager, I want to view a paginated list of all 10,000 employees so that I can inspect individual records without the application crashing or slowing down my browser.
3. As an HR Manager, I want to search and filter employees by text, department, and country so that I can quickly drill down into specific segments of the workforce.
4. As an HR Manager, I want to manage employee records (add new employees, update salaries, change departments, and remove employees) so that the system remains the single source of truth for current active salaries.
5. As an HR Manager, I want to view an individual employee's salary history over time so that I can audit past raises and compensation growth.
6. As an HR Manager, I want the current view of my data table (pagination, filters, search terms) to be reflected in the URL so that I can easily bookmark and share specific views.

**Stretch Goal User Story:**
6. As an HR Manager, I want to use a natural language command bar on the dashboard to ask complex questions (e.g., "Who are the top 5 earners in Engineering?") so that I can get immediate, ad-hoc insights without needing engineering support to build new reports.

## Implementation Decisions

- **Architecture:** 
  - Backend: Python 3.13 with FastAPI for high-performance, asynchronous REST APIs. 
  - Frontend: Next.js 16 (App Router) with React 19, utilizing Server Components for optimal rendering and data fetching.
- **Database Schema & Data Management:** 
  - SQLite (`aiosqlite`) with a normalized schema. We will use a dedicated `salary_history` table (One-to-Many with `employees`) to enable full **historical salary tracking** (tracking raises and compensation changes over time).
  - **Soft Deletes**: The `employees` table will include an `is_active` boolean to support soft deletes.
  - **Currency Normalization**: A `salary_usd` column will be pre-calculated and stored on each `salary_history` record. For ongoing mutations, a backend service will dynamically calculate `salary_usd` before inserting the new historical salary row.
- **Frontend State Management:** 
  - URL Search Parameters will be used exclusively to drive the state of the Employee Data Table (pagination, search, and filtering) to integrate natively with Next.js Server Components.
  - Server Actions (Next.js) will be used to handle write operations (Create, Update, Delete) to ensure data mutations are seamless and cache-invalidations happen correctly.
- **AI Integration (Stretch Goal):** 
  - *Note: Stakeholders clarified this is not a must-have. It will only be implemented if time permits.*
  - Utilizing `pydantic-ai` for explicit, structured prompting. 
  - **Data Safety via Views**: To prevent the AI from querying soft-deleted records, we will create a SQL `VIEW` (e.g., `active_employees`) and only expose the DDL of this view to the LLM. 
  - The generated SQL will be executed via a dedicated read-only database connection for security.
- **Seeding Strategy:** 
  - A Python script utilizing the `Faker` library will generate 10,000 realistic employee records across various departments and countries, applying a static mock conversion rate to populate the `salary_usd` field.

## Testing Decisions

- **Backend (`pytest`):** 
  - Focus on testing the core pagination, search, and filtering logic within the FastAPI endpoints. 
  - Verify that the metrics endpoints correctly aggregate the `salary_usd` values.
  - Mock the LLM responses to test the safety and execution flow of the Text-to-SQL endpoint.
- **Frontend (`vitest`):**
  - Verify that the data table component correctly reads and updates URL search parameters.
  - Ensure the dashboard components render correctly with mocked API data.

## Out of Scope

- **Authentication / Authorization:** The application operates in a single-tenant environment initialized directly into the HR Manager persona.
- **Real-Time Exchange Rates:** All currency normalization to USD will use a static mock conversion rate for simplicity.

## Further Notes

- The AI command bar is a stretch goal but its architecture (denormalized `salary_usd` column vs normalized tables) has driven several key backend design decisions to ensure it is viable and performant.
