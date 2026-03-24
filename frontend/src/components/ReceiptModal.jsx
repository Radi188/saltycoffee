import { useRef } from 'react'
import { Printer, X } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

export default function ReceiptModal({ receipt, invoice, order, onClose, onNewSale }) {
  const ref = useRef()
  const { fmtUSD, fmtKHR, fmtBoth, rate } = useCurrency()

  const handlePrint = () => window.print()

  const items     = invoice?.sale_invoice_items ?? []
  const discounts = invoice?.sale_invoice_discounts ?? []
  const payMethod = receipt?.payment_method?.toUpperCase() ?? '—'

  // Helper: render a dual-currency line on the receipt
  const DualLine = ({ label, usdAmount, labelStyle, isDiscount }) => {
    const both = fmtBoth(usdAmount)
    return (
      <div className="receipt-line" style={labelStyle}>
        <span>{label}</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: isDiscount ? 'var(--success)' : undefined }}>
            {isDiscount && '- '}{both.primary}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
            {isDiscount && '- '}{both.secondary}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className="btn btn-ghost" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={handlePrint}><Printer size={14} /> Print</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onNewSale}>+ New Sale</button>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Receipt paper */}
        <div className="receipt-paper" ref={ref}>

          {/* Header */}
          <div className="receipt-header">
            <img src="/logo.jpg" alt="Salty Coffee" className="receipt-logo-img" />
            <div style={{ color: 'var(--cream-2)', fontSize: 11, marginTop: 2 }}>Salty Coffee Cafe</div>
            <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 8 }}>
              {new Date(receipt?.created_at).toLocaleString()}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 10 }}>#{receipt?.receipt_number}</div>
            {order && <div style={{ color: 'var(--muted)', fontSize: 10 }}>Order: {order?.order_number}</div>}
          </div>

          {/* Exchange rate line */}
          <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', marginBottom: 10, letterSpacing: '.04em' }}>
            Rate: 1 USD = ៛{rate.toLocaleString()}
          </div>

          {/* Column headers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid var(--muted)' }}>
            <span>Item</span>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 70px', gap: 0, textAlign: 'right' }}>
              <span>USD</span>
              <span>KHR</span>
            </div>
          </div>

          {/* Items */}
          <div style={{ borderBottom: '1px dashed var(--muted)', paddingBottom: 10, marginBottom: 10 }}>
            {items.map((item, i) => {
              const usdAmt = Number(item.unit_price) * Number(item.quantity)
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                  <span style={{ color: 'var(--cream-2)', flex: 1, paddingRight: 6 }}>
                    {item.product_name} ×{item.quantity}
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px', gap: 0, textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: 11 }}>{fmtUSD(usdAmt)}</span>
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: 11 }}>{fmtKHR(usdAmt)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Discounts */}
          {discounts.length > 0 && (
            <div style={{ borderBottom: '1px dashed var(--muted)', paddingBottom: 10, marginBottom: 10 }}>
              {discounts.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                  <span style={{ color: 'var(--success)' }}>↘ {d.discount_name}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px', gap: 0, textAlign: 'right', color: 'var(--success)' }}>
                    <span style={{ fontFamily: 'var(--font-m)' }}>-{fmtUSD(d.applied_amount)}</span>
                    <span style={{ fontFamily: 'var(--font-m)' }}>-{fmtKHR(d.applied_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals grid */}
          {[
            { label: 'Subtotal', value: receipt?.subtotal },
            receipt?.discount_amount > 0
              ? { label: 'Discount', value: receipt?.discount_amount, isDiscount: true }
              : null,
          ].filter(Boolean).map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
              <span style={{ color: row.isDiscount ? 'var(--success)' : 'var(--cream-2)' }}>{row.label}</span>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 70px', gap: 0, textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: row.isDiscount ? 'var(--success)' : undefined }}>
                  {row.isDiscount ? '-' : ''}{fmtUSD(row.value)}
                </span>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: row.isDiscount ? 'var(--success)' : undefined }}>
                  {row.isDiscount ? '-' : ''}{fmtKHR(row.value)}
                </span>
              </div>
            </div>
          ))}

          {/* TOTAL — large */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--muted)', marginTop: 8, paddingTop: 8 }}>
            <span style={{ fontFamily: 'var(--font-m)', fontWeight: 700, fontSize: 13, color: 'var(--cream)' }}>TOTAL</span>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 70px', gap: 0, textAlign: 'right' }}>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: 14, fontWeight: 700, color: 'var(--accent-soft)' }}>{fmtUSD(receipt?.total)}</span>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: 14, fontWeight: 700, color: 'var(--accent-soft)' }}>{fmtKHR(receipt?.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ borderTop: '1px dashed var(--muted)', marginTop: 10, paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
              <span style={{ color: 'var(--cream-2)' }}>{payMethod}</span>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 70px', gap: 0, textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: 11 }}>{fmtUSD(receipt?.amount_paid)}</span>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: 11 }}>{fmtKHR(receipt?.amount_paid)}</span>
              </div>
            </div>
            {receipt?.change_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
                <span style={{ color: 'var(--success)' }}>Change</span>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 70px', gap: 0, textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--success)' }}>{fmtUSD(receipt?.change_amount)}</span>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--success)' }}>{fmtKHR(receipt?.change_amount)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="receipt-footer">
            Thank you for visiting<br />
            Salty Coffee Cafe ☕<br />
            Please come again!
          </div>
        </div>
      </div>
    </div>
  )
}
