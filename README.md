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

- **Pricing data is auto-refreshed daily.** `scripts/refresh-prices.js` runs
  on a GitHub Actions schedule (`.github/workflows/refresh-prices.yml`,
  14:00 UTC / 09:00 Lima daily, or trigger manually from the Actions tab)
  and writes `data/cars.json`. The deployed app fetches that file directly
  from GitHub's raw content CDN on every page load — so prices update
  without needing a new Netlify deploy. 16 vehicles, S/80–S/680/day.
  - **Budget Perú** (2 categories): scraped from their homepage's clean,
    stable `.card-category` markup.
  - **Dionisio Rent a Car** (3 categories): pulled via their own public
    WordPress REST API (`/wp-json/wp/v2/posts`) — not scraping.
  - **Perú Rent a Car** (7 named vehicles): pulled via their own public
    WooCommerce Store API (`/wp-json/wc/store/v1/products/{id}`) — the
    same JSON endpoint their site's own cart uses. Not scraping.
  - **Alkilautos** (4 category rows) is **intentionally excluded** from
    auto-refresh: their `robots.txt` explicitly blocks 80+ known
    scraping/SEO bots by name, signaling they don't want automated tools
    pulling their data, even though the specific page cited isn't
    technically disallowed. Stays a manually-dated snapshot instead.
  - If the live fetch fails for any reason (offline, GitHub down, CORS),
    the app falls back to the embedded snapshot in `index.html` and says
    so in the disclosure banner — it never silently shows stale data as
    if it were current.
  - Every card still links to its source and shows whether its price was
    auto-updated or manually verified, with a timestamp either way.
- Fields no source explicitly confirmed (insurance inclusion, free
  cancellation, GPS, exact mileage policy, cancellation fees, deposit
  amounts, star ratings) are shown as "not confirmed" / omitted rather
  than guessed.
- The checkout is still a **client-side simulation** — no real charge, no
  email sent, no payment processor involved.
- "Mis reservas" persists only in the current browser's local storage;
  there is no backend, database, or shared account system.

## Running it

Just open `index.html` in a browser — no build step, no server, no
dependencies for the app itself. It'll try to fetch live prices from
GitHub and fall back to the embedded snapshot if that fails (e.g. if
opened via `file://`, since that can't reliably reach a cross-origin
fetch in every browser).

To run the price refresher locally: `node scripts/refresh-prices.js`
(requires Node 18+ for built-in `fetch`; no npm dependencies).

## Deploying updates

**Code changes** (anything in `index.html` itself) are still deployed via
a manual **Netlify Drop** (no git integration) — re-drag the file at
app.netlify.com/drop, or switch the Netlify site to deploy from this
GitHub repo for continuous deployment.

**Price changes** no longer need a redeploy at all — the GitHub Action
commits straight to `data/cars.json`, and the live site picks it up on
next page load.

## Next steps toward a real product

1. Get real API access for the major chains (Budget, Alamo, etc.) via an
   aggregator like DiscoverCars (free affiliate signup, API on request —
   https://www.discovercars.com/affiliate) or RentalCars.com/Booking.com's
   Rentalcars Connect (more of an enterprise partnership process). I can't
   create that account — it needs a human decision and signup.
2. Backfill the fields marked "not confirmed" (insurance, cancellation
   policy, deposits, mileage) via real partnerships — don't guess them.
3. Add a real backend for bookings (currently `localStorage` only).
4. Replace the simulated checkout with real payment processing.
5. Register a domain and point it at whichever host this is deployed to.
6. If Alkilautos coverage matters, reach out to them directly for a data
   partnership rather than scraping around their stated bot policy.
