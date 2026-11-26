import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppState, ClaimedVoucher, Profile, Reward, Settings } from '../types'
import { DEFAULT_SETTINGS, pointsFor, totalKm, uid, voucherCode } from '../lib/calc'
import { hashPassword } from '../lib/auth'

const KEY = 'provelo-plus:v2'
const empty: AppState = {
  profile: null,
  account: null,
  loggedIn: false,
  settings: DEFAULT_SETTINGS,
  trips: [],
  claimed: [],
  registered: [],
  bonusLog: [],
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty
    const s: AppState = { ...empty, ...JSON.parse(raw) }
    // Sans « Rester connecté·e », la session ne survit pas à la fermeture de l'app
    if (s.account && !s.account.stay) s.loggedIn = false
    // Migration : l'ancienne catégorie « Pensionné » devient « Sans emploi · Pension ou GRAPA »
    if (s.profile) {
      const cat = s.profile.category as string
      s.profile = { ...s.profile, income: s.profile.income ?? 'chomage', category: cat === 'pensionne' ? 'sans_emploi' : s.profile.category }
      if (cat === 'pensionne') s.profile.income = 'pension'
    }
    return s
  } catch {
    return empty
  }
}

interface Ctx {
  state: AppState
  km: number
  points: number
  spent: number
  available: number
  createAccount: (p: Omit<Profile, 'id'>, email: string, salt: string, hash: string) => void
  verifyPassword: (email: string, password: string) => Promise<boolean>
  startSession: (stay: boolean) => void
  logout: () => void
  saveProfile: (p: Omit<Profile, 'id'>) => void
  setSettings: (s: Settings) => void
  addTrip: (km: number, label?: string, safe?: boolean) => void
  claim: (r: Reward) => boolean
  toggleEvent: (id: string) => void
  addBonus: (key: string, pts: number) => boolean
  reset: () => void
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const km = totalKm(state.trips)
  const bonus = state.bonusLog.reduce((s, b) => s + b.pts, 0)
  const points = pointsFor(km) + bonus
  const spent = state.claimed.reduce((s, c) => s + c.cost, 0)
  const available = Math.max(0, points - spent)

  const createAccount = useCallback((p: Omit<Profile, 'id'>, email: string, salt: string, hash: string) => {
    setState((s) => ({
      ...s,
      profile: { ...p, id: `PV-${uid()}` },
      account: { email: email.trim().toLowerCase(), salt, hash, stay: true },
      loggedIn: true,
    }))
  }, [])

  const verifyPassword = useCallback(
    async (email: string, password: string) => {
      const a = state.account
      if (!a || a.email !== email.trim().toLowerCase()) return false
      return (await hashPassword(a.salt, password)) === a.hash
    },
    [state.account],
  )

  const startSession = useCallback((stay: boolean) => {
    setState((s) => (s.account ? { ...s, loggedIn: true, account: { ...s.account, stay } } : s))
  }, [])

  const logout = useCallback(() => setState((s) => ({ ...s, loggedIn: false })), [])

  const saveProfile = useCallback((p: Omit<Profile, 'id'>) => {
    setState((s) => ({ ...s, profile: { ...p, id: s.profile?.id ?? `PV-${uid()}` } }))
  }, [])

  const setSettings = useCallback((settings: Settings) => setState((s) => ({ ...s, settings })), [])

  const addTrip = useCallback((k: number, label?: string, safe?: boolean) => {
    if (k <= 0) return
    setState((s) => ({
      ...s,
      trips: [{ id: uid(), date: new Date().toISOString(), km: Math.round(k * 100) / 100, label, safe }, ...s.trips],
    }))
  }, [])

  const claim = useCallback(
    (r: Reward) => {
      if (available < r.cost) return false
      const v: ClaimedVoucher = { id: uid(), rewardId: r.id, title: r.title, partner: r.partner, value: r.value, cost: r.cost, code: voucherCode(), date: new Date().toISOString() }
      setState((s) => ({ ...s, claimed: [v, ...s.claimed] }))
      return true
    },
    [available],
  )

  const toggleEvent = useCallback((id: string) => {
    setState((s) => ({ ...s, registered: s.registered.includes(id) ? s.registered.filter((x) => x !== id) : [...s.registered, id] }))
  }, [])

  const addBonus = useCallback(
    (key: string, pts: number) => {
      if (state.bonusLog.some((b) => b.key === key)) return false
      setState((s) => ({ ...s, bonusLog: [...s.bonusLog, { key, pts }] }))
      return true
    },
    [state.bonusLog],
  )

  const reset = useCallback(() => setState(empty), [])

  const value = useMemo(
    () => ({ state, km, points, spent, available, createAccount, verifyPassword, startSession, logout, saveProfile, setSettings, addTrip, claim, toggleEvent, addBonus, reset }),
    [state, km, points, spent, available, createAccount, verifyPassword, startSession, logout, saveProfile, setSettings, addTrip, claim, toggleEvent, addBonus, reset],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp hors AppProvider')
  return c
}
