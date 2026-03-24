/**
 * Seeds categories, products with sizes, and toppings.
 * Run: node scripts/seed-products.js
 * Backend must be running at http://localhost:3000
 */

const BASE = 'http://localhost:3000'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path} → ${data.message || res.status}`)
  return data
}

// ── 1. Categories ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Coffee',      description: 'Espresso-based drinks',    sort_order: 1 },
  { name: 'Tea',         description: 'Tea & matcha drinks',      sort_order: 2 },
  { name: 'Cold Drinks', description: 'Juices, sodas & smoothies',sort_order: 3 },
  { name: 'Food',        description: 'Snacks & light meals',     sort_order: 4 },
]

// ── 2. Products: { name, category, base_price, sizes? }
//    sizes = [{label, price}] — if present, product is sized
const PRODUCTS = [
  // Coffee
  { name: 'Espresso',       category: 'Coffee', base_price: 2.50, sizes: [{ label:'S', price:2.50 },{ label:'M', price:3.00 },{ label:'L', price:3.50 }] },
  { name: 'Americano',      category: 'Coffee', base_price: 2.50, sizes: [{ label:'S', price:2.50 },{ label:'M', price:3.00 },{ label:'L', price:3.50 }] },
  { name: 'Latte',          category: 'Coffee', base_price: 3.00, sizes: [{ label:'S', price:3.00 },{ label:'M', price:3.50 },{ label:'L', price:4.00 }] },
  { name: 'Cappuccino',     category: 'Coffee', base_price: 3.00, sizes: [{ label:'S', price:3.00 },{ label:'M', price:3.50 },{ label:'L', price:4.00 }] },
  { name: 'Flat White',     category: 'Coffee', base_price: 3.00, sizes: [{ label:'S', price:3.00 },{ label:'M', price:3.50 },{ label:'L', price:4.00 }] },
  { name: 'Mocha',          category: 'Coffee', base_price: 3.50, sizes: [{ label:'S', price:3.50 },{ label:'M', price:4.00 },{ label:'L', price:4.50 }] },
  { name: 'Caramel Latte',  category: 'Coffee', base_price: 3.50, sizes: [{ label:'S', price:3.50 },{ label:'M', price:4.00 },{ label:'L', price:4.50 }] },
  { name: 'Cold Brew',      category: 'Coffee', base_price: 3.50, sizes: [{ label:'S', price:3.50 },{ label:'M', price:4.00 },{ label:'L', price:4.50 }] },
  // Tea
  { name: 'Green Tea Latte',category: 'Tea',    base_price: 3.00, sizes: [{ label:'S', price:3.00 },{ label:'M', price:3.50 },{ label:'L', price:4.00 }] },
  { name: 'Thai Milk Tea',  category: 'Tea',    base_price: 2.50, sizes: [{ label:'S', price:2.50 },{ label:'M', price:3.00 },{ label:'L', price:3.50 }] },
  { name: 'Matcha Latte',   category: 'Tea',    base_price: 3.50, sizes: [{ label:'S', price:3.50 },{ label:'M', price:4.00 },{ label:'L', price:4.50 }] },
  { name: 'Jasmine Tea',    category: 'Tea',    base_price: 2.00, sizes: [{ label:'S', price:2.00 },{ label:'M', price:2.50 },{ label:'L', price:3.00 }] },
  // Cold Drinks (no sizes)
  { name: 'Fresh Orange Juice', category: 'Cold Drinks', base_price: 3.00 },
  { name: 'Iced Lemon Tea',     category: 'Cold Drinks', base_price: 2.50 },
  { name: 'Mango Smoothie',     category: 'Cold Drinks', base_price: 4.00 },
  { name: 'Sparkling Water',    category: 'Cold Drinks', base_price: 1.50 },
  // Food (no sizes)
  { name: 'Butter Croissant',   category: 'Food', base_price: 2.50 },
  { name: 'Club Sandwich',      category: 'Food', base_price: 5.00 },
  { name: 'Cheesecake Slice',   category: 'Food', base_price: 4.00 },
  { name: 'Banana Bread',       category: 'Food', base_price: 3.00 },
]

// ── 3. Toppings ────────────────────────────────────────────────────────────
const TOPPINGS = [
  { name: 'Whipped Cream',  price: 0.50, sort_order: 1 },
  { name: 'Extra Shot',     price: 0.75, sort_order: 2 },
  { name: 'Caramel Syrup',  price: 0.50, sort_order: 3 },
  { name: 'Vanilla Syrup',  price: 0.50, sort_order: 4 },
  { name: 'Oat Milk',       price: 0.75, sort_order: 5 },
  { name: 'Brown Sugar',    price: 0.25, sort_order: 6 },
  { name: 'Honey',          price: 0.25, sort_order: 7 },
  { name: 'Boba / Tapioca', price: 0.75, sort_order: 8 },
  { name: 'Coconut Jelly',  price: 0.50, sort_order: 9 },
  { name: 'Sea Salt Foam',  price: 0.50, sort_order: 10 },
]

async function main() {
  // ── Categories ─────────────────────────────────────────────────────────────
  console.log('\n📂 Seeding categories…')
  const catMap = {}
  for (const cat of CATEGORIES) {
    try {
      const c = await req('POST', '/categories', { ...cat, is_active: true })
      catMap[cat.name] = c.id
      console.log(`  ✓ ${cat.name}`)
    } catch (e) {
      // May already exist — try to fetch
      const all = await req('GET', '/categories')
      const found = all.find((c) => c.name === cat.name)
      if (found) { catMap[cat.name] = found.id; console.log(`  ~ ${cat.name} (exists)`) }
      else throw e
    }
  }

  // ── Products + Sizes ───────────────────────────────────────────────────────
  console.log('\n☕ Seeding products & sizes…')
  for (const p of PRODUCTS) {
    let product
    try {
      product = await req('POST', '/products', {
        name: p.name,
        base_price: p.base_price,
        category_id: catMap[p.category],
        is_active: true,
      })
      console.log(`  ✓ ${p.name}`)
    } catch (e) {
      console.log(`  ✗ ${p.name}: ${e.message}`)
      continue
    }

    if (p.sizes) {
      for (let i = 0; i < p.sizes.length; i++) {
        const s = p.sizes[i]
        try {
          await req('POST', '/product-sizes', {
            product_id: product.id,
            size_label: s.label,
            price: s.price,
            sort_order: i,
            is_active: true,
          })
        } catch (e) {
          console.log(`    ✗ size ${s.label}: ${e.message}`)
        }
      }
      console.log(`    └─ sizes: ${p.sizes.map((s) => s.label).join(', ')}`)
    }
  }

  // ── Toppings ───────────────────────────────────────────────────────────────
  console.log('\n🧋 Seeding toppings…')
  for (const t of TOPPINGS) {
    try {
      await req('POST', '/toppings', { ...t, is_active: true })
      console.log(`  ✓ ${t.name}`)
    } catch (e) {
      console.log(`  ✗ ${t.name}: ${e.message}`)
    }
  }

  console.log('\n✅ Seed complete!')
}

main().catch((err) => { console.error('\n✗ Fatal:', err.message); process.exit(1) })
