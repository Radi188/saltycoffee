import { useState } from 'react'
import { Hand, Store } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'

export default function OpenShiftScreen({ user, onShiftOpened, onLogout }) {
  const toast = useToast()
  const [openingCash, setOpeningCash] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOpen = async (e) => {
    e.preventDefault()
    if (!openingCash) return
    setLoading(true)
    try {
      const shift = await api.openShift({
        user_id: user.id,
        opening_cash: parseFloat(openingCash),
        note: note.trim() || undefined,
      })
      toast(`Shift ${shift.shift_number} opened. Good luck!`, 'success')
      onShiftOpened(shift)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-card" style={{ maxWidth: 420 }}>

        {/* Logo */}
        <div className="login-logo" style={{ marginBottom: 24 }}>
          <img src="/logo.jpg" alt="Salty Coffee Cafe" style={{ width: 160 }} />
        </div>

        {/* Welcome banner */}
        <div style={{
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent-ring)',
          borderRadius: 'var(--r-lg)',
          padding: '14px 18px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <Hand size={28} style={{ color: 'var(--accent-soft)', flexShrink: 0 }} />
          <div>
            <div style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-d)', fontSize: 16, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Welcome, {user.name}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
              Please open your shift to start taking orders
            </div>
            {user.branches?.name && (
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--accent-dim)', borderRadius: 99, padding: '2px 10px' }}>
                <Store size={10} />
                <span style={{ fontSize: 11, color: 'var(--accent-soft)', letterSpacing: '.05em' }}>{user.branches.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-m)', flexShrink: 0,
          }}>2</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--cream)' }}>Open Your Shift</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Enter the cash amount in the drawer</div>
          </div>
        </div>

        <form onSubmit={handleOpen} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <label className="form-label">
            Opening Cash Amount ($)
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              autoFocus
              style={{ fontSize: 22, height: 52, fontFamily: 'var(--font-m)', letterSpacing: '.02em' }}
            />
          </label>

          <label className="form-label">
            Note <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--muted)' }}>(optional)</span>
            <input
              className="input"
              type="text"
              placeholder="e.g. Morning shift"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <button
            className="login-btn"
            type="submit"
            disabled={loading || !openingCash}
            style={{ marginTop: 4 }}
          >
            {loading
              ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Opening Shift…</>
              : 'Open Shift & Start →'
            }
          </button>
        </form>

        <button
          onClick={onLogout}
          style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 12, marginTop: 20, cursor: 'pointer', width: '100%',
            textAlign: 'center', letterSpacing: '.04em',
          }}
        >
          ← Sign out
        </button>
      </div>
    </div>
  )
}
