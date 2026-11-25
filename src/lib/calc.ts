import type { Category, Profile, Trip } from '../types'

export const CAR_COST_PER_KM = 0.4 // carburant + entretien + usure
export const BIKE_COST_PER_KM = 0.05
export const CAR_CO2_KG_PER_KM = 0.12
export const POINTS_PER_KM = 10

export const totalKm = (trips: Trip[]) => trips.reduce((s, t) => s + t.km, 0)
export const moneySaved = (km: number) => km * (CAR_COST_PER_KM - BIKE_COST_PER_KM)
export const co2Saved = (km: number) => km * CAR_CO2_KG_PER_KM
export const pointsFor = (km: number) => Math.floor(km * POINTS_PER_KM)

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
  pensionne: 'Pensionné',
  sans_emploi: 'Sans emploi',
}

export const BIKE_LABEL = {
  ville: 'Vélo de ville',
  electrique: 'Vélo électrique',
  route: 'Vélo de route',
  cargo: 'Vélo cargo',
  vtt: 'VTT',
} as const

export const fmtEur = (n: number) =>
  new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(n)
export const fmtKm = (n: number) =>
  `${new Intl.NumberFormat('fr-BE', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(n)} km`

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
