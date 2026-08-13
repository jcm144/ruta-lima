// Refreshes CARS pricing data from real, publicly accessible sources and writes data/cars.json.
//
// Sources and method per operator:
//   - Budget Perú: HTML scrape of the two category price blocks on their homepage
//     (clean semantic CSS classes, robots.txt has no restrictions, ToS has no anti-scraping clause).
//   - Dionisio Rent a Car: their own public WordPress REST API (wp-json/wp/v2/posts), not scraping.
//   - Perú Rent a Car: their own public WooCommerce Store API (wp-json/wc/store/v1/products) —
//     the same JSON endpoint their site's own cart uses. Not scraping; a real structured API.
//   - Alkilautos: deliberately NOT auto-refreshed. Their robots.txt explicitly blocks 80+ known
//     scraping/SEO bots by name, which signals they don't want automated tools pulling their data,
//     even though the specific page we cite isn't technically disallowed. Left as a manually
//     dated snapshot instead.
//
// Run with: node scripts/refresh-prices.js
// Writes: data/cars.json

const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'data', 'cars.json');

const PERU_RENT_A_CAR_PRODUCTS = {
  jacRefine: 12410,
  fordTerritory: 12336,
  fordExplorer: 12391,
  mercedesE200: 4306,
  bmw520i: 4296,
  corolla: 4236,
  yaris: 4224,
};

