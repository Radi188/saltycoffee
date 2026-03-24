/**
 * Seed default users for Salty Coffee POS
 * Run AFTER the backend is started:
 *   node scripts/seed-users.js
 */

const BASE = 'http://localhost:3000'

const users = [
  {
    username: 'admin',
    password: 'salty@admin2026',
    name: 'Admin',
    role: 'admin',
  },
  {
    username: 'manager',
    password: 'salty@mgr2026',
    name: 'Manager',
    role: 'manager',
  },
  {
    username: 'cashier1',
    password: 'salty@pos2026',
    name: 'Cashier 1',
    role: 'cashier',
  },
]

async function createUser(user) {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  const data = await res.json()
  if (!res.ok) {
    if (data.message?.includes('already')) {
      console.log(`  ⚠  ${user.username} already exists — skipped`)
    } else {
      console.error(`  ✗  ${user.username}: ${data.message}`)
    }
    return
  }
  console.log(`  ✓  Created ${data.role}: ${data.username}  (${data.name})`)
}

console.log('\n☕  Seeding Salty Coffee users…\n')
Promise.all(users.map(createUser)).then(() => {
  console.log('\nDone! Login credentials:\n')
  users.forEach((u) => {
    console.log(`  ${u.role.padEnd(10)} username: ${u.username.padEnd(12)} password: ${u.password}`)
  })
  console.log()
})
