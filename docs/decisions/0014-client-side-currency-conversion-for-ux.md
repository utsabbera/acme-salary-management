# ADR 0014: Client-Side Currency Conversion for Interactive UX

**Status:** Accepted
**Supersedes:** The "Future Extension (On-Demand USD View)" clause of [ADR 0010](./0010-decouple-usd-from-profile-api.md)

## Context
ADR 0010 successfully decoupled the core HR profile domain from financial analytics logic by removing `salary_usd_minor_units` from the standard API payloads. As part of that decision, it was proposed that any future on-demand USD conversions requested by the frontend (such as a profile USD toggle) should be handled by a dedicated backend endpoint (e.g., `GET /employees/{id}/salary-usd`).

During the implementation of Issue #59 (Profile USD Toggle), we realized that requiring an asynchronous backend request for currency conversion introduces unacceptable UX friction. A toggle interaction should be instantaneous and synchronous. Furthermore, as the application evolves to allow users to input or adjust salaries, the frontend must provide "live" as-you-type conversion previews (e.g., typing $55,000 USD and instantly seeing ≈ €50,000). A strict server-side conversion architecture cannot support instantaneous previews without heavy debouncing and noticeable network latency.

## Decision
We authorize the frontend application to fetch the global exchange rates (`GET /exchange-rates`) and perform mathematical currency conversions client-side to power highly interactive, instantaneous UX features (like toggles and live form previews).

The backend remains the absolute authoritative source for final, recorded values. Forms and API requests must always submit the exact local currency value. The client-side USD math is strictly for display and preview purposes.

## Consequences
- **Positive:**
  - **Zero-Latency UX:** Toggling currencies or typing in forms will provide instantaneous, synchronous feedback without loading states or spinners.
  - **Symmetrical Architecture:** The same in-memory `exchangeRates` dictionary can be used uniformly across the frontend to drive both read-only views and live input forms.
- **Negative:**
  - **Payload Size:** The frontend must fetch the exchange rate dictionary on load.
  - **Math in React:** Components must handle multiplication/division logic, increasing the complexity of the presentation layer.
