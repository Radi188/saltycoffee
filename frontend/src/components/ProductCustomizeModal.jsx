import { useState } from 'react'
import { Coffee, Leaf, Droplets, Cookie, X } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

const CAT_ICONS = {
  coffee:        Coffee,
  tea:           Leaf,
  'cold drinks': Droplets,
  food:          Cookie,
  default:       Coffee,
}

function catIcon(name) {
  return CAT_ICONS[(name ?? '').toLowerCase()] ?? CAT_ICONS.default
}

export default function ProductCustomizeModal({ product, toppings = [], onAdd, onClose }) {
  const { fmtBoth } = useCurrency()

  // Sizes sorted by sort_order
  const sizes = (product.product_sizes ?? [])
    .filter((s) => s.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order)

  const hasSizes = sizes.length > 0

  // Default to medium if available, else first size
  const defaultSize = hasSizes
    ? (sizes.find((s) => s.size_label === 'M') ?? sizes[0])
    : null

  const [selectedSize,     setSelectedSize]     = useState(defaultSize)
  const [selectedToppings, setSelectedToppings] = useState([])
  const [qty,              setQty]              = useState(1)

  // Computed price
  const sizePrice    = selectedSize ? Number(selectedSize.price) : Number(product.base_price)
  const toppingsTotal = selectedToppings.reduce((s, t) => s + Number(t.price), 0)
  const unitPrice    = parseFloat((sizePrice + toppingsTotal).toFixed(2))
  const lineTotal    = parseFloat((unitPrice * qty).toFixed(2))

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.id === topping.id)
      return exists ? prev.filter((t) => t.id !== topping.id) : [...prev, topping]
    })
  }

  const handleAdd = () => {
    onAdd({
      id:         product.id,
      name:       product.name,
      unit_price: unitPrice,
      quantity:   qty,
      size_label: selectedSize?.size_label ?? null,
      selected_toppings: selectedToppings.map((t) => ({
        id: t.id, name: t.name, price: t.price,
      })),
      // for display in cart
      category:   product.categories?.name ?? product.category,
      _customKey: `${product.id}-${selectedSize?.size_label ?? ''}-${selectedToppings.map((t) => t.id).sort().join(',')}`,
    })
    onClose()
  }

  const Icon = catIcon(product.categories?.name ?? product.category)
  const both = fmtBoth(unitPrice)
  const lineBoth = fmtBoth(lineTotal)

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal customize-modal">

        {/* Header */}
        <div className="customize-header">
          <div className="customize-icon"><Icon size={28} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, letterSpacing: '.08em', color: 'var(--cream)', textTransform: 'uppercase' }}>
              {product.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {product.categories?.name ?? product.category ?? 'Other'}
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="customize-body">

          {/* Size selector */}
          {hasSizes && (
            <section className="customize-section">
              <div className="customize-section-label">Size</div>
              <div className="size-pills">
                {sizes.map((s) => {
                  const active = selectedSize?.id === s.id
                  const priceBoth = fmtBoth(s.price)
                  return (
                    <button
                      key={s.id}
                      className={`size-pill ${active ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      <span className="size-pill-label">{s.size_label}</span>
                      <span className="size-pill-price">{priceBoth.primary}</span>
                      <span className="size-pill-secondary">{priceBoth.secondary}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Toppings */}
          {toppings.length > 0 && (
            <section className="customize-section">
              <div className="customize-section-label">Add-ons</div>
              <div className="toppings-grid">
                {toppings.map((t) => {
                  const checked = !!selectedToppings.find((x) => x.id === t.id)
                  const pb = fmtBoth(t.price)
                  return (
                    <button
                      key={t.id}
                      className={`topping-chip ${checked ? 'active' : ''}`}
                      onClick={() => toggleTopping(t)}
                    >
                      <span className="topping-check">{checked ? '✓' : '+'}</span>
                      <span className="topping-name">{t.name}</span>
                      <span className="topping-price">+{pb.primary}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Quantity */}
          <section className="customize-section">
            <div className="customize-section-label">Quantity</div>
            <div className="qty-row">
              <button className="qty-btn large" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="qty-num large">{qty}</span>
              <button className="qty-btn large" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="customize-footer">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 1 }}>
              {qty > 1 ? `${qty} × ${both.primary}` : 'Total'}
            </div>
            <div style={{ fontFamily: 'var(--font-m)', fontSize: 20, color: 'var(--accent-soft)', fontWeight: 700 }}>
              {lineBoth.primary}
            </div>
            <div style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--muted)' }}>
              {lineBoth.secondary}
            </div>
          </div>
          <button className="btn btn-primary" style={{ height: 48, padding: '0 28px', fontSize: 14, fontFamily: 'var(--font-d)', letterSpacing: '.1em' }} onClick={handleAdd}>
            Add to Order
          </button>
        </div>

      </div>
    </div>
  )
}
