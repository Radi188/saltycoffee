import { useState, useEffect, useRef } from 'react'
import { Banknote, CreditCard, QrCode, Landmark, User, X, Search, Settings2 } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'
import { useCurrency } from '../context/CurrencyContext'

const PAYMENT_METHODS = [
  { code: 'cash',          label: 'Cash',         Icon: Banknote },
  { code: 'card',          label: 'Card',          Icon: CreditCard },
  { code: 'qr',            label: 'QR Code',       Icon: QrCode },
  { code: 'bank_transfer', label: 'Bank Transfer', Icon: Landmark },
]

// ── Inline customer search ────────────────────────────────────────────────
function CustomerPicker({ value, onChange }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen]       = useState(false)
  const ref = useRef()

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const all = await api.getCustomers()
        setResults((all ?? []).filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || (c.phone && c.phone.includes(query))).slice(0, 5))
        setOpen(true)
      } catch { setResults([]) }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  if (value) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--elevated)', border: '1px solid var(--divider)', borderRadius: 8, padding: '7px 10px' }}>
      <User size={13} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{value.name}</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'capitalize' }}>{value.tier} · {value.phone || 'No phone'}</div>
      </div>
      <button onClick={() => onChange(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
    </div>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        style={{ width: '100%', boxSizing: 'border-box', background: 'var(--elevated)', border: '1px solid var(--divider)', borderRadius: 8, padding: '7px 10px', fontSize: 12.5, color: 'var(--cream)', outline: 'none' }}
        placeholder="Search customer…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
      />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, zIndex: 50, marginTop: 4, overflow: 'hidden' }}>
          {results.map((c) => (
            <div key={c.id} onClick={() => { onChange(c); setQuery(''); setOpen(false) }}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12.5, color: 'var(--cream-2)', borderBottom: '1px solid var(--divider)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {c.name} <span style={{ color: 'var(--muted)', fontSize: 11 }}>· {c.tier} · {c.phone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CheckoutModal({ cart, customer: customerProp, shift, user, onSuccess, onClose }) {
  const toast = useToast()
  const { rate, fmtBoth } = useCurrency()

  const [step,        setStep]    = useState('payment')
  const [method,      setMethod]  = useState('cash')
  const [activeField, setActive]  = useState('usd')
  const [usdStr,      setUsdStr]  = useState('')
  const [khrStr,      setKhrStr]  = useState('')
  const [loading,     setLoading] = useState(false)
  const [statusMsg,   setStatus]  = useState('')

  // Customer (can be changed inside modal)
  const [customer, setCustomer] = useState(customerProp ?? null)

  // Invoice-level manual discount
  const [discMethod, setDiscMethod] = useState('percentage')  // 'percentage' | 'fixed'
  const [discValue,  setDiscValue]  = useState('')

  // Per-item discounts: { [itemKey]: { method: 'percentage'|'fixed', value: '' } }
  const [itemDiscs,    setItemDiscs]    = useState({})
  const [expandedItem, setExpandedItem] = useState(null)  // key of item with open discount row

  // Customer auto-discounts preview
  const [customerDiscs, setCustomerDiscs] = useState([])

  const itemKey = (i) => i._customKey ?? i.id

  // Fetch auto-discounts for selected customer
  useEffect(() => {
    if (!customer) { setCustomerDiscs([]); return }
    api.getDiscounts().then((all) => {
      setCustomerDiscs((all ?? []).filter((d) =>
        d.type === 'customer' && d.is_active &&
        (d.customer_id === customer.id || (d.customer_tier && d.customer_tier === customer.tier))
      ))
    }).catch(() => {})
  }, [customer])

  const getItemDisc = (i) => itemDiscs[itemKey(i)] ?? { method: 'percentage', value: '' }

  const setItemDisc = (i, patch) =>
    setItemDiscs((prev) => ({ ...prev, [itemKey(i)]: { ...getItemDisc(i), ...patch } }))

  const itemDiscAmt = (i) => {
    const d = itemDiscs[itemKey(i)]
    if (!d || !d.value || parseFloat(d.value) <= 0) return 0
    const base = i.unit_price * i.quantity
    return d.method === 'percentage'
      ? parseFloat((base * parseFloat(d.value) / 100).toFixed(4))
      : Math.min(parseFloat(d.value), base)
  }

  // ── Totals (USD is source of truth) ────────────────────────────────────
  const subtotalUSD   = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const itemDiscTotal = cart.reduce((s, i) => s + itemDiscAmt(i), 0)
  const afterItemDisc = subtotalUSD - itemDiscTotal

  const invoiceDiscAmt = discValue && parseFloat(discValue) > 0
    ? (discMethod === 'percentage'
      ? afterItemDisc * parseFloat(discValue) / 100
      : parseFloat(discValue))
    : 0
  const afterInvoiceDisc = Math.max(0, afterItemDisc - invoiceDiscAmt)

  // Customer auto-discounts — preview only, applied server-side
  const customerDiscTotal = customerDiscs.reduce((s, d) => {
    const amt = d.discount_method === 'percentage'
      ? afterInvoiceDisc * d.discount_value / 100
      : Math.min(d.discount_value, afterInvoiceDisc)
    return s + amt
  }, 0)

  const totalUSD  = Math.max(0, afterInvoiceDisc - customerDiscTotal)
  const totalKHR  = Math.round(totalUSD * rate)

  // ── Paid amounts ────────────────────────────────────────────────────────
  const usdPaid      = parseFloat(usdStr) || 0
  const khrPaid      = parseFloat(khrStr) || 0
  const totalPaidUSD = usdPaid + khrPaid / rate
  const sufficient   = method !== 'cash' || totalPaidUSD >= totalUSD - 0.001

  // ── Change ──────────────────────────────────────────────────────────────
  const changeUSD = Math.max(0, totalPaidUSD - totalUSD)
  const changeKHR = Math.round(changeUSD * rate)

  // ── Numpad ──────────────────────────────────────────────────────────────
  const numpad = (v) => {
    const isKHRField = activeField === 'khr'
    const str  = isKHRField ? khrStr : usdStr
    const set  = isKHRField ? setKhrStr : setUsdStr

    if (v === '⌫')  { set((s) => s.slice(0, -1)); return }
    if (v === '000') { set((s) => (s ? s + '000' : '')); return }
    if (v === '.' && isKHRField) return
    if (v === '.' && str.includes('.')) return
    set((s) => (s + v).replace(/^0+(\d)/, '$1'))
  }

  const numKeys = activeField === 'khr'
    ? ['7','8','9','4','5','6','1','2','3','000','0','⌫']
    : ['7','8','9','4','5','6','1','2','3','.','0','⌫']

  // ── Quick fill buttons ──────────────────────────────────────────────────
  const quickUSD = [
    Math.ceil(totalUSD),
    Math.ceil(totalUSD / 5) * 5,
    Math.ceil(totalUSD / 10) * 10,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= totalUSD).slice(0, 3)

  const quickKHR = (() => {
    const base = Math.ceil(totalKHR / 1000) * 1000
    return [base, base + 5000, base + 10000].filter((v) => v >= totalKHR).slice(0, 3)
  })()

  // ── Confirm ─────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!sufficient) { toast('Amount paid is less than total', 'error'); return }
    setLoading(true)
    setStep('processing')
    try {
      const amountPaidUSD = method === 'cash'
        ? parseFloat(totalPaidUSD.toFixed(4))
        : totalUSD

      // Build note for mixed payments
      let note = undefined
      if (method === 'cash' && usdPaid > 0 && khrPaid > 0) {
        note = `Mixed: $${usdPaid.toFixed(2)} USD + ៛${Math.round(khrPaid).toLocaleString()} KHR`
      } else if (method === 'cash' && khrPaid > 0) {
        note = `Paid in KHR: ៛${Math.round(khrPaid).toLocaleString()}`
      }

      setStatus('Creating order…')
      const order = await api.createOrder({
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          size_label: i.size_label ?? undefined,
          selected_toppings: i.selected_toppings?.length ? i.selected_toppings : undefined,
        })),
        customer_id: customer?.id || undefined,
        branch_id: user?.branch_id || undefined,
      })

      setStatus('Confirming order…')
      await api.confirmOrder(order.id)

      setStatus('Generating invoice…')
      const invoice = await api.createInvoice({ order_id: order.id })

      // Apply per-item discounts — always send as fixed USD amount so the backend
      // applies the exact pre-calculated value, not a % of the full invoice total
      const itemDiscEntries = cart.filter((i) => itemDiscAmt(i) > 0)
      if (itemDiscEntries.length > 0) {
        setStatus('Applying item discounts…')
        for (const i of itemDiscEntries) {
          await api.applyManualDiscount(invoice.id, {
            discount_method: 'fixed',
            value: parseFloat(itemDiscAmt(i).toFixed(4)),
            label: `${i.name}${i.size_label ? ` (${i.size_label})` : ''} discount`,
          })
        }
      }

      // Apply invoice-level manual discount (if entered)
      if (discValue && parseFloat(discValue) > 0) {
        setStatus('Applying manual discount…')
        await api.applyManualDiscount(invoice.id, {
          discount_method: discMethod,
          value: parseFloat(discValue),
        })
      }

      setStatus('Applying discounts…')
      const discInvoice = await api.autoApplyDiscounts(invoice.id)

      setStatus('Confirming invoice…')
      await api.confirmInvoice(discInvoice.id)

      setStatus('Processing payment…')
      const receipt = await api.createReceipt({
        invoice_id:     discInvoice.id,
        payment_method: method,
        amount_paid:    amountPaidUSD,
        shift_id:       shift?.id || undefined,
        note,
      })

      toast('Payment successful!', 'success')
      onSuccess({ receipt, invoice: discInvoice, order })
    } catch (err) {
      toast(err.message, 'error')
      setStep('payment')
      setLoading(false)
      setStatus('')
    }
  }

  // ── Processing screen ────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="modal-backdrop">
        <div className="modal" style={{ maxWidth: 300, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, color: 'var(--accent-soft)' }}><Settings2 size={44} /></div>
          <p style={{ fontFamily: 'var(--font-d)', fontSize: 20, marginBottom: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>Processing</p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }} className="animate-pulse">{statusMsg}</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 860, width: '95vw', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 28 }}>

        {/* ── Left: Order summary ── */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-d)', fontSize: 18, marginBottom: 14, fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Order Summary
          </h3>

          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 260, overflowY: 'auto', marginBottom: 2 }}>
            {cart.map((item) => {
              const key  = itemKey(item)
              const base = fmtBoth(item.unit_price * item.quantity)
              const disc = itemDiscs[key]
              const dAmt = itemDiscAmt(item)
              const isOpen = expandedItem === key
              const afterDisc = fmtBoth(item.unit_price * item.quantity - dAmt)
              return (
                <div key={key} style={{ borderBottom: '1px solid var(--divider)' }}>
                  {/* Main item row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0 4px', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--cream-2)', fontSize: 13 }}>{item.name} × {item.quantity}</span>
                        {item.size_label && (
                          <span style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(184,116,42,.12)', padding: '1px 6px', borderRadius: 99, fontFamily: 'var(--font-m)' }}>{item.size_label}</span>
                        )}
                      </div>
                      {/* Toppings with prices */}
                      {item.selected_toppings?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {item.selected_toppings.map((t) => (
                            <span key={t.id} style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--elevated)', border: '1px solid var(--divider)', padding: '1px 7px', borderRadius: 99 }}>
                              + {t.name} <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-m)' }}>+${Number(t.price).toFixed(2)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Item discount toggle */}
                      <button
                        onClick={() => setExpandedItem(isOpen ? null : key)}
                        style={{ marginTop: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 10, color: dAmt > 0 ? 'var(--success)' : 'var(--muted)', letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 3 }}
                      >
                        {dAmt > 0 ? `− $${dAmt.toFixed(2)} discount` : '+ Add item discount'}
                      </button>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {dAmt > 0 ? (
                        <>
                          <div style={{ fontFamily: 'var(--font-m)', fontSize: 13, color: 'var(--cream)', textDecoration: 'line-through', opacity: 0.45 }}>{base.primary}</div>
                          <div style={{ fontFamily: 'var(--font-m)', fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>{afterDisc.primary}</div>
                          <div style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--muted)' }}>{afterDisc.secondary}</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontFamily: 'var(--font-m)', fontSize: 13, color: 'var(--cream)' }}>{base.primary}</div>
                          <div style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--muted)' }}>{base.secondary}</div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Inline item discount row */}
                  {isOpen && (
                    <div style={{ display: 'flex', gap: 6, paddingBottom: 8, alignItems: 'center' }}>
                      <div style={{ display: 'flex', background: 'var(--elevated)', borderRadius: 7, border: '1px solid var(--divider)', overflow: 'hidden', flexShrink: 0 }}>
                        <button onClick={() => setItemDisc(item, { method: 'percentage' })} style={{ padding: '4px 9px', border: 'none', background: (disc?.method ?? 'percentage') === 'percentage' ? 'var(--accent)' : 'transparent', color: (disc?.method ?? 'percentage') === 'percentage' ? '#fff' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>%</button>
                        <button onClick={() => setItemDisc(item, { method: 'fixed' })}      style={{ padding: '4px 9px', border: 'none', background: (disc?.method ?? 'percentage') === 'fixed'      ? 'var(--accent)' : 'transparent', color: (disc?.method ?? 'percentage') === 'fixed'      ? '#fff' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>$</button>
                      </div>
                      <input
                        autoFocus
                        type="number" min="0"
                        step={(disc?.method ?? 'percentage') === 'percentage' ? '1' : '0.01'}
                        placeholder={(disc?.method ?? 'percentage') === 'percentage' ? 'e.g. 10' : 'e.g. 0.50'}
                        value={disc?.value ?? ''}
                        onChange={(e) => setItemDisc(item, { value: e.target.value })}
                        style={{ flex: 1, background: 'var(--elevated)', border: '1px solid var(--divider)', borderRadius: 7, padding: '4px 9px', fontSize: 12, color: 'var(--cream)', outline: 'none' }}
                      />
                      <button onClick={() => { setItemDiscs((p) => { const n = { ...p }; delete n[key]; return n }); setExpandedItem(null) }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}><X size={13} /></button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Customer picker */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Customer</div>
            <CustomerPicker value={customer} onChange={setCustomer} />
          </div>

          {/* Invoice-level manual discount */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Invoice Discount</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ display: 'flex', background: 'var(--elevated)', borderRadius: 8, border: '1px solid var(--divider)', overflow: 'hidden', flexShrink: 0 }}>
                <button onClick={() => setDiscMethod('percentage')} style={{ padding: '6px 10px', border: 'none', background: discMethod === 'percentage' ? 'var(--accent)' : 'transparent', color: discMethod === 'percentage' ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>%</button>
                <button onClick={() => setDiscMethod('fixed')}      style={{ padding: '6px 10px', border: 'none', background: discMethod === 'fixed'      ? 'var(--accent)' : 'transparent', color: discMethod === 'fixed'      ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>$</button>
              </div>
              <input
                type="number" min="0"
                step={discMethod === 'percentage' ? '1' : '0.01'}
                placeholder={discMethod === 'percentage' ? 'e.g. 10' : 'e.g. 1.50'}
                value={discValue}
                onChange={(e) => setDiscValue(e.target.value)}
                style={{ flex: 1, background: 'var(--elevated)', border: '1px solid var(--divider)', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: 'var(--cream)', outline: 'none' }}
              />
              {invoiceDiscAmt > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: 4, fontSize: 12, color: 'var(--success)', fontFamily: 'var(--font-m)', whiteSpace: 'nowrap' }}>
                  −${invoiceDiscAmt.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div style={{ marginTop: 14, borderTop: '1px solid var(--divider)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--cream-2)' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-m)' }}>{fmtBoth(subtotalUSD).primary}</span>
            </div>
            {itemDiscTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--success)' }}>
                <span>Item Discounts</span>
                <span style={{ fontFamily: 'var(--font-m)' }}>−${itemDiscTotal.toFixed(2)}</span>
              </div>
            )}
            {invoiceDiscAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--success)' }}>
                <span>Invoice Discount</span>
                <span style={{ fontFamily: 'var(--font-m)' }}>−${invoiceDiscAmt.toFixed(2)}</span>
              </div>
            )}
            {customerDiscTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--success)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Customer Discount
                  <span style={{ fontSize: 10, background: 'rgba(74,222,128,.1)', color: 'var(--success)', padding: '1px 6px', borderRadius: 99 }}>
                    {customerDiscs.map((d) => d.discount_method === 'percentage' ? `${d.discount_value}%` : `$${d.discount_value}`).join(' + ')}
                  </span>
                </span>
                <span style={{ fontFamily: 'var(--font-m)' }}>−${customerDiscTotal.toFixed(2)}</span>
              </div>
            )}
            {customer && customerDiscs.length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
                No auto-discount for {customer.name}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
              <span>Rate: 1 USD = ៛{rate.toLocaleString()}</span>
              <span style={{ fontFamily: 'var(--font-m)' }}>≈ ៛{Math.round(subtotalUSD * rate).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--divider)', paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--font-d)', fontSize: 16, letterSpacing: '.08em', textTransform: 'uppercase' }}>Total</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-m)', color: 'var(--accent-soft)', fontSize: 22, fontWeight: 600 }}>${totalUSD.toFixed(2)}</div>
                <div style={{ fontFamily: 'var(--font-m)', color: 'var(--muted)', fontSize: 12 }}>៛{totalKHR.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Payment ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase' }}>Payment</h3>
            <button className="btn-icon" onClick={onClose}><X size={14} /></button>
          </div>

          {/* Method selector */}
          <div className="pay-methods" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
            {PAYMENT_METHODS.map((m) => (
              <button key={m.code} className={`pay-method-btn ${method === m.code ? 'selected' : ''}`} onClick={() => setMethod(m.code)}>
                <span className="icon"><m.Icon size={18} /></span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Cash: dual-currency input */}
          {method === 'cash' && (
            <>
              {/* Two currency input fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {/* USD field */}
                <div
                  onClick={() => setActive('usd')}
                  style={{
                    background: activeField === 'usd' ? 'rgba(184,116,42,.12)' : 'var(--elevated)',
                    border: `1.5px solid ${activeField === 'usd' ? 'var(--accent)' : 'var(--divider)'}`,
                    borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ fontSize: 10, color: activeField === 'usd' ? 'var(--accent-soft)' : 'var(--muted)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    USD $
                  </div>
                  <div style={{ fontFamily: 'var(--font-m)', fontSize: 20, color: activeField === 'usd' ? 'var(--cream)' : 'var(--cream-2)', minHeight: 28 }}>
                    {usdStr || <span style={{ color: 'var(--muted)', fontSize: 16 }}>0.00</span>}
                    {activeField === 'usd' && <span style={{ animation: 'pulse 1s ease infinite', color: 'var(--accent)' }}>|</span>}
                  </div>
                </div>

                {/* KHR field */}
                <div
                  onClick={() => setActive('khr')}
                  style={{
                    background: activeField === 'khr' ? 'rgba(184,116,42,.12)' : 'var(--elevated)',
                    border: `1.5px solid ${activeField === 'khr' ? 'var(--accent)' : 'var(--divider)'}`,
                    borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ fontSize: 10, color: activeField === 'khr' ? 'var(--accent-soft)' : 'var(--muted)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    KHR ៛
                  </div>
                  <div style={{ fontFamily: 'var(--font-m)', fontSize: 20, color: activeField === 'khr' ? 'var(--cream)' : 'var(--cream-2)', minHeight: 28 }}>
                    {khrStr ? parseInt(khrStr).toLocaleString() : <span style={{ color: 'var(--muted)', fontSize: 16 }}>0</span>}
                    {activeField === 'khr' && <span style={{ animation: 'pulse 1s ease infinite', color: 'var(--accent)' }}>|</span>}
                  </div>
                </div>
              </div>

              {/* Quick fill for active field */}
              <div style={{ display: 'flex', gap: 5 }}>
                {(activeField === 'usd' ? quickUSD : quickKHR).map((v) => (
                  <button
                    key={v}
                    className="btn btn-ghost"
                    style={{ flex: 1, height: 28, fontSize: 11, padding: '0 4px' }}
                    onClick={() => activeField === 'usd' ? setUsdStr(String(v)) : setKhrStr(String(v))}
                  >
                    {activeField === 'usd' ? `$${v}` : `៛${v.toLocaleString()}`}
                  </button>
                ))}
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1, height: 28, fontSize: 11, padding: '0 4px', color: 'var(--muted)' }}
                  onClick={() => activeField === 'usd' ? setUsdStr('') : setKhrStr('')}
                >
                  Clear
                </button>
              </div>

              {/* Shared numpad */}
              <div className="numpad" style={{ gap: 5 }}>
                {numKeys.map((k) => (
                  <button key={k} className="numpad-btn" style={{ fontSize: k === '000' ? 13 : 17 }} onClick={() => numpad(k)}>{k}</button>
                ))}
              </div>

              {/* Total paid + change */}
              <div style={{ background: 'var(--elevated)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--cream-2)' }}>
                  <span>Total Paid</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-m)', color: sufficient ? 'var(--cream)' : 'var(--danger)', fontWeight: 600 }}>
                      ${totalPaidUSD.toFixed(2)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--muted)' }}>
                      ៛{Math.round(totalPaidUSD * rate).toLocaleString()}
                    </div>
                  </div>
                </div>

                {sufficient && totalPaidUSD > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--divider)', paddingTop: 6 }}>
                    <span style={{ color: changeUSD > 0 ? 'var(--success)' : 'var(--muted)' }}>Change</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-m)', color: changeUSD > 0 ? 'var(--success)' : 'var(--muted)', fontWeight: 700 }}>
                        ៛{changeKHR.toLocaleString()}
                      </div>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--muted)' }}>
                        ${changeUSD.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {!sufficient && (totalPaidUSD > 0) && (
                  <div style={{ fontSize: 11, color: 'var(--danger)', textAlign: 'right' }}>
                    Short ៛{Math.round((totalUSD - totalPaidUSD) * rate).toLocaleString()} (${(totalUSD - totalPaidUSD).toFixed(2)})
                  </div>
                )}
              </div>
            </>
          )}

          {/* Non-cash: just show total */}
          {method !== 'cash' && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--muted)', minHeight: 180 }}>
              {(() => { const M = PAYMENT_METHODS.find((m) => m.code === method); return M ? <M.Icon size={36} /> : null })()}
              <p style={{ fontSize: 13 }}>Process payment on terminal</p>
              <div style={{ fontFamily: 'var(--font-m)', fontSize: 18, color: 'var(--accent-soft)' }}>${totalUSD.toFixed(2)}</div>
              <div style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--muted)' }}>៛{totalKHR.toLocaleString()}</div>
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            style={{ height: 48, fontSize: 14, borderRadius: 'var(--r-lg)', fontFamily: 'var(--font-d)', letterSpacing: '.1em', textTransform: 'uppercase' }}
            disabled={loading || (method === 'cash' && (!sufficient || totalPaidUSD === 0))}
            onClick={handleConfirm}
          >
            {loading
              ? <span className="spinner" style={{ borderTopColor: '#fff' }} />
              : `Confirm · $${totalUSD.toFixed(2)}`
            }
          </button>
        </div>
      </div>
    </div>
  )
}
