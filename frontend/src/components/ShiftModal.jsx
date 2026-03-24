import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'

const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`

export default function ShiftModal({ user, shift, onShiftChange, onClose }) {
  const toast = useToast()
  const [mode, setMode] = useState(shift ? 'close' : 'open')
  const [openCash, setOpenCash] = useState('')
  const [closeCash, setCloseCash] = useState('')
  const [note, setNote] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (shift && mode === 'close') {
      api.getShiftSummary(shift.id).then(setSummary).catch(() => {})
    }
  }, [shift, mode])

  const handleOpen = async () => {
    if (!openCash) return
    setLoading(true)
    try {
      const s = await api.openShift({
        user_id: user.id,
        opening_cash: parseFloat(openCash),
        note: note || undefined,
      })
      onShiftChange(s)
      toast(`Shift ${s.shift_number} opened!`, 'success')
      onClose()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    if (!closeCash) return
    setLoading(true)
    try {
      const s = await api.closeShift(shift.id, {
        closing_cash: parseFloat(closeCash),
        note: note || undefined,
      })
      onShiftChange(null)
      toast('Shift closed successfully', 'success')
      onClose()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 500 }}>
              {shift ? 'Shift Management' : 'Open Shift'}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
              {user.name} · {user.role}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Open shift form */}
        {!shift && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label className="form-label">
              Opening Cash Amount ($)
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={openCash}
                onChange={(e) => setOpenCash(e.target.value)}
                autoFocus
              />
            </label>
            <label className="form-label">
              Note (optional)
              <input className="input" type="text" placeholder="Morning shift…" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <button className="btn btn-primary" style={{ height: 48, marginTop: 8 }} onClick={handleOpen} disabled={loading || !openCash}>
              {loading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Open Shift →'}
            </button>
          </div>
        )}

        {/* Active shift info */}
        {shift && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Shift #', shift.shift_number],
                  ['Opened At', new Date(shift.opened_at).toLocaleTimeString()],
                  ['Opening Cash', fmt(shift.opening_cash)],
                  ['Total Receipts', summary?.summary?.total_receipts ?? '—'],
                  ['Total Revenue', summary ? fmt(summary.summary.total_sales) : '—'],
                  ['Cash Sales', summary ? fmt(summary.summary.by_payment_method?.cash?.total ?? 0) : '—'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: 14, color: 'var(--cream)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="divider" />

            <label className="form-label">
              Closing Cash Count ($)
              <input
                className="input" type="number" min="0" step="0.01" placeholder="0.00"
                value={closeCash} onChange={(e) => setCloseCash(e.target.value)} autoFocus
              />
            </label>
            <label className="form-label">
              Note (optional)
              <input className="input" type="text" placeholder="" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-danger" onClick={handleClose} disabled={loading || !closeCash}>
                {loading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Close Shift'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
