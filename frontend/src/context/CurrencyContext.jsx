import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api'

const CurrencyContext = createContext(null)
export const useCurrency = () => useContext(CurrencyContext)

// KHR never uses decimal places; round to nearest riel
const DEFAULT_RATE = 4000   // 1 USD = 4000 KHR

export function CurrencyProvider({ children }) {
  const [base, setBase] = useState(
    () => localStorage.getItem('pos_currency') || 'USD',
  )
  const [rate, setRate] = useState(DEFAULT_RATE)
  const [rateDate, setRateDate] = useState(null)
  const [rateLoading, setRateLoading] = useState(true)

  // ── Load rate from backend on mount; fall back to default ──────────────
  useEffect(() => {
    setRateLoading(true)
    api.getLatestRate('USD', 'KHR')
      .then((r) => {
        setRate(Number(r.rate))
        setRateDate(r.effective_date)
      })
      .catch(() => {
        // No rate in DB yet — use default 4000
        setRate(DEFAULT_RATE)
      })
      .finally(() => setRateLoading(false))
  }, [])

  const toggleBase = useCallback(() => {
    setBase((prev) => {
      const next = prev === 'USD' ? 'KHR' : 'USD'
      localStorage.setItem('pos_currency', next)
      return next
    })
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Format a USD-stored amount in the current base currency */
  const fmt = useCallback((usdAmount) => {
    const n = Number(usdAmount ?? 0)
    if (base === 'KHR') {
      return `៛${Math.round(n * rate).toLocaleString()}`
    }
    return `$${n.toFixed(2)}`
  }, [base, rate])

  /** Always format as USD */
  const fmtUSD = useCallback((usdAmount) =>
    `$${Number(usdAmount ?? 0).toFixed(2)}`, [])

  /** Always format as KHR from a USD amount */
  const fmtKHR = useCallback((usdAmount) =>
    `៛${Math.round(Number(usdAmount ?? 0) * rate).toLocaleString()}`, [rate])

  /** Both currencies — returns { primary, secondary, usd, khr } */
  const fmtBoth = useCallback((usdAmount) => {
    const usd = fmtUSD(usdAmount)
    const khr = fmtKHR(usdAmount)
    return {
      primary:   base === 'KHR' ? khr : usd,
      secondary: base === 'KHR' ? usd : khr,
      usd,
      khr,
    }
  }, [base, fmtUSD, fmtKHR])

  /** Convert a USD amount to the display currency (number) */
  const toDisplay = useCallback((usdAmount) => {
    const n = Number(usdAmount ?? 0)
    return base === 'KHR' ? Math.round(n * rate) : n
  }, [base, rate])

  /** Convert a display-currency amount back to USD (number) */
  const toUSD = useCallback((displayAmount) => {
    const n = Number(displayAmount ?? 0)
    return base === 'KHR' ? n / rate : n
  }, [base, rate])

  /** Current symbol */
  const symbol = base === 'KHR' ? '៛' : '$'

  return (
    <CurrencyContext.Provider value={{
      base, rate, rateDate, rateLoading,
      toggleBase, symbol,
      fmt, fmtUSD, fmtKHR, fmtBoth,
      toDisplay, toUSD,
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}
