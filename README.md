# RUTA — Comparador de autos de alquiler en Lima

A single-file, client-side prototype for comparing rental cars in Lima by
location, dates, price, and car model.

**Live:** https://rutalima.netlify.app/

## What's in it

- Search bar: pickup/drop-off location, a custom two-month date-range
  calendar, car-type search, driver-age selector
- Live filters: price range, vehicle type, transmission, company, extras
- Side-by-side comparison (up to 3 cars) with auto-tagged best price / best
  rated
- Full checkout flow: extras, driver form with validation, IGV-inclusive
  price breakdown
- "Mis reservas" — booking history saved to the browser's local storage
- Responsive down to mobile; light/dark theme aware

## Status

Everything is **mock data and simulated actions**, clearly labeled in the UI:

- The 12 cars/companies are illustrative sample data, not real inventory
  or pricing
- The checkout is a client-side simulation — no real charge, no email sent
- "Mis reservas" persists only in the current browser's local storage;
  there is no backend, database, or shared account system

## Running it

Just open `index.html` in a browser — no build step, no server, no
dependencies. Everything (including the embedded fonts) is inlined into
the one file.

## Next steps toward a real product

1. Replace the mock `CARS` array (in the `<script>` at the bottom of
   `index.html`) with a real data source — see the data-sourcing notes
   from the project chat (aggregator API for major chains + direct
   partnerships with local Lima operators for coverage they miss).
2. Add a real backend for bookings (currently `localStorage` only).
3. Replace the simulated checkout with real payment processing.
4. Register a domain and point it at whichever host this is deployed to.
