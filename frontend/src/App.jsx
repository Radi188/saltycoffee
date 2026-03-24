import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { api } from './api'
import { CurrencyProvider } from './context/CurrencyContext'
import LoginScreen from './components/LoginScreen'
import OpenShiftScreen from './components/OpenShiftScreen'
import POSScreen from './components/POSScreen'
import AdminDashboard from './components/AdminDashboard'

// ── Toast context ──────────────────────────────────────────────────────────
export const ToastContext = createContext(null)
export function useToast() { return useContext(ToastContext) }

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const show = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── Shared loading splash ──────────────────────────────────────────────────
function CheckingScreen() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--bg)',
    }}>
      <img
        src="/logo.jpg"
        alt="Salty Coffee"
        style={{ width: 140, filter: 'invert(1) brightness(.85) sepia(.25)', animation: 'float 4s ease-in-out infinite' }}
      />
      <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN APP  —  /admin
// Session stored in localStorage key: "admin_user"
// ══════════════════════════════════════════════════════════════════════════
function AdminApp() {
  const toast = useToast()
  // 'checking' | 'login' | 'dashboard'
  const [screen, setScreen] = useState('checking')
  const [user,   setUser]   = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_user')
      if (!saved) { setScreen('login'); return }
      const u = JSON.parse(saved)
      if (u.role !== 'admin') { localStorage.removeItem('admin_user'); setScreen('login'); return }
      setUser(u)
      setScreen('dashboard')
    } catch {
      setScreen('login')
    }
  }, [])

  const handleLogin = (userData) => {
    if (userData.role !== 'admin') return   // LoginScreen blocks this before calling onLogin
    setUser(userData)
    localStorage.setItem('admin_user', JSON.stringify(userData))
    toast(`Welcome, ${userData.name}!`, 'success')
    setScreen('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('admin_user')
    setScreen('login')
  }

  if (screen === 'checking')  return <CheckingScreen />
  if (screen === 'login')     return <LoginScreen onLogin={handleLogin} adminOnly />
  return <AdminDashboard user={user} onLogout={handleLogout} />
}

// ══════════════════════════════════════════════════════════════════════════
// POS APP  —  /
// Session stored in localStorage keys: "pos_user", "pos_shift"
// ══════════════════════════════════════════════════════════════════════════
function PosApp() {
  const toast     = useToast()
  const navigate  = useNavigate()

  // 'checking' | 'login' | 'shift' | 'pos'
  const [screen, setScreen] = useState('checking')
  const [user,   setUser]   = useState(null)
  const [shift,  setShift]  = useState(null)

  // ── Restore session on mount ───────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        const savedUser = localStorage.getItem('pos_user')
        if (!savedUser) { setScreen('login'); return }

        const u = JSON.parse(savedUser)

        // Admin logged in here by mistake → redirect to /admin
        if (u.role === 'admin') {
          localStorage.removeItem('pos_user')
          navigate('/admin', { replace: true })
          return
        }

        setUser(u)

        try {
          const live = u.branch_id
            ? await api.getOpenShiftByBranch(u.branch_id)
            : await api.getOpenShift(u.id)
          if (live?.id) {
            setShift(live)
            localStorage.setItem('pos_shift', JSON.stringify(live))
            setScreen('pos')
            return
          }
        } catch { /* shift may be gone */ }

        localStorage.removeItem('pos_shift')
        setScreen('shift')
      } catch {
        setScreen('login')
      }
    }
    restore()
  }, [])

  // ── After login ───────────────────────────────────────────────────────
  const handleLogin = async (userData) => {
    // Admin user navigates to the admin route instead
    if (userData.role === 'admin') {
      navigate('/admin', { replace: true })
      return
    }

    setUser(userData)
    localStorage.setItem('pos_user', JSON.stringify(userData))
    setScreen('checking')

    try {
      const openShift = userData.branch_id
        ? await api.getOpenShiftByBranch(userData.branch_id)
        : await api.getOpenShift(userData.id)
      if (openShift?.id) {
        setShift(openShift)
        localStorage.setItem('pos_shift', JSON.stringify(openShift))
        toast(`Shift ${openShift.shift_number} resumed`, 'info')
        setScreen('pos')
      } else {
        setScreen('shift')
      }
    } catch {
      setScreen('shift')
    }
  }

  const handleShiftOpened = (newShift) => {
    setShift(newShift)
    localStorage.setItem('pos_shift', JSON.stringify(newShift))
    setScreen('pos')
  }

  const handleShiftChange = (s) => {
    setShift(s)
    if (s) {
      localStorage.setItem('pos_shift', JSON.stringify(s))
    } else {
      localStorage.removeItem('pos_shift')
      setScreen('shift')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setShift(null)
    localStorage.removeItem('pos_user')
    localStorage.removeItem('pos_shift')
    setScreen('login')
  }

  if (screen === 'checking') return <CheckingScreen />
  if (screen === 'login')    return <LoginScreen onLogin={handleLogin} />

  if (screen === 'shift') {
    return (
      <OpenShiftScreen
        user={user}
        onShiftOpened={handleShiftOpened}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <POSScreen
      user={user}
      shift={shift}
      onShiftChange={handleShiftChange}
      onLogout={handleLogout}
    />
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CurrencyProvider>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/*"       element={<PosApp />} />
          </Routes>
        </CurrencyProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
