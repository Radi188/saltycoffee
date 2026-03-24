/**
 * Seeds the default USD→KHR exchange rate (1 USD = 4000 KHR).
 * Run: node scripts/seed-exchange-rate.js
 * Backend must be running at http://localhost:3000
 */

const BASE = 'http://localhost:3000'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

async function main() {
  const today = new Date().toISOString().slice(0, 10)
  console.log('Seeding exchange rate: 1 USD = 4000 KHR ...')
  const rate = await post('/exchange-rates', {
    from_currency: 'USD',
    to_currency: 'KHR',
    rate: 4000,
    effective_date: today,
    is_active: true,
  })
  console.log('✓ Exchange rate created:', rate)
}

main().catch((err) => { console.error('✗', err.message); process.exit(1) })
