import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  LayoutDashboard, Coffee, FolderOpen, Users, BarChart2,
  ArrowLeftRight, UserCog, Store, Clock, Plus, Pencil, Trash2,
  TrendingUp, TrendingDown, ShoppingBag, Tag, Percent, LogOut,
  MapPin, Phone, CreditCard, Banknote, Smartphone, Building2,
  ChevronUp, ChevronDown, Minus, Layers, CalendarClock, Ticket,
} from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'

/* ── Nav items ───────────────────────────────────────────── */
const NAV = [
  { key: 'dashboard',  Icon: LayoutDashboard, label: 'Dashboard'      },
  { key: 'branches',   Icon: Store,            label: 'Branches'       },
  { key: 'products',   Icon: Coffee,           label: 'Products'       },
  { key: 'categories', Icon: FolderOpen,       label: 'Categories'     },
  { key: 'toppings',   Icon: Layers,           label: 'Toppings'       },
  { key: 'events',     Icon: CalendarClock,    label: 'Events'         },
  { key: 'customers',  Icon: Users,            label: 'Customers'      },
  { key: 'reports',    Icon: BarChart2,        label: 'Reports'        },
  { key: 'exchange',   Icon: ArrowLeftRight,   label: 'Exchange Rates' },
  { key: 'users',      Icon: UserCog,          label: 'Staff'          },
]

/* ── Chart theme ─────────────────────────────────────────── */
const C = {
  accent:  '#B8742A',
  accentH: '#CE894A',
  info:    '#5B9BD5',
  success: '#5CB87A',
  danger:  '#D95555',
  muted:   '#5C4E38',
  cream:   '#F4ECD8',
  cream2:  '#B8A082',
  surface: '#111009',
  card:    '#191510',
  divider: 'rgba(255,255,255,.07)',
  PIE: ['#B8742A', '#5B9BD5', '#5CB87A', '#D95555', '#9B6FC3'],
}

/* ── Shared helpers ──────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
    </div>
  )
}

function Row({ children, gap = 10, style }) {
  return <div style={{ display: 'flex', gap, ...style }}>{children}</div>
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
      color: C.muted, marginBottom: 12,
    }}>{children}</div>
  )
}

/* ── Chart tooltip ───────────────────────────────────────── */
function ChartTooltip({ active, payload, label, prefix = '$', suffix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1E1A14', border: `1px solid ${C.divider}`, borderRadius: 8,
      padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,.6)',
    }}>
      {label && <div style={{ color: C.cream2, marginBottom: 4, fontSize: 11 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.accentH, fontFamily: 'var(--font-m)', fontWeight: 600 }}>
          {p.name && <span style={{ color: C.cream2, marginRight: 6 }}>{p.name}:</span>}
          {prefix}{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}{suffix}
        </div>
      ))}
    </div>
  )
}

/* ── KPI stat card ───────────────────────────────────────── */
function KpiCard({ Icon, label, value, sub, trend, color = C.accent, mono = true }) {
  const trendUp   = typeof trend === 'number' && trend > 0
  const trendDown = typeof trend === 'number' && trend < 0
  const trendFlat = typeof trend === 'number' && trend === 0
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.divider}`, borderRadius: 14,
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} strokeWidth={1.8} />
        </div>
        {typeof trend === 'number' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 600,
            color: trendUp ? C.success : trendDown ? C.danger : C.muted,
            background: trendUp ? `${C.success}18` : trendDown ? `${C.danger}18` : `${C.muted}18`,
            borderRadius: 99, padding: '2px 8px',
          }}>
            {trendUp   && <ChevronUp   size={12} strokeWidth={2.5} />}
            {trendDown && <ChevronDown size={12} strokeWidth={2.5} />}
            {trendFlat && <Minus       size={12} strokeWidth={2.5} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{label}</div>
        <div style={{
          fontFamily: mono ? 'var(--font-m)' : 'var(--font-b)',
          fontSize: 26, fontWeight: 700, color, lineHeight: 1,
        }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

/* ── Chart card wrapper ──────────────────────────────────── */
function ChartCard({ title, children, style, action }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.divider}`, borderRadius: 14,
      padding: '18px 20px', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.cream2, letterSpacing: '.04em' }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

