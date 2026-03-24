#!/usr/bin/env node
// seed-menu.js — seeds categories and toppings
const BASE = 'http://localhost:3000'

const categories = [
  { name: 'Matcha',         description: 'Matcha-based drinks',     sort_order: 1, is_active: true },
  { name: 'Coffee Time',    description: 'Classic coffee drinks',    sort_order: 2, is_active: true },
  { name: 'Tiramisu Verse', description: 'Tiramisu-inspired drinks', sort_order: 3, is_active: true },
  { name: 'Sweet Tea',      description: 'Sweet tea beverages',      sort_order: 4, is_active: true },
  { name: 'Fresh Tea',      description: 'Fresh brewed teas',        sort_order: 5, is_active: true },
]

// Prices in KHR → USD (÷ 4000)
const toppings = [
  { name: 'Caramel Cake',  price: 2500 / 4000, sort_order: 1, is_active: true },
  { name: 'Pearl',         price: 1000 / 4000, sort_order: 2, is_active: true },
  { name: 'Crystal Pearl', price: 1000 / 4000, sort_order: 3, is_active: true },
  { name: 'Cream Mochi',   price: 2000 / 4000, sort_order: 4, is_active: true },
  { name: 'Cream Egg',     price: 2000 / 4000, sort_order: 5, is_active: true },
  { name: 'Salty Cream',   price: 2000 / 4000, sort_order: 6, is_active: true },
]

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

async function seed() {
  console.log('\n── Categories ─────────────────────────────')
  for (const cat of categories) {
    try {
      const created = await post('/categories', cat)
      console.log(`  ✓  ${created.name}`)
    } catch (err) {
      if (err.message.toLowerCase().includes('already') || err.message.includes('duplicate') || err.message.includes('unique')) {
        console.log(`  –  ${cat.name} (already exists)`)
      } else {
        console.error(`  ✗  ${cat.name}: ${err.message}`)
      }
    }
  }

  console.log('\n── Toppings ───────────────────────────────')
  for (const top of toppings) {
    try {
      const created = await post('/toppings', top)
      const khr = Math.round(top.price * 4000)
      console.log(`  ✓  ${created.name} ($${top.price.toFixed(4)} / ៛${khr})`)
    } catch (err) {
      if (err.message.toLowerCase().includes('already') || err.message.includes('duplicate') || err.message.includes('unique')) {
        console.log(`  –  ${top.name} (already exists)`)
      } else {
        console.error(`  ✗  ${top.name}: ${err.message}`)
      }
    }
  }

  console.log('\nDone.\n')
}

seed().catch((err) => { console.error(err); process.exit(1) })
