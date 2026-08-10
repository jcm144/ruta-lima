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

- **Pricing data (as of 2026-08-09):** manually researched from the public
  websites of four real operators — Budget Perú, the Alkilautos aggregator
  (which lists Alamo, National, Enterprise, Budget, GreenMotion, América),
  Dionisio Rent a Car, and Perú Rent a Car. 15 vehicles, S/80–S/680/day.
  Every result card links to its source and shows the date observed. This
  is **not a live feed** — prices can change any time, and the app has no
  way to know when they do. USD-quoted prices were converted at the SUNAT
  reference rate from 2026-08-06 (S/3.39).
- Fields that weren't explicitly confirmed by a source (insurance
  inclusion, free cancellation, GPS, exact mileage policy, cancellation
  fees, deposit amounts, star ratings) are shown as "not confirmed" /
  omitted rather than guessed — see the disclosure banner in the app and
  each card's badges.
- The checkout is still a **client-side simulation** — no real charge, no
  email sent, no payment processor involved.
- "Mis reservas" persists only in the current browser's local storage;
  there is no backend, database, or shared account system.

## Running it

Just open `index.html` in a browser — no build step, no server, no
dependencies. Everything (including the embedded fonts) is inlined into
the one file.

## Deploying updates

This is currently deployed via a manual **Netlify Drop** (no git
integration), so pushing to GitHub does **not** auto-update
rutalima.netlify.app — re-drag the updated `index.html` at
app.netlify.com/drop, or switch the Netlify site to deploy from this
GitHub repo for continuous deployment.

## Next steps toward a real product

1. Move from manually-researched snapshots to a real data pipeline: an
   aggregator API (e.g. RentalCars.com/CarTrawler) for the major chains,
   plus direct partnerships with local Lima operators for the coverage
   aggregators miss — see the data-sourcing notes from the project chat.
2. Backfill the fields marked "not confirmed" (insurance, cancellation
   policy, deposits, mileage) via those partnerships — don't guess them.
3. Add a real backend for bookings (currently `localStorage` only).
4. Replace the simulated checkout with real payment processing.
5. Register a domain and point it at whichever host this is deployed to.