/* ── Sidebar ─────────────────────────────────────────────── */
function Sidebar({ user, active, onChange, onLogout }) {
  return (
    <aside style={{
      width: 252, background: C.surface, borderRight: `1px solid ${C.divider}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative', zIndex: 2,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 22px' }}>
        <img src="/logo.jpg" alt="Salty Coffee" style={{ width: 108, filter: 'invert(1) brightness(.85) sepia(.25)' }} />
        <div style={{
          fontSize: 9, letterSpacing: '.26em', color: C.accent,
          textTransform: 'uppercase', marginTop: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Building2 size={9} strokeWidth={2} /> Back Office
        </div>
      </div>

      <div style={{ height: 1, background: C.divider, margin: '0 20px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ key, Icon, label }) => {
          const isActive = active === key
          return (
            <button key={key} onClick={() => onChange(key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10, border: 'none',
              background: isActive ? `${C.accent}20` : 'transparent',
              color: isActive ? C.accentH : C.cream2,
              fontSize: 13.5, fontWeight: isActive ? 600 : 400,
              cursor: 'pointer', transition: 'all 150ms ease',
              textAlign: 'left', letterSpacing: isActive ? '.01em' : 'normal',
            }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = `${C.accent}0d`; e.currentTarget.style.color = C.cream } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.cream2 } }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: isActive ? `${C.accent}28` : `${C.accent}0a`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms ease',
              }}>
                <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? C.accentH : C.cream2} />
              </div>
              {label}
            </button>
          )
        })}
      </nav>

      <div style={{ height: 1, background: C.divider, margin: '0 20px' }} />

      {/* User footer */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `${C.accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UserCog size={16} color={C.accent} strokeWidth={1.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: C.cream, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 10, color: C.accent, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>{user.role}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: '100%', padding: '8px 0', borderRadius: 9,
          border: `1px solid ${C.divider}`, background: 'transparent',
          color: C.muted, fontSize: 12, cursor: 'pointer', transition: 'all 150ms ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1E1A14'; e.currentTarget.style.color = C.danger; e.currentTarget.style.borderColor = `${C.danger}44` }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.divider }}
        >
          <LogOut size={13} strokeWidth={1.8} /> Sign Out
        </button>
      </div>
    </aside>
  )
}

/* ── Top header ──────────────────────────────────────────── */
function MainHeader({ section, user }) {
  const nav = NAV.find(n => n.key === section)
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <header style={{
      padding: '0 28px', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', borderBottom: `1px solid ${C.divider}`,
      background: C.surface, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {nav && <nav.Icon size={16} color={C.accent} strokeWidth={2} />}
        <span style={{ fontFamily: 'var(--font-d)', fontSize: 17, letterSpacing: '.1em', textTransform: 'uppercase', color: C.cream }}>
          {nav?.label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
          background: '#1E1A14', borderRadius: 99, border: `1px solid ${C.divider}`,
          fontSize: 12, color: C.cream2,
        }}>
          <Clock size={12} strokeWidth={1.8} color={C.muted} />
          <span style={{ fontFamily: 'var(--font-m)', color: C.cream }}>{timeStr}</span>
          <span style={{ color: C.muted }}>·</span>
          <span>{dateStr}</span>
        </div>
      </div>
    </header>
  )
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD SECTION
════════════════════════════════════════════════════════════ */
function DashboardSection() {
  const toast = useToast()
  const [loading, setLoading]     = useState(true)
  const [kpis, setKpis]           = useState({ revenue: 0, orders: 0, avg: 0, discount: 0, customers: 0, staff: 0, trend: null })
  const [trendData, setTrendData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [payData, setPayData]     = useState([])
  const [dailySummary, setDailySummary] = useState(null)

  useEffect(() => {
    const today  = new Date()
    const todayS = today.toISOString().slice(0, 10)
    const d7ago  = new Date(today); d7ago.setDate(d7ago.getDate() - 6)
    const d7agoS = d7ago.toISOString().slice(0, 10)
    const yest   = new Date(today); yest.setDate(yest.getDate() - 1)
    const yestS  = yest.toISOString().slice(0, 10)

    Promise.all([
      api.getDailySummary(todayS),
      api.getDailySummary(yestS),
      api.getRevenueSummary(d7agoS, todayS),
      api.getTopProducts(d7agoS, todayS),
      api.getPaymentBreakdown(todayS, todayS),
      api.getCustomers(),
      api.getUsers(),
    ])
      .then(([todaySum, yesterSum, revSummary, tops, pays, customers, staff]) => {
        const todayRev = Number(todaySum?.total_revenue ?? 0)
        const yesterRev = Number(yesterSum?.total_revenue ?? 0)
        const trend = yesterRev > 0 ? ((todayRev - yesterRev) / yesterRev) * 100 : null

        setKpis({
          revenue: todayRev,
          orders: todaySum?.total_invoices ?? 0,
          avg: Number(todaySum?.avg_order_value ?? 0),
          discount: Number(todaySum?.total_discount ?? 0),
          customers: customers?.length ?? 0,
          staff: staff?.length ?? 0,
          trend,
        })
        setDailySummary(todaySum)

        // Build 7-day trend from daily_breakdown
        const breakdown = revSummary?.daily_breakdown ?? []
        const last7 = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today); d.setDate(d.getDate() - i)
          const key = d.toISOString().slice(0, 10)
          const found = breakdown.find(r => r.date === key)
          last7.push({
            date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            revenue: Number(found?.revenue ?? 0),
            orders: Number(found?.invoices ?? found?.count ?? 0),
          })
        }
        setTrendData(last7)

        // Top products
        const tp = (Array.isArray(tops) ? tops : []).slice(0, 6).map(p => ({
          name: (p.product_name ?? p.name ?? '').slice(0, 18),
          value: Number(p.total_revenue ?? p.revenue ?? 0),
          qty: Number(p.total_quantity ?? p.qty ?? 0),
        }))
        setTopProducts(tp)

        // Payment breakdown
        const pArr = Array.isArray(pays) ? pays : []
        setPayData(pArr.map(p => ({
          name: capitalize(p.method ?? p.payment_method ?? 'Other'),
          value: Number(p.total_revenue ?? p.total ?? 0),
          count: p.count ?? 0,
        })))
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const maxBar = topProducts.reduce((m, p) => Math.max(m, p.value), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── KPI Row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KpiCard
          Icon={TrendingUp} label="Revenue Today"
          value={`$${kpis.revenue.toFixed(2)}`}
          sub={kpis.trend != null ? `vs yesterday $${(kpis.revenue - kpis.revenue / (1 + kpis.trend / 100)).toFixed(2)} diff` : 'No data yesterday'}
          trend={kpis.trend}
          color={C.accent}
        />
        <KpiCard
          Icon={ShoppingBag} label="Orders Today"
          value={kpis.orders}
          sub={`Avg $${kpis.avg.toFixed(2)} / order`}
          color={C.info}
        />
        <KpiCard
          Icon={Percent} label="Discounts Given"
          value={`$${kpis.discount.toFixed(2)}`}
          sub="Total discount today"
          color={C.danger}
        />
        <KpiCard
          Icon={Users} label="Total Customers"
          value={kpis.customers}
          sub={`${kpis.staff} staff accounts`}
          color={C.success}
          mono={false}
        />
      </div>

      {/* ── Revenue Trend + Payment Pie ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>

        {/* 7-day area chart */}
        <ChartCard title="Revenue — Last 7 Days">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="revenue" name="Revenue"
                stroke={C.accent} strokeWidth={2}
                fill="url(#revGrad)" dot={{ fill: C.accent, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: C.accentH, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Payment methods pie */}
        <ChartCard title="Payments Today">
          {payData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 12 }}>
              No transactions today
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={payData} cx="50%" cy="50%"
                    innerRadius={38} outerRadius={60}
                    paddingAngle={3} dataKey="value"
                  >
                    {payData.map((_, i) => (
                      <Cell key={i} fill={C.PIE[i % C.PIE.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {payData.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: C.PIE[i % C.PIE.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: C.cream2 }}>{p.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: C.accentH }}>${p.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* ── Top Products + Today Summary ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Top products horizontal bars */}
        <ChartCard title="Top Products — Last 7 Days">
          {topProducts.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: C.muted, fontSize: 12 }}>No sales data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topProducts.map((p, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.cream2 }}>{p.name}</span>
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: C.accentH }}>{p.qty}× · ${p.value.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 5, background: `${C.accent}1A`, borderRadius: 99 }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${C.accent}, ${C.accentH})`,
                      width: `${maxBar > 0 ? (p.value / maxBar) * 100 : 0}%`,
                      transition: 'width 600ms ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Today's summary table */}
        <ChartCard title="Today's Summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Total Revenue',  `$${Number(dailySummary?.total_revenue  ?? 0).toFixed(2)}`, C.accentH  ],
              ['Total Orders',   `${dailySummary?.total_invoices ?? 0}`,                     C.info     ],
              ['Avg Order Value',`$${Number(dailySummary?.avg_order_value ?? 0).toFixed(2)}`, C.cream2  ],
              ['Total Discount', `$${Number(dailySummary?.total_discount  ?? 0).toFixed(2)}`, C.danger  ],
            ].map(([label, val, color]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0', borderBottom: `1px solid ${C.divider}`,
              }}>
                <span style={{ fontSize: 13, color: C.cream2 }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: 14, fontWeight: 700, color }}>{val}</span>
              </div>
            ))}
          </div>
          {/* 7-day orders sparkline */}
          {trendData.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>7-Day Orders</div>
              <ResponsiveContainer width="100%" height={50}>
                <BarChart data={trendData} barSize={14} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="orders" fill={C.info} opacity={0.7} radius={[3, 3, 0, 0]} />
                  <Tooltip content={<ChartTooltip prefix="" suffix=" orders" />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function capitalize(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/* ════════════════════════════════════════════════════════════
   BRANCHES SECTION
════════════════════════════════════════════════════════════ */
function BranchesSection() {
  const toast = useToast()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', address: '', phone: '', is_active: true })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setBranches(await api.getBranches()) }
    catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm({ name: '', address: '', phone: '', is_active: true }); setModal({ mode: 'add' }) }
  const openEdit = (b) => { setForm({ name: b.name, address: b.address || '', phone: b.phone || '', is_active: b.is_active ?? true }); setModal({ mode: 'edit', id: b.id }) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal.mode === 'add') { await api.createBranch(form); toast('Branch created', 'success') }
      else { await api.updateBranch(modal.id, form); toast('Branch updated', 'success') }
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (b) => {
    if (!confirm(`Delete branch "${b.name}"?`)) return
    try { await api.deleteBranch(b.id); toast('Branch deleted', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{branches.length} branch{branches.length !== 1 ? 'es' : ''}</span>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} strokeWidth={2.5} /> Add Branch
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {branches.map(b => (
            <div key={b.id} style={{ background: C.card, border: `1px solid ${C.divider}`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={18} color={C.accent} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.cream }}>{b.name}</div>
                    <span className={`chip ${b.is_active ? '' : 'chip-danger'}`} style={{ fontSize: 9 }}>{b.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <Row gap={4}>
                  <button className="btn-icon" onClick={() => openEdit(b)}><Pencil size={13} strokeWidth={2} /></button>
                  <button className="btn-icon" style={{ color: C.danger }} onClick={() => handleDelete(b)}><Trash2 size={13} strokeWidth={2} /></button>
                </Row>
              </div>
              {b.address && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}><MapPin size={12} />{b.address}</div>}
              {b.phone   && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted, marginTop: 4 }}><Phone size={12} />{b.phone}</div>}
            </div>
          ))}
          {branches.length === 0 && <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>No branches yet.</div>}
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Branch' : 'Edit Branch'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Field label="Branch Name"><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Branch" /></Field>
            <Field label="Address"><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Street, City" /></Field>
            <Field label="Phone"><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+855 12 345 678" /></Field>
            <CheckField label="Active" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
            <ModalActions onCancel={() => setModal(null)} saving={saving} label="Save Branch" />
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   PRODUCTS SECTION
════════════════════════════════════════════════════════════ */
function ProductsSection() {
  const toast = useToast()
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)
  const [form,       setForm]       = useState({ name: '', base_price: '', category_id: '', description: '', icon: '☕', is_active: true, image_url: '' })
  const [sizes,      setSizes]      = useState([])       // { id?, size_label, price, sort_order, is_active }
  const [deletedSizeIds, setDeletedSizeIds] = useState([])
  const [saving,     setSaving]     = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [filterCat,  setFilterCat]  = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const [p, c] = await Promise.all([api.getProducts(), api.getAllCategories()]); setProducts(p); setCategories(c) }
    catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setForm({ name: '', base_price: '', category_id: categories[0]?.id || '', description: '', icon: '☕', is_active: true, image_url: '' })
    setSizes([])
    setDeletedSizeIds([])
    setModal({ mode: 'add' })
  }

  const openEdit = async (p) => {
    setForm({ name: p.name, base_price: p.base_price, category_id: p.category_id, description: p.description || '', icon: p.icon || '☕', is_active: p.is_active ?? true, image_url: p.image_url || '' })
    setDeletedSizeIds([])
    setModal({ mode: 'edit', id: p.id })
    try {
      const existing = await api.getProductSizes(p.id)
      setSizes((existing ?? []).map(s => ({ id: s.id, size_label: s.size_label, price: String(s.price), sort_order: String(s.sort_order ?? 0), is_active: s.is_active ?? true })))
    } catch { setSizes([]) }
  }

  // ── Size helpers ────────────────────────────────────────────────────────
  const addSize = () => setSizes(prev => [
    ...prev,
    { size_label: '', price: '', sort_order: String(prev.length), is_active: true },
  ])

  const updateSize = (i, key, val) => setSizes(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))

  const removeSize = (i, id) => {
    if (id) setDeletedSizeIds(prev => [...prev, id])
    setSizes(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Save ────────────────────────────────────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const { url } = await api.uploadProductImage(file); setForm(f => ({ ...f, image_url: url })); toast('Image uploaded', 'success') }
    catch (err) { toast(err.message, 'error') }
    finally { setUploading(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const dto = { ...form, base_price: parseFloat(form.base_price) || 0 }
      let productId = modal.id

      if (modal.mode === 'add') {
        const created = await api.createProduct(dto)
        productId = created.id
        toast('Product created', 'success')
      } else {
        await api.updateProduct(productId, dto)
        toast('Product updated', 'success')
      }

      // Delete removed sizes
      await Promise.all(deletedSizeIds.map(id => api.deleteProductSize(id)))

      // Save sizes
      await Promise.all(sizes.map(s => {
        const sizeDto = {
          product_id: productId,
          size_label: s.size_label,
          price: parseFloat(s.price) || 0,
          sort_order: parseInt(s.sort_order) || 0,
          is_active: s.is_active,
        }
        return s.id ? api.updateProductSize(s.id, sizeDto) : api.createProductSize(sizeDto)
      }))

      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await api.deleteProduct(id); toast('Product deleted', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  const catName = id => categories.find(c => c.id === id)?.name || '—'
  const visible = filterCat ? products.filter(p => p.category_id === filterCat) : products

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: C.muted }}>{visible.length} products</span>
          <select className="input" style={{ height: 34, width: 'auto', fontSize: 12 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      {loading ? <Spinner /> : (
        <DataTable headers={['', 'Name', 'Category', 'Base Price', 'Sizes', 'Status', 'Actions']}>
          {visible.map(p => (
            <tr key={p.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
              <Td w={52}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  : <span style={{ fontSize: 22 }}>{p.icon || '☕'}</span>
                }
              </Td>
              <Td bold>{p.name}</Td>
              <Td muted>{catName(p.category_id)}</Td>
              <Td mono accent>{`$${Number(p.base_price).toFixed(2)}`}</Td>
              <Td muted>{(p.product_sizes ?? []).filter(s => s.is_active !== false).length || '—'}</Td>
              <Td><StatusBadge active={p.is_active} /></Td>
              <Td>
                <Row gap={6}>
                  <ActionBtn onClick={() => openEdit(p)}><Pencil size={13} />Edit</ActionBtn>
                  <ActionBtn danger onClick={() => handleDelete(p.id)}><Trash2 size={13} />Del</ActionBtn>
                </Row>
              </Td>
            </tr>
          ))}
          {visible.length === 0 && <EmptyRow cols={7} />}
        </DataTable>
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Row>
              <Field label="Name" style={{ flex: 1 }}><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Icon" style={{ width: 72 }}><input className="input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} style={{ textAlign: 'center', fontSize: 20 }} /></Field>
            </Row>
            <Row>
              <Field label="Category" style={{ flex: 1 }}>
                <select className="input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </Field>
              <Field label="Base Price ($)" style={{ width: 130 }}>
                <input className="input" type="number" min="0" step="0.01" required value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })} />
              </Field>
            </Row>
            <Field label="Description">
              <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
            </Field>

            {/* ── Sizes ─────────────────────────────────────────────── */}
            <div style={{ background: '#0E0C08', border: `1px solid ${C.divider}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.muted }}>
                  Sizes ({sizes.length})
                </span>
                <button
                  type="button"
                  onClick={addSize}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: C.accentH, background: 'none', border: `1px solid ${C.accent}40`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
                >
                  <Plus size={11} strokeWidth={2.5} /> Add Size
                </button>
              </div>

              {sizes.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted, padding: '4px 0 2px' }}>
                  No sizes — product will use base price only
                </div>
              ) : (
                <>
                  {/* Column headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 72px 56px 28px', gap: 6, marginBottom: 6 }}>
                    {['Label', 'Price ($)', 'Sort', 'Active', ''].map(h => (
                      <span key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.muted }}>{h}</span>
                    ))}
                  </div>
                  {/* Size rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {sizes.map((s, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 72px 56px 28px', gap: 6, alignItems: 'center' }}>
                        <input
                          className="input"
                          placeholder="e.g. M, L, XL"
                          value={s.size_label}
                          onChange={e => updateSize(i, 'size_label', e.target.value)}
                          style={{ height: 34, fontSize: 13 }}
                        />
                        <input
                          className="input"
                          type="number" min="0" step="0.01"
                          placeholder="0.00"
                          value={s.price}
                          onChange={e => updateSize(i, 'price', e.target.value)}
                          style={{ height: 34, fontSize: 13 }}
                        />
                        <input
                          className="input"
                          type="number" min="0"
                          value={s.sort_order}
                          onChange={e => updateSize(i, 'sort_order', e.target.value)}
                          style={{ height: 34, fontSize: 13 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <input
                            type="checkbox"
                            checked={s.is_active}
                            onChange={e => updateSize(i, 'is_active', e.target.checked)}
                            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.accent }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSize(i, s.id)}
                          style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── Image upload ───────────────────────────────────────── */}
            <Field label="Product Image">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {form.image_url
                  ? <img src={form.image_url} alt="preview" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', border: `1px solid ${C.divider}`, flexShrink: 0 }} />
                  : <div style={{ width: 64, height: 64, borderRadius: 10, background: C.card, border: `1px dashed ${C.muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{form.icon || '☕'}</div>
                }
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: uploading ? 'not-allowed' : 'pointer', background: C.card, border: `1px solid ${C.divider}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, color: C.cream2 }}>
                    {uploading ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Uploading…</> : <><Coffee size={13} /> Choose Image</>}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleImageChange} />
                  </label>
                  {form.image_url && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} style={{ marginLeft: 8, background: 'none', border: 'none', color: C.danger, fontSize: 12, cursor: 'pointer' }}>Remove</button>
                  )}
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>JPG, PNG, WEBP · max 5 MB</div>
                </div>
              </div>
            </Field>

            <CheckField label="Active (visible in POS)" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
            <ModalActions onCancel={() => setModal(null)} saving={saving} label="Save Product" />
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   CATEGORIES SECTION
════════════════════════════════════════════════════════════ */
function CategoriesSection() {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '📂', color: '#191510', is_active: true, sort_order: 0 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setCategories(await api.getAllCategories()) }
    catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm({ name: '', icon: '📂', color: '#191510', is_active: true, sort_order: categories.length }); setModal({ mode: 'add' }) }
  const openEdit = c => { setForm({ name: c.name, icon: c.icon || '📂', color: c.color || '#191510', is_active: c.is_active ?? true, sort_order: c.sort_order ?? 0 }); setModal({ mode: 'edit', id: c.id }) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const dto = { ...form, sort_order: parseInt(form.sort_order) }
      if (modal.mode === 'add') { await api.createCategory(dto); toast('Category created', 'success') }
      else { await api.updateCategory(modal.id, dto); toast('Category updated', 'success') }
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this category?')) return
    try { await api.deleteCategory(id); toast('Category deleted', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{categories.length} categories</span>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} strokeWidth={2.5} /> Add Category</button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 }}>
          {categories.map(c => (
            <div key={c.id} style={{ background: c.color || C.card, border: `1px solid ${C.divider}`, borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.cream }}>{c.name}</div>
                  <StatusBadge active={c.is_active} style={{ fontSize: 9 }} />
                </div>
              </div>
              <Row gap={4}>
                <button className="btn-icon" onClick={() => openEdit(c)}><Pencil size={13} strokeWidth={2} /></button>
                <button className="btn-icon" style={{ color: C.danger }} onClick={() => handleDelete(c.id)}><Trash2 size={13} strokeWidth={2} /></button>
              </Row>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Category' : 'Edit Category'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Row>
              <Field label="Name" style={{ flex: 1 }}><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Icon" style={{ width: 72 }}><input className="input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} style={{ textAlign: 'center', fontSize: 20 }} /></Field>
            </Row>
            <Row>
              <Field label="Background Color" style={{ flex: 1 }}><input className="input" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ height: 44, padding: '4px 8px', cursor: 'pointer' }} /></Field>
              <Field label="Sort Order" style={{ width: 100 }}><input className="input" type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} /></Field>
            </Row>
            <CheckField label="Active (visible in POS)" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
            <ModalActions onCancel={() => setModal(null)} saving={saving} label="Save Category" />
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   TOPPINGS SECTION
════════════════════════════════════════════════════════════ */
function ToppingsSection() {
  const toast = useToast()
  const [toppings, setToppings] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', sort_order: 0, is_active: true })
  const [saving, setSaving] = useState(false)

  const KHR = 4000

  const load = useCallback(async () => {
    setLoading(true)
    try { setToppings(await api.getAllToppings()) }
    catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setForm({ name: '', price: '', sort_order: toppings.length, is_active: true })
    setModal({ mode: 'add' })
  }
  const openEdit = (t) => {
    setForm({ name: t.name, price: t.price, sort_order: t.sort_order ?? 0, is_active: t.is_active ?? true })
    setModal({ mode: 'edit', id: t.id })
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const dto = { ...form, price: parseFloat(form.price), sort_order: parseInt(form.sort_order) }
      if (modal.mode === 'add') { await api.createTopping(dto); toast('Topping created', 'success') }
      else { await api.updateTopping(modal.id, dto); toast('Topping updated', 'success') }
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this topping?')) return
    try { await api.deleteTopping(id); toast('Topping deleted', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{toppings.length} toppings</span>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} strokeWidth={2.5} /> Add Topping
        </button>
      </div>

      {loading ? <Spinner /> : (
        <DataTable headers={['Name', 'Price (USD)', 'Price (KHR)', 'Sort', 'Status', 'Actions']}>
          {toppings.map(t => (
            <tr key={t.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
              <Td bold>{t.name}</Td>
              <Td mono accent>${Number(t.price).toFixed(2)}</Td>
              <Td mono>៛{Math.round(Number(t.price) * KHR).toLocaleString()}</Td>
              <Td muted>{t.sort_order ?? 0}</Td>
              <Td><StatusBadge active={t.is_active} /></Td>
              <Td>
                <Row gap={6}>
                  <ActionBtn onClick={() => openEdit(t)}><Pencil size={13} />Edit</ActionBtn>
                  <ActionBtn danger onClick={() => handleDelete(t.id)}><Trash2 size={13} />Del</ActionBtn>
                </Row>
              </Td>
            </tr>
          ))}
          {toppings.length === 0 && <EmptyRow cols={6} />}
        </DataTable>
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Topping' : 'Edit Topping'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Field label="Name">
              <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pearl" />
            </Field>
            <Row>
              <Field label="Price (USD)" style={{ flex: 1 }}>
                <input className="input" type="number" min="0" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.25" />
              </Field>
              <Field label="≈ KHR" style={{ width: 120 }}>
                <div style={{ height: 42, display: 'flex', alignItems: 'center', paddingLeft: 12, background: 'rgba(255,255,255,.04)', borderRadius: 8, border: `1px solid ${C.divider}`, fontFamily: 'var(--font-m)', fontSize: 13, color: C.cream2 }}>
                  ៛{form.price ? Math.round(parseFloat(form.price) * KHR).toLocaleString() : '0'}
                </div>
              </Field>
              <Field label="Sort" style={{ width: 80 }}>
                <input className="input" type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
              </Field>
            </Row>
            <CheckField label="Active (available in POS)" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
            <ModalActions onCancel={() => setModal(null)} saving={saving} label="Save Topping" />
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   EVENTS SECTION  (2-step wizard)
════════════════════════════════════════════════════════════ */
function EventWizard({ products, allDiscounts, editEvent, onClose, onSaved }) {
  const toast = useToast()
  const isEdit = !!editEvent

  // step 1 state
  const toLocal = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : ''
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name:        editEvent?.name        ?? '',
    description: editEvent?.description ?? '',
    start_date:  toLocal(editEvent?.start_date ?? new Date().toISOString()),
    end_date:    toLocal(editEvent?.end_date   ?? new Date(Date.now() + 3600000).toISOString()),
    is_active:   editEvent?.is_active   ?? true,
  })

  // step 2 state
  const existingDiscs = allDiscounts.filter(d => d.event_id === editEvent?.id)
  const [selected, setSelected]   = useState(() => new Set(existingDiscs.map(d => d.product_id).filter(Boolean)))
  const [discMethod, setDiscMethod] = useState(existingDiscs[0]?.discount_method ?? 'percentage')
  const [discValue,  setDiscValue]  = useState(existingDiscs[0]?.discount_value  ?? '')
  const [saving, setSaving] = useState(false)

  const allSelected = products.length > 0 && selected.size === products.length
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(products.map(p => p.id)))
  const toggle      = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const step1Valid = form.name.trim() && form.start_date && form.end_date && new Date(form.end_date) > new Date(form.start_date)

  const handleFinish = async () => {
    if (!discValue || parseFloat(discValue) <= 0) { toast('Enter a discount value', 'error'); return }
    setSaving(true)
    try {
      // 1. Create or update event
      const dto = { ...form, start_date: new Date(form.start_date).toISOString(), end_date: new Date(form.end_date).toISOString() }
      const ev  = isEdit ? await api.updateEvent(editEvent.id, dto) : await api.createEvent(dto)

      // 2. Delete old discounts for this event
      for (const d of existingDiscs) await api.deleteDiscount(d.id).catch(() => {})

      // 3. Create new discounts for each selected product
      for (const pid of selected) {
        const pName = products.find(p => p.id === pid)?.name ?? 'Product'
        await api.createDiscount({
          name:             `${ev.name} — ${pName}`,
          type:             'event',
          event_id:         ev.id,
          product_id:       pid,
          discount_method:  discMethod,
          discount_value:   parseFloat(parseFloat(discValue).toFixed(4)),
          is_active:        true,
        })
      }

      toast(isEdit ? 'Event updated' : 'Event created', 'success')
      onSaved()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  // ── Step indicator ───────────────────────────────────────────────────────
  const StepDot = ({ n }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-m)',
        background: step >= n ? 'var(--accent)' : C.card,
        color: step >= n ? '#fff' : C.muted,
        border: `1px solid ${step >= n ? 'var(--accent)' : C.divider}`,
      }}>{n}</div>
      <span style={{ fontSize: 11, color: step === n ? C.cream : C.muted }}>
        {n === 1 ? 'Event Details' : 'Product Discounts'}
      </span>
    </div>
  )

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: step === 2 ? 680 : 520 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 17, letterSpacing: '.08em', textTransform: 'uppercase', color: C.cream }}>
              {isEdit ? 'Edit Event' : 'New Event'}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <StepDot n={1} /><div style={{ width: 20, height: 1, background: C.divider, alignSelf: 'center' }} /><StepDot n={2} />
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* ── STEP 1: Event details ─────────────────────────────── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Field label="Event Name">
              <input className="input" autoFocus required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Happy Hour" />
            </Field>
            <Field label="Description">
              <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
            </Field>
            <Row>
              <Field label="Start Date & Time" style={{ flex: 1 }}>
                <input className="input" type="datetime-local" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              </Field>
              <Field label="End Date & Time" style={{ flex: 1 }}>
                <input className="input" type="datetime-local" required value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </Field>
            </Row>
            {form.start_date && form.end_date && new Date(form.end_date) <= new Date(form.start_date) && (
              <div style={{ fontSize: 11, color: 'var(--danger)' }}>End time must be after start time</div>
            )}
            <CheckField label="Active (event goes live on schedule)" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="btn btn-primary" disabled={!step1Valid} onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Next — Set Discounts →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Product discounts ─────────────────────────── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Discount config bar */}
            <div style={{ background: `${C.accent}12`, border: `1px solid ${C.accent}30`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Tag size={14} color={C.accentH} />
              <span style={{ fontSize: 12, color: C.cream2, flex: 1 }}>Discount applied to selected products:</span>
              <select
                className="input"
                style={{ width: 160, height: 36, fontSize: 12 }}
                value={discMethod}
                onChange={e => setDiscMethod(e.target.value)}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
              <input
                className="input"
                type="number" min="0" step={discMethod === 'percentage' ? '1' : '0.01'}
                placeholder={discMethod === 'percentage' ? '10' : '0.50'}
                value={discValue}
                onChange={e => setDiscValue(e.target.value)}
                style={{ width: 90, height: 36, fontSize: 14, fontFamily: 'var(--font-m)', textAlign: 'center' }}
              />
              <span style={{ fontSize: 13, color: C.accentH, fontFamily: 'var(--font-m)', fontWeight: 700, minWidth: 30 }}>
                {discValue ? (discMethod === 'percentage' ? `${discValue}%` : `$${discValue}`) : '—'}
              </span>
            </div>

            {/* Select all toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.muted }}>{selected.size} of {products.length} products selected</span>
              <button
                className="btn btn-ghost"
                style={{ height: 30, fontSize: 12, padding: '0 12px' }}
                onClick={toggleAll}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Product list */}
            <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {products.map(p => {
                const checked = selected.has(p.id)
                return (
                  <div
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px',
                      borderRadius: 8, cursor: 'pointer',
                      background: checked ? `${C.accent}14` : 'transparent',
                      border: `1px solid ${checked ? C.accent + '40' : C.divider}`,
                      transition: 'all .15s',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      background: checked ? 'var(--accent)' : 'transparent',
                      border: `2px solid ${checked ? 'var(--accent)' : C.muted}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
                    </div>

                    {/* Product info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: C.cream, fontWeight: checked ? 600 : 400 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>${Number(p.base_price).toFixed(2)} · {p.categories?.name ?? p.category ?? ''}</div>
                    </div>

                    {/* Preview discounted price */}
                    {checked && discValue && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: C.muted, textDecoration: 'line-through' }}>${Number(p.base_price).toFixed(2)}</div>
                        <div style={{ fontSize: 12, color: C.success, fontFamily: 'var(--font-m)', fontWeight: 700 }}>
                          {discMethod === 'percentage'
                            ? `$${Math.max(0, p.base_price - p.base_price * parseFloat(discValue) / 100).toFixed(2)}`
                            : `$${Math.max(0, p.base_price - parseFloat(discValue)).toFixed(2)}`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, borderTop: `1px solid ${C.divider}`, paddingTop: 14 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                disabled={saving || selected.size === 0 || !discValue || parseFloat(discValue) <= 0}
                onClick={handleFinish}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {saving
                  ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#fff' }} /> Saving…</>
                  : <>{isEdit ? 'Update Event' : 'Create Event'} ({selected.size} products)</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EventsSection() {
  const toast = useToast()
  const [events, setEvents]         = useState([])
  const [products, setProducts]     = useState([])
  const [allDiscounts, setAllDiscounts] = useState([])
  const [loading, setLoading]       = useState(true)
  const [wizard, setWizard]         = useState(null)  // null | { editEvent? }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [evs, prods, discs] = await Promise.all([api.getEvents(), api.getProducts(), api.getDiscounts()])
      setEvents(evs ?? [])
      setProducts((prods ?? []).filter(p => p.is_active !== false))
      setAllDiscounts(discs ?? [])
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (ev) => {
    if (!confirm('Delete this event and all its discounts?')) return
    const evDiscs = allDiscounts.filter(d => d.event_id === ev.id)
    for (const d of evDiscs) await api.deleteDiscount(d.id).catch(() => {})
    try { await api.deleteEvent(ev.id); toast('Event deleted', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  const handleDeleteDiscount = async (id) => {
    try { await api.deleteDiscount(id); toast('Discount removed', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  const eventStatus = (ev) => {
    const now = new Date(), start = new Date(ev.start_date), end = new Date(ev.end_date)
    if (!ev.is_active)  return { label: 'Inactive',  color: C.muted }
    if (now < start)    return { label: 'Scheduled', color: C.info }
    if (now > end)      return { label: 'Expired',   color: C.muted }
    return { label: 'LIVE', color: C.success }
  }

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const productName = (id) => products.find(p => p.id === id)?.name ?? '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: C.muted }}>{events.length} events</span>
        <button className="btn btn-primary" onClick={() => setWizard({})} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} strokeWidth={2.5} /> New Event
        </button>
      </div>

      {loading ? <Spinner /> : events.length === 0
        ? <div style={{ textAlign: 'center', color: C.muted, padding: 48, fontSize: 13 }}>No events yet. Create one to set up automatic discounts.</div>
        : events.map(ev => {
            const status = eventStatus(ev)
            const discs  = allDiscounts.filter(d => d.event_id === ev.id)
            return (
              <div key={ev.id} style={{ background: C.card, border: `1px solid ${status.label === 'LIVE' ? C.success + '50' : C.divider}`, borderRadius: 14, padding: '16px 20px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <CalendarClock size={16} color={status.color} strokeWidth={1.8} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.cream }}>{ev.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: status.color, background: `${status.color}18`, border: `1px solid ${status.color}40`, borderRadius: 99, padding: '2px 8px' }}>
                      {status.label}
                    </span>
                  </div>
                  <Row gap={6}>
                    <ActionBtn onClick={() => setWizard({ editEvent: ev })}><Pencil size={13} />Edit</ActionBtn>
                    <ActionBtn danger onClick={() => handleDelete(ev)}><Trash2 size={13} />Del</ActionBtn>
                  </Row>
                </div>

                {/* Description */}
                {ev.description && <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{ev.description}</div>}

                {/* Dates */}
                <div style={{ display: 'flex', gap: 24, fontSize: 12, color: C.muted, marginBottom: discs.length ? 10 : 0 }}>
                  <span>Start: <span style={{ color: C.cream2 }}>{fmtDate(ev.start_date)}</span></span>
                  <span>End: <span style={{ color: C.cream2 }}>{fmtDate(ev.end_date)}</span></span>
                </div>

                {/* Discount chips */}
                {discs.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                    {discs.map(d => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 99, padding: '3px 8px 3px 8px', fontSize: 11 }}>
                        <span style={{ color: C.cream2 }}>{d.product_id ? productName(d.product_id) : 'All items'}</span>
                        <span style={{ color: C.accentH, fontFamily: 'var(--font-m)', fontWeight: 700 }}>
                          {d.discount_method === 'percentage' ? `−${d.discount_value}%` : `−$${Number(d.discount_value).toFixed(2)}`}
                        </span>
                        <button onClick={() => handleDeleteDiscount(d.id)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 13 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
      }

      {/* 2-step wizard */}
      {wizard !== null && (
        <EventWizard
          products={products}
          allDiscounts={allDiscounts}
          editEvent={wizard.editEvent ?? null}
          onClose={() => setWizard(null)}
          onSaved={() => { setWizard(null); load() }}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   CUSTOMERS SECTION
════════════════════════════════════════════════════════════ */
const TIERS = ['regular', 'silver', 'gold', 'vip']
const TIER_COLORS = { regular: C.muted, silver: C.cream2, gold: C.accentH, vip: C.success }

function CustomersSection() {
  const toast = useToast()
  const [customers, setCustomers]   = useState([])
  const [discounts, setDiscounts]   = useState([])   // all discounts, for showing per-customer ones
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [modal, setModal]           = useState(null)  // null | { mode: 'add' } | { mode: 'edit', id }
  const [saving, setSaving]         = useState(false)

  // customer form
  const blankForm = { name: '', phone: '', email: '', tier: 'regular' }
  const [form, setForm] = useState(blankForm)

  // discount sub-form (optional, created with the customer)
  const blankDisc = { enabled: false, discount_method: 'percentage', discount_value: '' }
  const [discForm, setDiscForm] = useState(blankDisc)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [c, d] = await Promise.all([api.getCustomers(), api.getDiscounts()])
      setCustomers(c ?? [])
      setDiscounts(d ?? [])
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setForm(blankForm)
    setDiscForm(blankDisc)
    setModal({ mode: 'add' })
  }

  const openEdit = (c) => {
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', tier: c.tier || 'regular' })
    // Check if this customer already has a discount
    const existing = discounts.find(d => d.customer_id === c.id && d.type === 'customer')
    setDiscForm(existing
      ? { enabled: true, discount_method: existing.discount_method, discount_value: String(existing.discount_value), existingDiscountId: existing.id }
      : blankDisc
    )
    setModal({ mode: 'edit', id: c.id })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let customerId = modal.id
      if (modal.mode === 'add') {
        const c = await api.createCustomer({ name: form.name.trim(), phone: form.phone.trim() || undefined, email: form.email.trim() || undefined, tier: form.tier })
        customerId = c.id
        toast('Customer created', 'success')
      } else {
        await api.updateCustomer(modal.id, { name: form.name.trim(), phone: form.phone.trim() || undefined, email: form.email.trim() || undefined, tier: form.tier })
        toast('Customer updated', 'success')
      }

      // Handle discount
      if (discForm.enabled && discForm.discount_value && parseFloat(discForm.discount_value) > 0) {
        const discDto = {
          name: `${form.name.trim()} discount`,
          type: 'customer',
          discount_method: discForm.discount_method,
          discount_value: parseFloat(discForm.discount_value),
          customer_id: customerId,
          is_active: true,
        }
        if (discForm.existingDiscountId) {
          await api.updateDiscount(discForm.existingDiscountId, discDto)
        } else {
          await api.createDiscount(discDto)
        }
      } else if (!discForm.enabled && discForm.existingDiscountId) {
        // Remove discount if user unchecked it
        await api.deleteDiscount(discForm.existingDiscountId)
      }

      setModal(null)
      load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (c) => {
    if (!confirm(`Delete customer "${c.name}"?`)) return
    try {
      // Remove linked discounts first
      const linked = discounts.filter(d => d.customer_id === c.id)
      await Promise.all(linked.map(d => api.deleteDiscount(d.id)))
      await api.deleteCustomer(c.id)
      toast('Customer deleted', 'success')
      load()
    } catch (e) { toast(e.message, 'error') }
  }

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
        <input className="input" placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}><Plus size={14} strokeWidth={2.5} /> Add Customer</button>
      </div>

      {loading ? <Spinner /> : (
        <DataTable headers={['Name', 'Phone / Email', 'Tier', 'Discount', 'Points', '']}>
          {filtered.map(c => {
            const disc = discounts.find(d => d.customer_id === c.id && d.type === 'customer')
            return (
              <tr key={c.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                <Td bold>{c.name}</Td>
                <Td>
                  <div style={{ fontSize: 12, color: C.cream2 }}>{c.phone || '—'}</div>
                  {c.email && <div style={{ fontSize: 11, color: C.muted }}>{c.email}</div>}
                </Td>
                <Td>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TIER_COLORS[c.tier] || C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {c.tier || 'regular'}
                  </span>
                </Td>
                <Td>
                  {disc ? (
                    <span style={{ fontSize: 11, color: C.success, fontFamily: 'var(--font-m)', background: 'rgba(74,222,128,.1)', padding: '2px 8px', borderRadius: 99 }}>
                      {disc.discount_method === 'percentage' ? `${disc.discount_value}% off` : `$${disc.discount_value} off`}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: C.muted }}>—</span>
                  )}
                </Td>
                <Td mono accent>{c.loyalty_points ?? 0}</Td>
                <Td>
                  <Row gap={4}>
                    <button className="btn-icon" onClick={() => openEdit(c)}><Pencil size={13} strokeWidth={2} /></button>
                    <button className="btn-icon" style={{ color: C.danger }} onClick={() => handleDelete(c)}><Trash2 size={13} strokeWidth={2} /></button>
                  </Row>
                </Td>
              </tr>
            )
          })}
          {filtered.length === 0 && <EmptyRow cols={6} />}
        </DataTable>
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Customer' : 'Edit Customer'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Field label="Full Name *">
              <input className="input" required placeholder="e.g. Sopheap Chan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>

            <Row>
              <Field label="Phone" style={{ flex: 1 }}>
                <input className="input" placeholder="e.g. 012 345 678" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Email" style={{ flex: 1 }}>
                <input className="input" type="email" placeholder="optional" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </Field>
            </Row>

            <Field label="Tier">
              <select className="input" value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>
                {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </Field>

            {/* Discount sub-section */}
            <div style={{ borderTop: `1px solid ${C.divider}`, paddingTop: 12 }}>
              <CheckField
                label="Apply automatic discount for this customer"
                checked={discForm.enabled}
                onChange={v => setDiscForm({ ...discForm, enabled: v })}
              />
              {discForm.enabled && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Row>
                    <Field label="Discount Type" style={{ flex: 1 }}>
                      <select className="input" value={discForm.discount_method} onChange={e => setDiscForm({ ...discForm, discount_method: e.target.value })}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </Field>
                    <Field label={discForm.discount_method === 'percentage' ? 'Discount %' : 'Discount $'} style={{ width: 120 }}>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step={discForm.discount_method === 'percentage' ? '1' : '0.01'}
                        max={discForm.discount_method === 'percentage' ? '100' : undefined}
                        placeholder={discForm.discount_method === 'percentage' ? 'e.g. 10' : 'e.g. 2.00'}
                        value={discForm.discount_value}
                        onChange={e => setDiscForm({ ...discForm, discount_value: e.target.value })}
                      />
                    </Field>
                  </Row>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                    This discount will auto-apply to every invoice when this customer is selected at checkout.
                  </p>
                </div>
              )}
            </div>

            <ModalActions onCancel={() => setModal(null)} saving={saving} label={modal.mode === 'add' ? 'Create Customer' : 'Save Changes'} />
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   REPORTS SECTION
════════════════════════════════════════════════════════════ */

const PAYMENT_ICON_MAP = {
  cash: Banknote, card: CreditCard, credit_card: CreditCard,
  qr: Smartphone, khqr: Smartphone, 'e-wallet': Smartphone, bank_transfer: Building2,
}
function pmIcon(method) { return PAYMENT_ICON_MAP[(method ?? '').toLowerCase()] ?? Banknote }

/* ── Sub-report: Revenue Summary ─────────────────────────── */
function RevenueReport({ data }) {
  const avgOrder = data.total_receipts > 0 ? data.total_revenue / data.total_receipts : 0
  const daily = (data.daily_breakdown ?? []).map(d => ({
    date: d.date.slice(5),
    revenue: Number(d.revenue),
    discount: Number(d.discount),
    orders: Number(d.receipts),
  }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 }}>
        <KpiCard Icon={TrendingUp}  label="Total Revenue"   value={`$${Number(data.total_revenue).toFixed(2)}`} />
        <KpiCard Icon={ShoppingBag} label="Total Orders"    value={data.total_receipts}   color={C.info} />
        <KpiCard Icon={Tag}         label="Discounts Given" value={`-$${Number(data.total_discount).toFixed(2)}`} color={C.danger} />
        <KpiCard Icon={BarChart2}   label="Avg Order Value" value={`$${avgOrder.toFixed(2)}`} color={C.success} />
      </div>

      {daily.length > 0 ? (
        <>
          <ChartCard title="Daily Revenue & Discounts">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={18} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: C.cream2 }} />
                <Bar dataKey="revenue"  name="Revenue"  fill={C.accent} radius={[4,4,0,0]} />
                <Bar dataKey="discount" name="Discount" fill={C.danger} radius={[4,4,0,0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Daily Breakdown">
            <DataTable headers={['Date', 'Orders', 'Revenue', 'Discount', 'Net']}>
              {daily.map((d, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <Td mono muted>{d.date}</Td>
                  <Td mono>{d.orders}</Td>
                  <Td mono accent>${d.revenue.toFixed(2)}</Td>
                  <Td mono muted>-${d.discount.toFixed(2)}</Td>
                  <Td mono bold>${(d.revenue - d.discount).toFixed(2)}</Td>
                </tr>
              ))}
            </DataTable>
          </ChartCard>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 56, color: C.muted, fontSize: 13 }}>No sales data for this period</div>
      )}
    </div>
  )
}

/* ── Sub-report: Sales by Product ────────────────────────── */
function ProductsReport({ data }) {
  const products = data.products ?? []
  const top = products.slice(0, 10).map(p => ({
    name: p.product_name.length > 22 ? p.product_name.slice(0, 22) + '…' : p.product_name,
    revenue: Number(p.net_revenue),
  }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {top.length > 0 && (
        <ChartCard title="Top 10 Products by Revenue">
          <ResponsiveContainer width="100%" height={Math.max(180, top.length * 34)}>
            <BarChart data={top} layout="vertical" margin={{ top: 4, right: 24, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.divider} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <YAxis dataKey="name" type="category" width={130} tick={{ fill: C.cream2, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill={C.accent} radius={[0,4,4,0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      <ChartCard title={`All Products (${products.length})`}>
        <DataTable headers={['#', 'Product', 'Qty', 'Gross', 'Discount', 'Net Revenue']}>
          {products.length === 0 ? <EmptyRow cols={6} /> : products.map((p, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
              <Td muted w={32}>{i + 1}</Td>
              <Td bold>{p.product_name}</Td>
              <Td mono>{p.total_quantity}</Td>
              <Td mono>${Number(p.total_subtotal).toFixed(2)}</Td>
              <Td mono muted>-${Number(p.total_discount).toFixed(2)}</Td>
              <Td mono accent>${Number(p.net_revenue).toFixed(2)}</Td>
            </tr>
          ))}
        </DataTable>
      </ChartCard>
    </div>
  )
}

/* ── Sub-report: Sales by Category ──────────────────────── */
function CategoryReport({ data }) {
  const cats = data.categories ?? []
  const totalRev = cats.reduce((s, c) => s + Number(c.net_revenue), 0)
  const pieData = cats.map(c => ({ name: c.category_name, value: Number(c.net_revenue) }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {cats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 56, color: C.muted, fontSize: 13 }}>No category data for this period</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>
          <ChartCard title="Revenue Split">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={82} dataKey="value" labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={C.PIE[i % C.PIE.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: C.cream2 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="By Category">
            <DataTable headers={['Category', 'Items Sold', 'Revenue', '% of Total']}>
              {cats.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <Td bold>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.PIE[i % C.PIE.length], flexShrink: 0 }} />
                      {c.category_name}
                    </div>
                  </Td>
                  <Td mono>{c.total_quantity}</Td>
                  <Td mono accent>${Number(c.net_revenue).toFixed(2)}</Td>
                  <Td mono muted>{totalRev > 0 ? ((Number(c.net_revenue) / totalRev) * 100).toFixed(1) : '0.0'}%</Td>
                </tr>
              ))}
            </DataTable>
          </ChartCard>
        </div>
      )}
    </div>
  )
}

/* ── Sub-report: Payment Breakdown ───────────────────────── */
function PaymentReport({ data }) {
  const methods = Object.entries(data.by_payment_method ?? {}).map(([key, val]) => ({
    method: key, count: val.count,
    total: Number(val.total), discount: Number(val.total_discount),
  }))
  const totalRev = methods.reduce((s, m) => s + m.total, 0)
  const pieData = methods.map(m => ({ name: capitalize(m.method), value: m.total }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {methods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 56, color: C.muted, fontSize: 13 }}>No payment data for this period</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 }}>
            <KpiCard Icon={TrendingUp}  label="Total Revenue"  value={`$${totalRev.toFixed(2)}`} />
            <KpiCard Icon={ShoppingBag} label="Transactions"   value={methods.reduce((s, m) => s + m.count, 0)} color={C.info} />
            <KpiCard Icon={Tag}         label="Total Discounts" value={`-$${methods.reduce((s, m) => s + m.discount, 0).toFixed(2)}`} color={C.danger} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>
            <ChartCard title="Revenue Split">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={82} dataKey="value" labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={C.PIE[i % C.PIE.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: C.cream2 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Payment Methods">
              <DataTable headers={['Method', 'Transactions', 'Revenue', 'Discounts', '% of Total']}>
                {methods.map((m, i) => {
                  const PMIcon = pmIcon(m.method)
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <PMIcon size={13} style={{ color: C.accent, flexShrink: 0 }} />
                          <span style={{ textTransform: 'capitalize' }}>{capitalize(m.method)}</span>
                        </div>
                      </Td>
                      <Td mono>{m.count}</Td>
                      <Td mono accent>${m.total.toFixed(2)}</Td>
                      <Td mono muted>-${m.discount.toFixed(2)}</Td>
                      <Td mono muted>{totalRev > 0 ? ((m.total / totalRev) * 100).toFixed(1) : '0.0'}%</Td>
                    </tr>
                  )
                })}
              </DataTable>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Sub-report: Shift History ───────────────────────────── */
function ShiftsReport({ data }) {
  const shifts = data.shifts ?? []
  const totalRevenue = shifts.reduce((s, sh) => s + Number(sh.total_revenue), 0)
  const totalOrders  = shifts.reduce((s, sh) => s + Number(sh.total_receipts), 0)

  function shiftDuration(opened, closed) {
    if (!closed) return 'Open'
    const mins = Math.round((new Date(closed) - new Date(opened)) / 60000)
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 }}>
        <KpiCard Icon={Clock}       label="Total Shifts"  value={shifts.length} />
        <KpiCard Icon={ShoppingBag} label="Total Orders"  value={totalOrders}   color={C.info} />
        <KpiCard Icon={TrendingUp}  label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} color={C.success} />
      </div>
      <ChartCard title={`Shift History (${shifts.length})`}>
        <DataTable headers={['Shift #', 'Staff', 'Opened', 'Closed', 'Duration', 'Orders', 'Revenue']}>
          {shifts.length === 0 ? <EmptyRow cols={7} /> : shifts.map((s, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
              <Td mono accent>{s.shift_number}</Td>
              <Td bold>{s.users?.name ?? '—'}</Td>
              <Td muted style={{ fontSize: 11 }}>{new Date(s.opened_at).toLocaleString()}</Td>
              <Td muted style={{ fontSize: 11 }}>
                {s.closed_at
                  ? new Date(s.closed_at).toLocaleString()
                  : <span style={{ color: C.success, fontFamily: 'var(--font-m)', fontSize: 11 }}>Open</span>}
              </Td>
              <Td mono>{shiftDuration(s.opened_at, s.closed_at)}</Td>
              <Td mono>{s.total_receipts}</Td>
              <Td mono accent>${Number(s.total_revenue).toFixed(2)}</Td>
            </tr>
          ))}
        </DataTable>
      </ChartCard>
    </div>
  )
}

/* ── Main Reports Section ────────────────────────────────── */
const REPORT_TYPES = [
  { key: 'revenue',  label: 'Revenue Summary',  Icon: TrendingUp  },
  { key: 'products', label: 'Sales by Product',  Icon: ShoppingBag },
  { key: 'category', label: 'By Category',       Icon: FolderOpen  },
  { key: 'payment',  label: 'Payment Methods',   Icon: CreditCard  },
  { key: 'shifts',   label: 'Shift History',     Icon: Clock       },
]

const DATE_PRESETS = [
  { key: 'today',     label: 'Today'      },
  { key: 'yesterday', label: 'Yesterday'  },
  { key: 'week',      label: 'This Week'  },
  { key: 'month',     label: 'This Month' },
  { key: 'lastmonth', label: 'Last Month' },
]

function ReportsSection() {
  const toast = useToast()
  const today = new Date().toISOString().slice(0, 10)

  const [activeType, setActiveType] = useState('revenue')
  const [startDate,  setStartDate]  = useState(today)
  const [endDate,    setEndDate]    = useState(today)
  const [preset,     setPreset]     = useState('today')
  const [branchId,   setBranchId]   = useState('')
  const [branches,   setBranches]   = useState([])
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    api.getBranches().then(setBranches).catch(() => {})
  }, [])

  const applyPreset = (key) => {
    const now = new Date()
    const fmt = d => d.toISOString().slice(0, 10)
    setPreset(key)
    if (key === 'today') {
      setStartDate(today); setEndDate(today)
    } else if (key === 'yesterday') {
      const d = new Date(now); d.setDate(d.getDate() - 1)
      const s = fmt(d); setStartDate(s); setEndDate(s)
    } else if (key === 'week') {
      const d = new Date(now); d.setDate(d.getDate() - d.getDay())
      setStartDate(fmt(d)); setEndDate(today)
    } else if (key === 'month') {
      setStartDate(fmt(new Date(now.getFullYear(), now.getMonth(), 1))); setEndDate(today)
    } else if (key === 'lastmonth') {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0)
      setStartDate(fmt(s)); setEndDate(fmt(e))
    }
  }

  const fetchReport = useCallback(async (type, start, end, bid) => {
    setLoading(true); setData(null)
    try {
      let result
      if      (type === 'revenue')  result = await api.getRevenueSummary(start, end, bid)
      else if (type === 'products') result = await api.getSalesByProduct(start, end, bid)
      else if (type === 'category') result = await api.getSalesByCategory(start, end, bid)
      else if (type === 'payment')  result = await api.getPaymentBreakdown(start, end, bid)
      else if (type === 'shifts')   result = await api.getShiftHistory(start, end, bid)
      setData(result)
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { fetchReport(activeType, startDate, endDate, branchId) }, [])

  const handleTypeChange = (key) => {
    setActiveType(key)
    fetchReport(key, startDate, endDate, branchId)
  }

  const handleGenerate = () => fetchReport(activeType, startDate, endDate, branchId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Report type tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {REPORT_TYPES.map(({ key, label, Icon }) => {
          const active = activeType === key
          return (
            <button
              key={key}
              onClick={() => handleTypeChange(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 500,
                border: `1px solid ${active ? C.accent : C.divider}`,
                background: active ? `${C.accent}18` : 'transparent',
                color: active ? C.accentH : C.cream2,
                cursor: 'pointer', transition: 'all 150ms', letterSpacing: '.02em',
              }}
            >
              <Icon size={13} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Date filter bar */}
      <div style={{ background: C.card, border: `1px solid ${C.divider}`, borderRadius: 14, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Presets */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 9.5, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginRight: 2, fontWeight: 700 }}>Quick</span>
          {DATE_PRESETS.map(p => {
            const active = preset === p.key
            return (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                style={{
                  padding: '3px 11px', borderRadius: 99, fontSize: 11, fontWeight: 500,
                  border: `1px solid ${active ? C.accent : C.divider}`,
                  background: active ? `${C.accent}20` : 'transparent',
                  color: active ? C.accentH : C.muted,
                  cursor: 'pointer', transition: 'all 150ms',
                }}
              >{p.label}</button>
            )
          })}
        </div>
        {/* Date inputs + Branch + Generate */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Field label="From">
            <input className="input" type="date" value={startDate}
              onChange={e => { setStartDate(e.target.value); setPreset(null) }}
              style={{ width: 158 }} />
          </Field>
          <Field label="To">
            <input className="input" type="date" value={endDate}
              onChange={e => { setEndDate(e.target.value); setPreset(null) }}
              style={{ width: 158 }} />
          </Field>
          <Field label="Branch">
            <select
              className="input"
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 44 }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Generating…</>
              : <><BarChart2 size={14} /> Generate</>
            }
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? <Spinner /> : data && (
        activeType === 'revenue'  ? <RevenueReport  data={data} /> :
        activeType === 'products' ? <ProductsReport data={data} /> :
        activeType === 'category' ? <CategoryReport data={data} /> :
        activeType === 'payment'  ? <PaymentReport  data={data} /> :
        activeType === 'shifts'   ? <ShiftsReport   data={data} /> : null
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   EXCHANGE RATES SECTION
════════════════════════════════════════════════════════════ */
function ExchangeSection() {
  const toast = useToast()
  const [rate, setRate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newRate, setNewRate] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchRate = useCallback(async () => {
    try { const r = await api.getLatestRate('USD', 'KHR'); setRate(r); setNewRate(r.rate) }
    catch { setRate(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRate() }, [fetchRate])

  const handleSave = async (e) => {
    e.preventDefault(); if (!newRate || parseFloat(newRate) <= 0) return; setSaving(true)
    try { await api.createExchangeRate({ from_currency: 'USD', to_currency: 'KHR', rate: parseFloat(newRate) }); toast('Exchange rate updated', 'success'); fetchRate() }
    catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: C.card, border: `1px solid ${C.divider}`, borderRadius: 14, padding: '22px 24px' }}>
        <SectionTitle>Current Rate</SectionTitle>
        {loading ? <Spinner /> : rate ? (
          <div>
            <div style={{ fontFamily: 'var(--font-m)', fontSize: 34, color: C.accentH, marginBottom: 6 }}>
              1 USD = {Number(rate.rate).toLocaleString()} KHR
            </div>
            {rate.effective_date && <div style={{ fontSize: 11, color: C.muted }}>Effective: {new Date(rate.effective_date).toLocaleDateString()}</div>}
            {rate.updated_at    && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Updated: {new Date(rate.updated_at).toLocaleString()}</div>}
          </div>
        ) : <div style={{ color: C.muted, fontSize: 13 }}>No rate configured</div>}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.divider}`, borderRadius: 14, padding: '22px 24px' }}>
        <SectionTitle>Set New Rate</SectionTitle>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="1 USD = ? KHR">
            <input className="input" type="number" min="1" step="1" required value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="4100" style={{ fontSize: 22, fontFamily: 'var(--font-m)', height: 52 }} />
          </Field>
          <button className="btn btn-primary" type="submit" disabled={saving || !newRate}>{saving ? 'Updating…' : 'Update Exchange Rate'}</button>
        </form>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   STAFF / USERS SECTION
════════════════════════════════════════════════════════════ */
function UsersSection({ currentUser }) {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'cashier', is_active: true, branch_id: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { const [u, b] = await Promise.all([api.getUsers(), api.getBranches()]); setUsers(u); setBranches(b) }
    catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm({ name: '', username: '', password: '', role: 'cashier', is_active: true, branch_id: '' }); setModal({ mode: 'add' }) }
  const openEdit = u  => { setForm({ name: u.name, username: u.username, password: '', role: u.role, is_active: u.is_active ?? true, branch_id: u.branch_id || '' }); setModal({ mode: 'edit', id: u.id }) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const dto = { ...form }; if (!dto.password) delete dto.password
      if (modal.mode === 'add') { await api.createUser(dto); toast('Staff account created', 'success') }
      else { await api.updateUser(modal.id, dto); toast('Staff account updated', 'success') }
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async u => {
    if (u.id === currentUser.id) { toast('Cannot delete your own account', 'error'); return }
    if (!confirm(`Delete staff account "${u.name}"?`)) return
    try { await api.deleteUser(u.id); toast('Deleted', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  const roleColors = { admin: C.accent, cashier: C.info, manager: C.success }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{users.length} staff accounts</span>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} strokeWidth={2.5} /> Add Staff</button>
      </div>

      {loading ? <Spinner /> : (
        <DataTable headers={['Name', 'Username', 'Role', 'Branch', 'Status', 'Actions']}>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
              <Td bold>
                {u.name}
                {u.id === currentUser.id && <span style={{ fontSize: 10, color: C.muted, marginLeft: 6 }}>(you)</span>}
              </Td>
              <Td mono>{u.username}</Td>
              <Td><span style={{ fontSize: 11, fontWeight: 700, color: roleColors[u.role] || C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>{u.role}</span></Td>
              <Td style={{ color: u.branches?.name ? C.accentH : C.muted, fontSize: 12 }}>{u.branches?.name || '—'}</Td>
              <Td><StatusBadge active={u.is_active} /></Td>
              <Td>
                <Row gap={6}>
                  <ActionBtn onClick={() => openEdit(u)}><Pencil size={13} />Edit</ActionBtn>
                  <ActionBtn danger disabled={u.id === currentUser.id} onClick={() => handleDelete(u)}><Trash2 size={13} />Del</ActionBtn>
                </Row>
              </Td>
            </tr>
          ))}
        </DataTable>
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Staff Account' : 'Edit Staff Account'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Field label="Full Name"><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Row>
              <Field label="Username" style={{ flex: 1 }}><input className="input" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} autoComplete="off" /></Field>
              <Field label="Role" style={{ width: 120 }}>
                <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            </Row>
            {form.role === 'cashier' && (
              <Field label="Branch">
                <select className="input" value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })}>
                  <option value="">— No branch assigned —</option>
                  {branches.filter(b => b.is_active).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
            )}
            <Field label={modal.mode === 'add' ? 'Password' : 'New Password (leave blank to keep)'}>
              <input className="input" type="password" required={modal.mode === 'add'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
            </Field>
            <CheckField label="Account Active" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
            <ModalActions onCancel={() => setModal(null)} saving={saving} label="Save Account" />
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
════════════════════════════════════════════════════════════ */
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: 16, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20, color: C.cream }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children, style }) {
  return (
    <label className="form-label" style={style}>
      {label}
      {children}
    </label>
  )
}

function CheckField({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.cream2, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function ModalActions({ onCancel, saving, label }) {
  return (
    <Row gap={8} style={{ marginTop: 4 }}>
      <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : label}</button>
    </Row>
  )
}

function DataTable({ headers, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.divider}`, borderRadius: 14, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1A1510' }}>
            {headers.map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, color: C.muted, letterSpacing: '.09em', textTransform: 'uppercase', fontWeight: 700, borderBottom: `1px solid ${C.divider}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children, bold, mono, accent, muted, w, style }) {
  return (
    <td style={{
      padding: '10px 14px',
      fontSize: mono ? undefined : 13,
      fontFamily: mono ? 'var(--font-m)' : undefined,
      color: accent ? C.accentH : muted ? C.muted : bold ? C.cream : C.cream2,
      fontWeight: bold ? 500 : undefined,
      width: w,
      ...style,
    }}>{children}</td>
  )
}

function EmptyRow({ cols }) {
  return <tr><td colSpan={cols} style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 13 }}>No data found</td></tr>
}

function StatusBadge({ active, style }) {
  return <span className={`chip ${active ? '' : 'chip-danger'}`} style={style}>{active ? 'Active' : 'Inactive'}</span>
}

function ActionBtn({ children, danger, onClick, disabled }) {
  return (
    <button
      className={`btn ${danger ? 'btn-danger' : 'btn-ghost'}`}
      style={{ height: 30, padding: '0 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, opacity: disabled ? 0.4 : 1 }}
      onClick={onClick} disabled={disabled}
    >{children}</button>
  )
}

/* ════════════════════════════════════════════════════════════
   ROOT
════════════════════════════════════════════════════════════ */
export default function AdminDashboard({ user, onLogout }) {
  const [section, setSection] = useState('dashboard')
  return (
    <div style={{ display: 'flex', height: '100%', background: '#080604', position: 'relative', zIndex: 1 }}>
      <Sidebar user={user} active={section} onChange={setSection} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <MainHeader section={section} user={user} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {section === 'dashboard'  && <DashboardSection />}
          {section === 'branches'   && <BranchesSection />}
          {section === 'products'   && <ProductsSection />}
          {section === 'categories' && <CategoriesSection />}
          {section === 'toppings'   && <ToppingsSection />}
          {section === 'events'     && <EventsSection />}
          {section === 'customers'  && <CustomersSection />}
          {section === 'reports'    && <ReportsSection />}
          {section === 'exchange'   && <ExchangeSection />}
          {section === 'users'      && <UsersSection currentUser={user} />}
        </div>
      </div>
    </div>
  )
}