// Static metadata that scraping/APIs can't reliably re-derive each run. `refresh` describes
// how (if at all) this car's price gets updated automatically; everything else stays curated.
const BASE_CARS = [
  { company: 'Budget Perú', model: 'Categoría Económica', type: 'Económico', trans: 'Automática', seats: 5, bags: 2,
    insurance: false, freeCancel: false, gps: false, locations: ['Aeropuerto Jorge Chávez', 'Barranco'],
    source: 'https://www.budgetperu.com/en/', sourceLabel: 'budgetperu.com',
    noteBase: 'Ej. Chevrolet Aveo o similar · tarifa oficial publicada por Budget Perú',
    refresh: { method: 'budget-category', category: 'Cars' } },
  { company: 'Budget Perú', model: 'Categoría SUV', type: 'SUV', trans: 'Automática', seats: 5, bags: 3,
    insurance: false, freeCancel: false, gps: false, locations: ['Aeropuerto Jorge Chávez', 'Barranco'],
    source: 'https://www.budgetperu.com/en/', sourceLabel: 'budgetperu.com',
    noteBase: 'SUV compacta o similar, hasta 7 pasajeros · tarifa oficial publicada por Budget Perú',
    refresh: { method: 'budget-category', category: 'SUVs' } },

  { company: 'Alkilautos · red de proveedores', model: 'Suzuki Swift o similar', type: 'Económico', trans: 'Manual', seats: 4, bags: 1,
    insurance: true, freeCancel: false, gps: false, locations: ['Aeropuerto Jorge Chávez'],
    source: 'https://alkilautos.com/en/car-rental-lima/', sourceLabel: 'alkilautos.com',
    noteBase: 'Red que agrega Alamo, National, Enterprise, Budget, GreenMotion y América — km libre y seguro básico incluidos',
    mileageUnlimited: true, price: 83, priceAsOf: '2026-08-09', refresh: null },
  { company: 'Alkilautos · red de proveedores', model: 'Toyota Yaris o similar', type: 'Compacto', trans: 'Automática', seats: 5, bags: 2,
    insurance: true, freeCancel: false, gps: false, locations: ['Aeropuerto Jorge Chávez'],
    source: 'https://alkilautos.com/en/car-rental-lima/', sourceLabel: 'alkilautos.com',
    noteBase: 'Red que agrega Alamo, National, Enterprise, Budget, GreenMotion y América — km libre y seguro básico incluidos',
    mileageUnlimited: true, price: 105, priceAsOf: '2026-08-09', refresh: null },
  { company: 'Alkilautos · red de proveedores', model: 'Toyota Corolla o similar', type: 'Intermedio', trans: 'Automática', seats: 5, bags: 3,
    insurance: true, freeCancel: false, gps: false, locations: ['Aeropuerto Jorge Chávez'],
    source: 'https://alkilautos.com/en/car-rental-lima/', sourceLabel: 'alkilautos.com',
    noteBase: 'Red que agrega Alamo, National, Enterprise, Budget, GreenMotion y América — km libre y seguro básico incluidos',
    mileageUnlimited: true, price: 116, priceAsOf: '2026-08-09', refresh: null },
  { company: 'Alkilautos · red de proveedores', model: 'Nissan Kicks o similar', type: 'SUV', trans: 'Automática', seats: 5, bags: 3,
    insurance: true, freeCancel: false, gps: false, locations: ['Aeropuerto Jorge Chávez'],
    source: 'https://alkilautos.com/en/car-rental-lima/', sourceLabel: 'alkilautos.com',
    noteBase: 'Red que agrega Alamo, National, Enterprise, Budget, GreenMotion y América — km libre y seguro básico incluidos',
    mileageUnlimited: true, price: 126, priceAsOf: '2026-08-09', refresh: null },

  { company: 'Dionisio Rent a Car', model: 'Categoría Compacta', type: 'Compacto', trans: 'Automática', seats: 5, bags: 2,
    insurance: false, freeCancel: false, gps: false, locations: ['San Borja'],
    source: 'https://dionisiorentacar.com/blogs/precios-de-alquiler-de-autos-en-lima/', sourceLabel: 'dionisiorentacar.com',
    noteBase: 'Precio "desde" · operador local en San Borja',
    refresh: { method: 'dionisio-range', index: 0 } },
  { company: 'Dionisio Rent a Car', model: 'Categoría Sedán intermedio', type: 'Intermedio', trans: 'Automática', seats: 5, bags: 3,
    insurance: false, freeCancel: false, gps: false, locations: ['San Borja'],
    source: 'https://dionisiorentacar.com/blogs/precios-de-alquiler-de-autos-en-lima/', sourceLabel: 'dionisiorentacar.com',
    noteBase: 'Precio "desde" · operador local en San Borja',
    refresh: { method: 'dionisio-range', index: 1 } },
  { company: 'Dionisio Rent a Car', model: 'Categoría SUV / Camioneta 4x4', type: 'Camioneta 4x4', trans: 'Manual', seats: 5, bags: 4,
    insurance: false, freeCancel: false, gps: false, locations: ['San Borja'],
    source: 'https://dionisiorentacar.com/blogs/precios-de-alquiler-de-autos-en-lima/', sourceLabel: 'dionisiorentacar.com',
    noteBase: 'Precio "desde" · operador local en San Borja',
    refresh: { method: 'dionisio-range', index: 2 } },

  { company: 'Perú Rent a Car', model: 'Toyota Corolla', type: 'Económico', trans: 'Automática', seats: 5, bags: 2,
    insurance: false, freeCancel: false, gps: false, locations: ['Surco'],
    source: 'https://www.perurentacar.com/en/product/toyota-corolla/', sourceLabel: 'perurentacar.com',
    noteBase: 'Operador local, Surco',
    refresh: { method: 'peru-rent-a-car', productId: PERU_RENT_A_CAR_PRODUCTS.corolla } },
  { company: 'Perú Rent a Car', model: 'Toyota Yaris', type: 'Económico', trans: 'Automática', seats: 5, bags: 2,
    insurance: false, freeCancel: false, gps: false, locations: ['Surco'],
    source: 'https://www.perurentacar.com/en/product/toyota-yaris/', sourceLabel: 'perurentacar.com',
    noteBase: 'Operador local, Surco',
    refresh: { method: 'peru-rent-a-car', productId: PERU_RENT_A_CAR_PRODUCTS.yaris } },
  { company: 'Perú Rent a Car', model: 'JAC Refine 2023', type: 'SUV', trans: 'Automática', seats: 5, bags: 3,
    insurance: false, freeCancel: false, gps: false, locations: ['Surco'],
    source: 'https://www.perurentacar.com/en/product/jac-refine-2023-2/', sourceLabel: 'perurentacar.com',
    noteBase: 'Operador local, Surco',
    refresh: { method: 'peru-rent-a-car', productId: PERU_RENT_A_CAR_PRODUCTS.jacRefine } },
  { company: 'Perú Rent a Car', model: 'Ford Territory', type: 'SUV', trans: 'Automática', seats: 5, bags: 3,
    insurance: false, freeCancel: false, gps: false, locations: ['Surco'],
    source: 'https://www.perurentacar.com/en/product/ford-territory/', sourceLabel: 'perurentacar.com',
    noteBase: 'Operador local, Surco',
    refresh: { method: 'peru-rent-a-car', productId: PERU_RENT_A_CAR_PRODUCTS.fordTerritory } },
  { company: 'Perú Rent a Car', model: 'Ford Explorer 2025', type: 'SUV', trans: 'Automática', seats: 7, bags: 4,
    insurance: false, freeCancel: false, gps: false, locations: ['Surco'],
    source: 'https://www.perurentacar.com/en/product/ford-explorer-2025/', sourceLabel: 'perurentacar.com',
    noteBase: 'Operador local, Surco',
    refresh: { method: 'peru-rent-a-car', productId: PERU_RENT_A_CAR_PRODUCTS.fordExplorer } },
  { company: 'Perú Rent a Car', model: 'Mercedes-Benz E200', type: 'Lujo', trans: 'Automática', seats: 5, bags: 3,
    insurance: false, freeCancel: false, gps: false, locations: ['Surco'],
    source: 'https://www.perurentacar.com/en/product/mercedes-benz-e200/', sourceLabel: 'perurentacar.com',
    noteBase: 'Operador local, Surco',
    refresh: { method: 'peru-rent-a-car', productId: PERU_RENT_A_CAR_PRODUCTS.mercedesE200 } },
  { company: 'Perú Rent a Car', model: 'BMW 520i', type: 'Lujo', trans: 'Automática', seats: 5, bags: 3,
    insurance: false, freeCancel: false, gps: false, locations: ['Surco'],
    source: 'https://www.perurentacar.com/en/product/bmw-520i/', sourceLabel: 'perurentacar.com',
    noteBase: 'Operador local, Surco',
    refresh: { method: 'peru-rent-a-car', productId: PERU_RENT_A_CAR_PRODUCTS.bmw520i } },
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}
async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function getFxRateUsdToPen() {
  const data = await fetchJson('https://open.er-api.com/v6/latest/USD');
  if (data.result !== 'success' || !data.rates || !data.rates.PEN) {
    throw new Error('Could not fetch USD->PEN exchange rate');
  }
  return data.rates.PEN;
}

