import { useState, useEffect, useRef, useCallback } from 'react'
import { TrendingUp, ShoppingBag, BarChart2, Wallet, Tag, Clock as ClockIcon, Coffee, Leaf, Droplets, Gem, Candy, User, Search, X, Trash2, AlertTriangle } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'
import { useCurrency } from '../context/CurrencyContext'
import ShiftModal from './ShiftModal'
import CheckoutModal from './CheckoutModal'
import ReceiptModal from './ReceiptModal'
import ProductCustomizeModal from './ProductCustomizeModal'

// Per-category accent colours + placeholder icon
const CAT_THEME = {
  'coffee time':    { accent: '#B8742A', bg: '#241A0E', pill: 'rgba(184,116,42,.18)', text: '#D4935A', Icon: Coffee },
  'tiramisu verse': { accent: '#8B5CF6', bg: '#1A1228', pill: 'rgba(139,92,246,.18)', text: '#A78BFA', Icon: Gem },
  'sweet tea':      { accent: '#16A34A', bg: '#0D1F14', pill: 'rgba(22,163,74,.18)',  text: '#4ADE80', Icon: Droplets },
  'fresh tea':      { accent: '#0891B2', bg: '#0A1A20', pill: 'rgba(8,145,178,.18)',  text: '#38BDF8', Icon: Leaf },
  'matcha':         { accent: '#65A30D', bg: '#111A08', pill: 'rgba(101,163,13,.18)', text: '#A3E635', Icon: Leaf },
  'gummy':          { accent: '#E11D48', bg: '#200A10', pill: 'rgba(225,29,72,.18)',  text: '#FB7185', Icon: Candy },
}
const CAT_DEFAULT = { accent: '#6B7280', bg: '#1A1A1A', pill: 'rgba(107,114,128,.15)', text: '#9CA3AF', Icon: Coffee }

function catTheme(name) {
  return CAT_THEME[name?.toLowerCase()] ?? CAT_DEFAULT
}

// ── Clock ──────────────────────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="time-display">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      <span style={{ color: 'var(--muted)', marginLeft: 6, fontSize: 11 }}>
        {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </span>
    </div>
  )
}

