import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppState, ClaimedVoucher, Profile, Reward } from '../types'
import { pointsFor, totalKm, uid, voucherCode } from '../lib/calc'

const KEY = 'provelo-plus:v1'
const empty: AppState = { profile: null, trips: [], claimed: [], registered: [], introSeen: false }

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
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
  saveProfile: (p: Omit<Profile, 'id'>) => void
  addTrip: (km: number) => void
  claim: (r: Reward) => boolean
  toggleEvent: (id: string) => void
  markIntroSeen: () => void
  reset: () => void
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const km = totalKm(state.trips)
  const points = pointsFor(km)
  const spent = state.claimed.reduce((s, c) => s + c.cost, 0)
  const available = Math.max(0, points - spent)

  const saveProfile = useCallback((p: Omit<Profile, 'id'>) => {
    setState((s) => ({ ...s, profile: { ...p, id: s.profile?.id ?? `PV-${uid()}` } }))
  }, [])

  const addTrip = useCallback((k: number) => {
    if (k <= 0) return
    setState((s) => ({ ...s, trips: [{ id: uid(), date: new Date().toISOString(), km: Math.round(k * 100) / 100 }, ...s.trips] }))
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

  const markIntroSeen = useCallback(() => setState((s) => ({ ...s, introSeen: true })), [])
  const reset = useCallback(() => setState(empty), [])

  const value = useMemo(
    () => ({ state, km, points, spent, available, saveProfile, addTrip, claim, toggleEvent, markIntroSeen, reset }),
    [state, km, points, spent, available, saveProfile, addTrip, claim, toggleEvent, markIntroSeen, reset],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp hors AppProvider')
  return c
}