async function getBudgetPrices() {
  const html = await fetchText('https://www.budgetperu.com/en/');
  const prices = {};
  const blockRe = /<h3 class="card-category__name">([\s\S]*?)<\/h3>[\s\S]*?<strong class="from">S\/([\d.]+)/g;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    prices[m[1].trim()] = Math.round(parseFloat(m[2]));
  }
  return prices; // e.g. { Cars: 88, SUVs: 180 }
}

async function getDionisioRanges() {
  const posts = await fetchJson(
    'https://dionisiorentacar.com/wp-json/wp/v2/posts?slug=precios-de-alquiler-de-autos-en-lima'
  );
  if (!posts.length) throw new Error('Dionisio pricing post not found');
  const html = posts[0].content.rendered;
  const rangeRe = /entre S\/(\d+) y S\/(\d+)/g;
  const ranges = [];
  let m;
  while ((m = rangeRe.exec(html)) !== null) {
    ranges.push({ low: parseInt(m[1], 10), high: parseInt(m[2], 10) });
  }
  if (ranges.length < 3) throw new Error(`Expected 3 Dionisio price ranges, found ${ranges.length}`);
  return ranges; // [económico, sedán, SUV/camioneta] in article order
}

async function getPeruRentACarPrice(productId) {
  const p = await fetchJson(`https://www.perurentacar.com/en/wp-json/wc/store/v1/products/${productId}`);
  const usd = Number(p.prices.price) / Math.pow(10, Number(p.prices.currency_minor_unit));
  return usd;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const fxRate = await getFxRateUsdToPen();
  console.log(`FX rate USD->PEN: ${fxRate}`);

  const budgetPrices = await getBudgetPrices();
  console.log('Budget Perú prices (S/):', budgetPrices);

  const dionisioRanges = await getDionisioRanges();
  console.log('Dionisio ranges (S/):', dionisioRanges);

  const cars = [];
  for (let i = 0; i < BASE_CARS.length; i++) {
    const base = BASE_CARS[i];
    const car = {
      id: i,
      company: base.company,
      model: base.model,
      type: base.type,
      trans: base.trans,
      seats: base.seats,
      bags: base.bags,
      rating: null,
      reviews: null,
      insurance: base.insurance,
      freeCancel: base.freeCancel,
      gps: base.gps,
      locations: base.locations,
      source: base.source,
      sourceLabel: base.sourceLabel,
      mileageUnlimited: !!base.mileageUnlimited,
    };

    if (!base.refresh) {
      car.price = base.price;
      car.priceAsOf = base.priceAsOf;
      car.priceLive = false;
      car.note = base.noteBase;
    } else if (base.refresh.method === 'budget-category') {
      const price = budgetPrices[base.refresh.category];
      if (price == null) throw new Error(`Budget category "${base.refresh.category}" not found on page`);
      car.price = price;
      car.priceAsOf = generatedAt;
      car.priceLive = true;
      car.note = base.noteBase;
    } else if (base.refresh.method === 'dionisio-range') {
      const range = dionisioRanges[base.refresh.index];
      car.price = range.low;
      car.priceAsOf = generatedAt;
      car.priceLive = true;
      car.note = `${base.noteBase} · rango informado S/${range.low}–${range.high} según modelo`;
    } else if (base.refresh.method === 'peru-rent-a-car') {
      const usd = await getPeruRentACarPrice(base.refresh.productId);
      car.price = Math.round(usd * fxRate);
      car.priceAsOf = generatedAt;
      car.priceLive = true;
      car.note = `${base.noteBase} · $${usd.toFixed(2)}/día según su web (tipo de cambio ${fxRate.toFixed(3)})`;
    }

    cars.push(car);
  }

  const output = { generatedAt, fxRateUsdToPen: fxRate, cars };
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote ${cars.length} cars to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error('Refresh failed:', err);
  process.exit(1);
});
