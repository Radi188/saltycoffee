#!/usr/bin/env node
// seed-full-menu.js — wipes all products and re-seeds from the Ambel menu
// Run: node scripts/seed-full-menu.js
const BASE = 'http://localhost:3000'

// ── Exchange rate: 1 USD = 4000 KHR ────────────────────────────────────────
const R = 4000
const r = (khr) => parseFloat((khr / R).toFixed(4))

// ── Menu data ───────────────────────────────────────────────────────────────
// format: { name, category, base_price (S price or only price), sizes: [{label,price}] }
const MENU = [
  // ── COFFEE TIME ────────────────────────────────────────────────────────
  { name: 'Ice Cafe',            category: 'Coffee Time',    base: r(3000), sizes: [{ label: 'S', price: r(3000) }, { label: 'L', price: r(5000) }] },
  { name: 'Ice Latte',           category: 'Coffee Time',    base: r(4000), sizes: [{ label: 'S', price: r(4000) }, { label: 'L', price: r(5500) }] },
  { name: 'Milk Cafe',           category: 'Coffee Time',    base: r(4000), sizes: [{ label: 'S', price: r(4000) }, { label: 'L', price: r(5500) }] },
  { name: 'Ambel Cafe',          category: 'Coffee Time',    base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Egg Cream Cafe',      category: 'Coffee Time',    base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Cafe Mochi',          category: 'Coffee Time',    base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Chocolate Mochi',     category: 'Coffee Time',    base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Chocolate Egg Cream', category: 'Coffee Time',    base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },

  // ── TIRAMISU VERSE (L only) ─────────────────────────────────────────────
  { name: 'Milktea Tiramisu',    category: 'Tiramisu Verse', base: r(8000), sizes: [{ label: 'L', price: r(8000) }] },
  { name: 'Coffee Tiramisu',     category: 'Tiramisu Verse', base: r(8000), sizes: [{ label: 'L', price: r(8000) }] },
  { name: 'Chocolate Tiramisu',  category: 'Tiramisu Verse', base: r(8000), sizes: [{ label: 'L', price: r(8000) }] },
  { name: 'Mocha Tiramisu',      category: 'Tiramisu Verse', base: r(8000), sizes: [{ label: 'L', price: r(8000) }] },
  { name: 'Greentea Tiramisu',   category: 'Tiramisu Verse', base: r(8000), sizes: [{ label: 'L', price: r(8000) }] },

  // ── SWEET TEA ───────────────────────────────────────────────────────────
  { name: 'Green Tea Mochi',     category: 'Sweet Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Green Tea Egg Cream', category: 'Sweet Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Thai Tea Mochi',      category: 'Sweet Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Thai Tea Egg Cream',  category: 'Sweet Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Jasmine Mochi',       category: 'Sweet Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Jasmine Salty',       category: 'Sweet Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },

  // ── FRESH TEA ───────────────────────────────────────────────────────────
  { name: 'Passion Tea',         category: 'Fresh Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Passion Cream',       category: 'Fresh Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Lemon Chia Tea',      category: 'Fresh Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Strawberry Mochi',    category: 'Fresh Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },
  { name: 'Strawberry Fresh Tea',category: 'Fresh Tea',      base: r(5000), sizes: [{ label: 'S', price: r(5000) }, { label: 'L', price: r(7000) }] },

  // ── MATCHA ──────────────────────────────────────────────────────────────
  { name: 'Matcha Cream',        category: 'Matcha',         base: 1.75, sizes: [] },
  { name: 'Matcha Latte',        category: 'Matcha',         base: 1.75, sizes: [] },
  { name: 'Matcha Salt',         category: 'Matcha',         base: 1.75, sizes: [] },
  { name: 'Matcha Salt Egg',     category: 'Matcha',         base: 1.75, sizes: [] },
  { name: 'Matcha Tofu',         category: 'Matcha',         base: 1.75, sizes: [] },
  { name: 'Matcha Strawberry',   category: 'Matcha',         base: 2.50, sizes: [] },
  { name: 'Matcha Spirulina',    category: 'Matcha',         base: 2.50, sizes: [] },
  { name: 'Matcha Cheese Cream', category: 'Matcha',         base: 1.75, sizes: [] },
  { name: 'Matcha Egg Cream',    category: 'Matcha',         base: 1.75, sizes: [] },

  // ── GUMMY ───────────────────────────────────────────────────────────────
  { name: 'Gummy Coffee',        category: 'Gummy',          base: r(10000), sizes: [] },
  { name: 'Matcha Gummy',        category: 'Gummy',          base: r(13000), sizes: [] },
  { name: 'Chocolate Gummy',     category: 'Gummy',          base: r(10000), sizes: [] },
]

const CATEGORIES = [
  { name: 'Coffee Time',    sort_order: 1 },
  { name: 'Tiramisu Verse', sort_order: 2 },
  { name: 'Sweet Tea',      sort_order: 3 },
  { name: 'Fresh Tea',      sort_order: 4 },
  { name: 'Matcha',         sort_order: 5 },
  { name: 'Gummy',          sort_order: 6 },
]

// ── HTTP helpers ─────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

const get  = (path)       => api('GET',    path)
const post = (path, body) => api('POST',   path, body)
const del  = (path)       => api('DELETE', path)

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  // 1. Delete all existing products
  console.log('\n── Clearing existing products ─────────────────')
  const existing = await get('/products')
  for (const p of existing) {
    await del(`/products/${p.id}`)
    process.stdout.write(`  ✗  removed: ${p.name}\n`)
  }
  console.log(`  Done — removed ${existing.length} products`)

  // 2. Ensure all categories exist, build name→id map
  console.log('\n── Ensuring categories ────────────────────────')
  const catMap = {}
  const existingCats = await get('/categories')
  for (const ec of existingCats) catMap[ec.name] = ec.id

  for (const cat of CATEGORIES) {
    if (catMap[cat.name]) {
      console.log(`  –  ${cat.name} (already exists)`)
    } else {
      try {
        const c = await post('/categories', { name: cat.name, sort_order: cat.sort_order, is_active: true })
        catMap[c.name] = c.id
        console.log(`  ✓  created: ${c.name}`)
      } catch (e) { console.error(`  ✗  ${cat.name}: ${e.message}`) }
    }
  }

  // 3. Create products + sizes
  console.log('\n── Seeding products ────────────────────────────')
  let ok = 0, fail = 0
  for (const item of MENU) {
    try {
      const category_id = catMap[item.category]
      if (!category_id) throw new Error(`Category not found: ${item.category}`)

      const product = await post('/products', {
        name: item.name,
        base_price: parseFloat(item.base.toFixed(4)),
        category_id,
        is_active: true,
      })

      // Create sizes if any
      for (let i = 0; i < item.sizes.length; i++) {
        const sz = item.sizes[i]
        await post('/product-sizes', {
          product_id: product.id,
          size_label: sz.label,
          price: parseFloat(sz.price.toFixed(4)),
          sort_order: i,
          is_active: true,
        })
      }

      const khrBase = Math.round(item.base * R)
      const sizeStr = item.sizes.length
        ? `[${item.sizes.map(s => `${s.label}: ៛${Math.round(s.price * R)}`).join(', ')}]`
        : `฿${khrBase}r`
      console.log(`  ✓  ${item.name.padEnd(26)} ${sizeStr}`)
      ok++
    } catch (e) {
      console.error(`  ✗  ${item.name}: ${e.message}`)
      fail++
    }
  }

  console.log(`\n── Done: ${ok} created, ${fail} failed ──────────────\n`)
}

seed().catch(e => { console.error(e); process.exit(1) })
