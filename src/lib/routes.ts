import { bikeMinutes, haversineKm } from './calc'

export type LatLng = { lat: number; lng: number }

export interface RouteOpt {
  path: LatLng[]
  km: number
  min: number
  piste: number // % de piste séparée (estimé)
  axes: number // nombre de grands axes empruntés
  lit: number | null // % de zones éclairées (non disponible via Google)
  score: number
}

export interface RoutePair {
  safe: RouteOpt
  fast: RouteOpt
  danger: LatLng | null
  demo: boolean
}

export const safetyScore = (piste: number, axes: number, lit: number | null) =>
  Math.round(piste * 0.5 + Math.max(0, 30 - axes * 12) + (lit ?? 70) * 0.2)

const seedOf = (a: LatLng, b: LatLng) => Math.round((a.lat + a.lng + b.lat + b.lng) * 100000) % 997

function bezier(a: LatLng, via: LatLng, b: LatLng, n = 24): LatLng[] {
  // Le contrôle est choisi pour que la courbe passe par `via` à mi-parcours
  const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 }
  const c = { lat: 2 * via.lat - mid.lat, lng: 2 * via.lng - mid.lng }
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    const u = 1 - t
    return { lat: u * u * a.lat + 2 * u * t * c.lat + t * t * b.lat, lng: u * u * a.lng + 2 * u * t * c.lng + t * t * b.lng }
  })
}

/** Itinéraires simulés (mode démo, sans Google Maps). */
export function demoRoutes(a: LatLng, b: LatLng): RoutePair {
  const km0 = Math.max(0.3, haversineKm(a, b))
  const dLat = b.lat - a.lat
  const dLng = b.lng - a.lng
  const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 }
  const seed = seedOf(a, b)
  const safeVia = { lat: mid.lat + dLng * 0.2, lng: mid.lng - dLat * 0.2 }
  const fastVia = { lat: mid.lat - dLng * 0.03, lng: mid.lng + dLat * 0.03 }
  const safeKm = km0 * 1.28
  const fastKm = km0 * 1.06
  const sp = 85 + (seed % 8)
  const fp = 46 + (seed % 10)
  return {
    demo: true,
    danger: fastVia,
    safe: { path: bezier(a, safeVia, b), km: safeKm, min: bikeMinutes(safeKm), piste: sp, axes: 0, lit: 100, score: safetyScore(sp, 0, 100) },
    fast: { path: bezier(a, fastVia, b), km: fastKm, min: bikeMinutes(fastKm), piste: fp, axes: 2, lit: 70, score: safetyScore(fp, 2, 70) },
  }
}

const RISKY = /\b[NE]\d{1,3}\b|route nationale|autoroute|\bring\b|chauss[ée]e|boulevard/i

/** Itinéraires réels via Google Directions (mode vélo), évalués par heuristique. */
export async function googleRoutes(a: LatLng, b: LatLng): Promise<RoutePair> {
  const svc = new google.maps.DirectionsService()
  const res = await svc.route({ origin: a, destination: b, travelMode: google.maps.TravelMode.BICYCLING, provideRouteAlternatives: true })
  const opts = res.routes.map((r) => {
    const leg = r.legs[0]
    const total = leg.distance?.value ?? 1
    let riskyDist = 0
    let axes = 0
    let firstRisky: LatLng | null = null
    for (const s of leg.steps) {
      if (RISKY.test(s.instructions)) {
        riskyDist += s.distance?.value ?? 0
        axes++
        firstRisky ??= { lat: s.start_location.lat(), lng: s.start_location.lng() }
      }
    }
    const piste = Math.max(20, Math.round(100 - (100 * riskyDist) / total))
    const opt: RouteOpt = {
      path: r.overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() })),
      km: total / 1000,
      min: Math.round((leg.duration?.value ?? 0) / 60),
      piste,
      axes,
      lit: null,
      score: safetyScore(piste, axes, null),
    }
    return { opt, riskyDist, firstRisky }
  })
  const safe = [...opts].sort((x, y) => x.opt.axes - y.opt.axes || x.riskyDist - y.riskyDist || x.opt.km - y.opt.km)[0]
  const fast = [...opts].sort((x, y) => x.opt.min - y.opt.min)[0]
  return { demo: false, safe: safe.opt, fast: fast.opt, danger: fast !== safe ? fast.firstRisky : null }
}
