#!/usr/bin/env node
// reset-passwords.js — sets all cashier/staff passwords to 123456
// Run: node scripts/reset-passwords.js
const BASE = 'http://localhost:3000'

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

async function run() {
  const users = await api('GET', '/users')
  console.log(`Found ${users.length} users\n`)

  for (const u of users) {
    try {
      await api('PUT', `/users/${u.id}`, { password: '123456' })
      console.log(`  ✓  ${u.username.padEnd(20)} (${u.role})`)
    } catch (e) {
      console.error(`  ✗  ${u.username}: ${e.message}`)
    }
  }

  console.log('\nDone — all passwords set to 123456')
}

run().catch(e => { console.error(e); process.exit(1) })
