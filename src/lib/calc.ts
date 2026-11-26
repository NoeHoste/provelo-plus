import type { Category, Income, Profile, Settings, Trip } from '../types'

export const CAR_CO2_KG_PER_KM = 0.12
export const POINTS_PER_KM = 10
export const BIKE_SPEED_KMH = 15
export const CAR_SPEED_KMH = 25
export const PARKING_MIN = 8
export const WORKDAYS = 220
export const WORK_WEEKS = 47
export const DEFAULT_SETTINGS: Settings = { carCost: 0.35, bikeCost: 0.03 }

export const totalKm = (trips: Trip[]) => trips.reduce((s, t) => s + t.km, 0)
export const moneySaved = (km: number, s: Settings) => km * (s.carCost - s.bikeCost)
export const co2Saved = (km: number) => km * CAR_CO2_KG_PER_KM
export const pointsFor = (km: number) => Math.floor(km * POINTS_PER_KM + 1e-9)
export const bikeMinutes = (km: number) => Math.max(1, Math.round((km / BIKE_SPEED_KMH) * 60))
export const carMinutes = (km: number) => Math.round((km / CAR_SPEED_KMH) * 60 + PARKING_MIN)

export function computeAge(birthDate: string, now = new Date()): number | null {
  if (!birthDate) return null
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return null
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age >= 0 ? age : null
}

export const CATEGORY_LABEL: Record<Category, string> = {
  etudiant: 'Étudiant',
  employe: 'Employé',
  sans_emploi: 'Sans emploi',
}

export const INCOME_LABEL: Record<Income, string> = {
  chomage: 'Allocations de chômage',
  incapacite: 'Indemnités d’incapacité',
  pension: 'Pension ou GRAPA',
  ris: 'RIS ou aide du CPAS',
}

export const BIKE_LABEL = {
  ville: 'Vélo de ville',
  electrique: 'Vélo électrique',
  route: 'Vélo de route',
  cargo: 'Vélo cargo',
  vtt: 'VTT',
} as const

const nf = (d: number) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: d, maximumFractionDigits: d })
export const fmtEur = (n: number, digits = 2) => `${nf(digits).format(n)} €`
export const fmtNum = (n: number, digits = 0) => nf(digits).format(n)
export const fmtKm = (n: number, digits = 1) => `${nf(digits).format(n)} km`

export const profileComplete = (p: Profile | null) =>
  !!p && !!p.nom && !!p.prenom && !!p.birthDate && !!p.category && (p.category !== 'employe' || !!p.company)

export const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase()
export const voucherCode = () => `PV+-${uid().slice(0, 4)}-${uid().slice(0, 4)}`

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Kilomètres de la semaine en cours, lundi → dimanche. */
export function weekdayKm(trips: Trip[], now = new Date()): number[] {
  const today = startOfDay(now)
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const out = [0, 0, 0, 0, 0, 0, 0]
  for (const t of trips) {
    const d = startOfDay(new Date(t.date))
    const idx = Math.round((d.getTime() - monday.getTime()) / 86400000)
    if (idx >= 0 && idx < 7) out[idx] += t.km
  }
  return out
}

export function monthKm(trips: Trip[], now = new Date()) {
  return trips
    .filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((s, t) => s + t.km, 0)
}

export function relativeDay(iso: string, now = new Date()) {
  const diff = Math.round((startOfDay(now).getTime() - startOfDay(new Date(iso)).getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  return new Date(iso).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
