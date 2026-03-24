import { useState } from 'react'
import { AlertTriangle, LayoutDashboard } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'

export default function LoginScreen({ onLogin, adminOnly = false }) {
  const toast = useToast()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return
    setLoading(true)
    setError('')
    try {
      const user = await api.login(form)

      if (adminOnly && user.role !== 'admin') {
        setError('Admin access only. Please use a staff account with admin privileges.')
        return
      }

      toast(`Welcome, ${user.name}!`, 'success')
      onLogin(user)
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <img src="/logo.jpg" alt="Salty Coffee Cafe" />
          <div className="login-logo-sub">
            {adminOnly ? 'Back Office' : 'Point of Sale'}
          </div>
        </div>

        {/* Admin badge */}
        {adminOnly && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'rgba(184,116,42,.1)', border: '1px solid rgba(184,116,42,.25)',
            borderRadius: 8, padding: '7px 14px', marginBottom: 16, fontSize: 12,
            color: 'var(--accent-soft)', letterSpacing: '.04em',
          }}>
            <LayoutDashboard size={13} />
            Admin Dashboard Access
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} />{error}
            </div>
          )}

          <label className="form-label">
            Username
            <input
              className="input"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoFocus
              autoComplete="username"
            />
          </label>

          <label className="form-label">
            Password
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </label>

          <button className="login-btn" type="submit" disabled={loading || !form.username || !form.password}>
            {loading
              ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Signing In…</>
              : 'Sign In →'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, marginTop: 28, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Salty Coffee Cafe · POS v1.0
        </p>
        {!adminOnly && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 10, marginTop: 8, letterSpacing: '.04em' }}>
            Admin →{' '}
            <a href="/admin" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Back Office</a>
            {' '}·{' '}Cashier → POS
          </p>
        )}
      </div>
    </div>
  )
}