// ── Customer Search ────────────────────────────────────────────────────────
function CustomerSearch({ selected, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const all = await api.getCustomers()
        setResults(
          (all ?? []).filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.phone && c.phone.includes(query))
          ).slice(0, 6)
        )
        setOpen(true)
      } catch { setResults([]) }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (selected) {
    return (
      <div
        className="customer-selector"
        onClick={() => { onSelect(null); setQuery('') }}
        title="Click to remove customer"
      >
        <span className="customer-icon"><User size={14} /></span>
        <div style={{ flex: 1 }}>
          <div className="customer-name set">{selected.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{selected.tier} · {selected.phone || 'No phone'}</div>
        </div>
        <span style={{ color: 'var(--muted)', display: 'flex' }}><X size={12} /></span>
      </div>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative', margin: '8px 12px 0' }}>
      <input
        className="input"
        placeholder="Search customer…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => query && setOpen(true)}
        style={{ height: 38, fontSize: 13 }}
      />
      {open && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((c) => (
            <div key={c.id} className="search-option" onClick={() => { onSelect(c); setOpen(false); setQuery('') }}>
              <span style={{ color: 'var(--cream)' }}>{c.name}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 8 }}>{c.tier} · {c.phone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main POS Screen ────────────────────────────────────────────────────────
export default function POSScreen({ user, shift, onShiftChange, onLogout }) {
  const toast = useToast()
  const { fmt, fmtBoth, base, toggleBase, rate } = useCurrency()

  // Data
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [activeCat, setActiveCat] = useState(null)

  // Cart
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState(null)

  // Modals
  const [showShift,      setShowShift]      = useState(false)
  const [showCheckout,   setShowCheckout]   = useState(false)
  const [receiptData,    setReceiptData]    = useState(null)
  const [customizeProduct, setCustomizeProduct] = useState(null)

  // Search
  const [search, setSearch] = useState('')

  // Shift stats
  const [stats, setStats] = useState(null)

  const fetchStats = useCallback(async () => {
    if (!shift?.id) return
    try {
      const s = await api.getShiftSummary(shift.id)
      setStats(s)
    } catch { /* silent */ }
  }, [shift?.id])

  // Toppings — loaded once at POS mount so the modal opens instantly
  const [toppings, setToppings] = useState([])
  useEffect(() => {
    api.getToppings().then(setToppings).catch(() => {})
  }, [])

  const [loadingCats, setLoadingCats] = useState(true)

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoadingCats(false))
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    setLoadingProducts(true)
    api.getProducts(activeCat)
      .then((data) => setProducts((data ?? []).filter((p) => p.is_active !== false)))
      .catch(() => toast('Failed to load products', 'error'))
      .finally(() => setLoadingProducts(false))
  }, [activeCat])

  // ── Cart helpers ─────────────────────────────────────────────────────────
  // Called by ProductCustomizeModal with fully resolved item (size + toppings baked in)
  const addItem = useCallback((item) => {
    setCart((prev) => {
      // Match by product id + size + toppings combo
      const key = item._customKey ?? item.id
      const idx = prev.findIndex((i) => (i._customKey ?? i.id) === key)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity }
        return next
      }
      return [...prev, item]
    })
  }, [])

  const updateQty = useCallback((key, delta) => {
    setCart((prev) => {
      const next = prev.map((i) => (i._customKey ?? i.id) === key ? { ...i, quantity: i.quantity + delta } : i)
      return next.filter((i) => i.quantity > 0)
    })
  }, [])

  const clearCart = () => { setCart([]); setCustomer(null) }

  // ── Derived ──────────────────────────────────────────────────────────────
  const cartTotal   = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const cartCount   = cart.reduce((s, i) => s + i.quantity, 0)

  const filteredProducts = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  // ── Product card renderer ─────────────────────────────────────────────────
  const renderCard = (product, theme, catName) => {
    const cartQty = cart.filter((i) => i.id === product.id).reduce((s, i) => s + i.quantity, 0)
    const activeSizes = (product.product_sizes ?? [])
      .filter((s) => s.is_active !== false)
      .sort((a, b) => a.sort_order - b.sort_order)
    const displayPrice = activeSizes.length > 0 ? activeSizes[0].price : product.base_price
    const prices = fmtBoth(displayPrice)
    return (
      <div key={product.id} className="product-card" onClick={() => setCustomizeProduct(product)}>
        <div className="product-card-thumb" style={{ background: theme.bg }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} />
            : (
              <div className="product-card-placeholder" style={{ color: theme.text }}>
                <span className="product-card-placeholder-icon"><theme.Icon size={28} /></span>
              </div>
            )
          }
        </div>
        {cartQty > 0 && <div className="product-card-qty">{cartQty}</div>}
        <div className="product-card-body">
          <div className="product-card-name">{product.name}</div>
          <div className="product-card-prices">
            {activeSizes.length > 1 && <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '.04em', textTransform: 'uppercase' }}>from </span>}
            <span className="product-card-price-usd">{prices.primary}</span>
            <span className="product-card-price-khr">{prices.secondary}</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Receipt done ─────────────────────────────────────────────────────────
  const handlePaymentSuccess = ({ receipt, invoice, order }) => {
    setShowCheckout(false)
    setReceiptData({ receipt, invoice, order })
    clearCart()
    fetchStats()
  }

  const handleNewSale = () => {
    setReceiptData(null)
    clearCart()
  }

  return (
    <div className="pos-root">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="pos-header">
        <div className="pos-header-logo">
          <img src="/logo.jpg" alt="Salty Coffee" />
          <div className="pos-header-brand">
            <span className="name">Salty Coffee</span>
            <span className="sub">Cafe · POS</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <input
            className="input"
            placeholder="Quick search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ height: 36, paddingLeft: 36, fontSize: 13 }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex' }}><Search size={14} /></span>
          {search && (
            <button
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}
              onClick={() => setSearch('')}
            ><X size={14} /></button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Currency toggle */}
          <div className="currency-toggle">
            <button className={base === 'USD' ? 'active' : ''} onClick={() => base !== 'USD' && toggleBase()}>$ USD</button>
            <button className={base === 'KHR' ? 'active' : ''} onClick={() => base !== 'KHR' && toggleBase()}>៛ KHR</button>
          </div>

          <Clock />

          {/* Shift button */}
          <div className="shift-status-bar" onClick={() => setShowShift(true)}>
            <div className={`shift-dot ${shift ? 'open' : 'closed'}`} />
            <span style={{ color: shift ? 'var(--success)' : 'var(--muted)' }}>
              {shift ? shift.shift_number : 'No Shift'}
            </span>
          </div>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px', background: 'var(--elevated)', borderRadius: 99, border: '1px solid var(--divider)' }}>
            <User size={13} style={{ color: 'var(--muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--cream-2)' }}>{user.name}</span>
            {user.branches?.name && (
              <>
                <span style={{ color: 'var(--divider)', fontSize: 12 }}>|</span>
                <span style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '.04em' }}>{user.branches.name}</span>
              </>
            )}
          </div>

          <button className="btn btn-ghost" style={{ height: 34, fontSize: 12, padding: '0 12px' }} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ── Shift Stats Bar ─────────────────────────────────────────── */}
      {shift && (() => {
        const s        = stats?.summary
        const sd       = stats?.shift
        const orders   = s?.total_receipts ?? 0
        const revenue  = s?.total_sales    ?? 0
        const discount = s?.total_discount ?? 0
        const avgOrder = orders > 0 ? revenue / orders : 0
        const cashIn   = s?.by_payment_method?.cash?.total ?? 0
        const drawer   = (sd?.opening_cash ?? 0) + cashIn
        const mins     = sd?.opened_at
          ? Math.round((Date.now() - new Date(sd.opened_at).getTime()) / 60000) : 0
        const duration = mins >= 60 ? `${Math.floor(mins/60)}h ${mins % 60}m` : `${mins}m`

        const STATS = [
          {
            Icon: TrendingUp, color: '#D4935A', bg: 'rgba(184,116,42,.15)',
            label: 'Shift Revenue',
            value: `$${revenue.toFixed(2)}`,
            sub: `≈ ៛${Math.round(revenue * rate).toLocaleString()}`,
          },
          {
            Icon: ShoppingBag, color: '#4ADE80', bg: 'rgba(74,222,128,.12)',
            label: 'Total Orders',
            value: String(orders),
            sub: orders === 1 ? 'transaction' : 'transactions',
          },
          {
            Icon: BarChart2, color: '#60A5FA', bg: 'rgba(96,165,250,.12)',
            label: 'Avg Order',
            value: `$${avgOrder.toFixed(2)}`,
            sub: 'per transaction',
          },
          {
            Icon: Wallet, color: '#34D399', bg: 'rgba(52,211,153,.12)',
            label: 'Cash Drawer',
            value: `$${drawer.toFixed(2)}`,
            sub: `Opening $${(sd?.opening_cash ?? 0).toFixed(2)}`,
          },
          {
            Icon: Tag, color: '#F87171', bg: 'rgba(248,113,113,.12)',
            label: 'Discounts',
            value: discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00',
            sub: discount > 0 ? `≈ ៛${Math.round(discount * rate).toLocaleString()}` : 'none this shift',
          },
          {
            Icon: ClockIcon, color: '#A78BFA', bg: 'rgba(167,139,250,.12)',
            label: 'Shift Time',
            value: duration,
            sub: shift.shift_number,
          },
        ]

        return (
          <div className="pos-stats-bar">
            {STATS.map(({ Icon, color, bg, label, value, sub }) => (
              <div key={label} className="pos-stat" style={{ '--stat-color': color, '--stat-bg': bg }}>
                <div className="pos-stat-icon">
                  <Icon size={17} color={color} strokeWidth={2} />
                </div>
                <div className="pos-stat-body">
                  <span className="pos-stat-label">{label}</span>
                  <span className="pos-stat-value">{value}</span>
                  <span className="pos-stat-sub">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* ── Left Panel ──────────────────────────────────────────────── */}
      <div className="pos-left">
        {/* Category bar */}
        <div className="category-bar">
          {loadingCats
            ? [72, 88, 64, 80, 56, 76].map((w, i) => (
                <div key={i} className="skeleton-pill" style={{ width: w }} />
              ))
            : (
              <>
                <button className={`cat-btn ${activeCat === null ? 'active' : ''}`} onClick={() => setActiveCat(null)}>
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`cat-btn ${activeCat === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </>
            )
          }
        </div>

        {/* Products */}
        <div className="products-scroll">
          {loadingProducts
            ? (
              <div className="products-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-thumb" />
                    <div className="skeleton-body">
                      <div className="skeleton-line" style={{ width: '45%', height: 8 }} />
                      <div className="skeleton-line" style={{ width: '80%', height: 12, marginTop: 2 }} />
                      <div className="skeleton-line" style={{ width: '60%', height: 11, marginTop: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            )
            : filteredProducts.length === 0
              ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', color: 'var(--muted)', gap: 10 }}>
                  <Coffee size={36} />
                  <p>{search ? `No products matching "${search}"` : 'No products found'}</p>
                </div>
              )
              : activeCat === null
                ? /* ── All: grouped by category ── */
                  (() => {
                    const grouped = []
                    const seen = {}
                    for (const p of filteredProducts) {
                      const name = p.categories?.name ?? p.category ?? 'Other'
                      if (!seen[name]) { seen[name] = []; grouped.push({ name, items: seen[name] }) }
                      seen[name].push(p)
                    }
                    return grouped.map(({ name, items }) => {
                      const theme = catTheme(name)
                      return (
                        <div key={name} className="cat-section">
                          <div className="cat-section-header">
                            <div className="cat-section-bar" style={{ background: theme.accent }} />
                            <span className="cat-section-title" style={{ color: theme.text }}>{name}</span>
                            <span className="cat-section-count">{items.length} items</span>
                          </div>
                          <div className="products-grid">
                            {items.map((product) => renderCard(product, theme, name))}
                          </div>
                        </div>
                      )
                    })
                  })()
                : /* ── Single category ── */
                  <div className="products-grid">
                    {filteredProducts.map((product) => {
                      const catName = product.categories?.name ?? product.category ?? 'Other'
                      return renderCard(product, catTheme(catName), catName)
                    })}
                  </div>
          }
        </div>
      </div>

      {/* ── Right Panel (Cart) ───────────────────────────────────────── */}
      <div className="pos-right">
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>Current Order {cartCount > 0 && <span style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-m)' }}>({cartCount})</span>}</h3>
            {cart.length > 0 && (
              <button className="btn-icon" title="Clear order" onClick={clearCart} style={{ width: 28, height: 28 }}><Trash2 size={14} /></button>
            )}
          </div>
        </div>

        {/* Customer */}
        <CustomerSearch selected={customer} onSelect={setCustomer} />

        {/* Items */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon"><Coffee size={36} /></span>
              <p style={{ fontSize: 14 }}>Cart is empty</p>
              <p style={{ fontSize: 12 }}>Tap a product to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._customKey ?? item.id} className="cart-item">
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  {item.size_label && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-m)', marginTop: 1 }}>
                      Size {item.size_label}
                    </div>
                  )}
                  {item.selected_toppings?.length > 0 && (
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1, lineHeight: 1.4 }}>
                      {item.selected_toppings.map((t) => t.name).join(' · ')}
                    </div>
                  )}
                  <div className="cart-item-price">{fmtBoth(item.unit_price).primary} each</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ fontFamily: 'var(--font-m)', fontSize: 14, color: 'var(--cream)' }}>
                    {fmtBoth(item.unit_price * item.quantity).primary}
                  </div>
                  <div style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--muted)' }}>
                    {fmtBoth(item.unit_price * item.quantity).secondary}
                  </div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQty(item._customKey ?? item.id, -1)}>−</button>
                    <span className="qty-num">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item._customKey ?? item.id, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cart-footer">
          {cart.length > 0 && (
            <div className="cart-totals">
              <div className="total-row">
                <span className="total-label">Subtotal</span>
                <div style={{ textAlign: 'right' }}>
                  <div className="total-sub">{fmtBoth(cartTotal).primary}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-m)' }}>{fmtBoth(cartTotal).secondary}</div>
                </div>
              </div>
              <div className="total-row">
                <span className="total-label" style={{ fontSize: 11, color: 'var(--success)' }}>Discounts applied at checkout</span>
              </div>
              <div className="total-row final">
                <span>Total</span>
                <div style={{ textAlign: 'right' }}>
                  <div className="total-amount">{fmtBoth(cartTotal).primary}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-m)', fontWeight: 400 }}>{fmtBoth(cartTotal).secondary}</div>
                </div>
              </div>
            </div>
          )}

          {!shift && (
            <div style={{ background: 'rgba(224,85,85,.1)', border: '1px solid rgba(224,85,85,.2)', borderRadius: 'var(--r)', padding: '8px 12px', marginBottom: 8, fontSize: 12.5, color: 'var(--danger)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <AlertTriangle size={14} /> No active shift. <button onClick={() => setShowShift(true)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', textDecoration: 'underline', fontSize: 12.5 }}>Open shift</button>
            </div>
          )}

          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
          >
            Checkout · {fmtBoth(cartTotal).primary} →
          </button>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {showShift && (
        <ShiftModal
          user={user}
          shift={shift}
          onShiftChange={onShiftChange}
          onClose={() => setShowShift(false)}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          customer={customer}
          shift={shift}
          user={user}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {receiptData && (
        <ReceiptModal
          receipt={receiptData.receipt}
          invoice={receiptData.invoice}
          order={receiptData.order}
          onClose={() => setReceiptData(null)}
          onNewSale={handleNewSale}
        />
      )}

      {customizeProduct && (
        <ProductCustomizeModal
          product={customizeProduct}
          toppings={toppings}
          onAdd={addItem}
          onClose={() => setCustomizeProduct(null)}
        />
      )}
    </div>
  )
}
