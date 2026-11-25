import { GoogleMap, MarkerF, PolylineF, BicyclingLayer, useJsApiLoader } from '@react-google-maps/api'
import { Info, LocateFixed, Route, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '../components/ui'
import { CITIES, PARKINGS, PARKING_TYPE_LABEL, PLACES } from '../data/places'
import { co2Saved, fmtEur, haversineKm, moneySaved } from '../lib/calc'
import type { CityId, Parking, Place } from '../types'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const hasKey = !!API_KEY && API_KEY.trim().length > 10

type LatLng = { lat: number; lng: number }
interface RouteInfo {
  path: LatLng[]
  km: number
  min: number
  score: number
}

const TYPE_COLOR = { securise: '#0b3b5c', couvert: '#2f9e42', arceau: '#e0a100' } as const

/* ---------- Itinéraire de démonstration ---------- */
function demoRoute(a: Place, b: Place): RouteInfo {
  const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 }
  const dLat = b.lat - a.lat
  const dLng = b.lng - a.lng
  // décalage perpendiculaire : le tracé « contourne » l'axe routier principal
  const via = { lat: mid.lat + dLng * 0.18, lng: mid.lng - dLat * 0.18 }
  const path = [a, via, b]
  const km = (haversineKm(a, via) + haversineKm(via, b)) * 1.15
  const seed = [...(a.id + b.id)].reduce((s, c) => s + c.charCodeAt(0), 0)
  return { path, km, min: Math.max(1, Math.round((km / 16) * 60)), score: 84 + (seed % 12) }
}

/* ---------- Carte de démo (SVG interactif) ---------- */
function DemoMap({ city, parkings, selected, onSelect, route }: { city: CityId; parkings: Parking[]; selected: string | null; onSelect: (p: Parking) => void; route: RouteInfo | null }) {
  const c = CITIES[city]
  const W = 360
  const H = 400
  const spanLat = city === 'bruxelles' ? 0.03 : 0.016
  const spanLng = spanLat * 1.7
  const proj = (p: LatLng) => ({ x: ((p.lng - (c.lng - spanLng / 2)) / spanLng) * W, y: ((c.lat + spanLat / 2 - p.lat) / spanLat) * H })
  const streets = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ i, o: ((city.length * 37 + i * 53) % 100) / 100 })), [city])
  const line = route ? route.path.map((p) => { const q = proj(p); return `${q.x},${q.y}` }).join(' ') : ''

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-[#e8f1e4]" role="img" aria-label="Carte de démonstration">
      <path d={`M0 ${H * 0.72} C ${W * 0.3} ${H * 0.6}, ${W * 0.6} ${H * 0.9}, ${W} ${H * 0.7} L ${W} ${H * 0.77} C ${W * 0.6} ${H * 0.97}, ${W * 0.3} ${H * 0.67}, 0 ${H * 0.78} Z`} fill="#bcd9ee" />
      {streets.map(({ i, o }) => (
        <g key={i} stroke="#fff" strokeWidth={i % 3 === 0 ? 7 : 4} strokeLinecap="round">
          <line x1={0} y1={o * H} x2={W} y2={(1 - o) * H * 0.9 + 20} />
          <line x1={o * W} y1={0} x2={(1 - o) * W * 0.8 + 30} y2={H} />
        </g>
      ))}
      {/* pistes cyclables */}
      <g stroke="#3fb950" strokeWidth={2.5} strokeDasharray="1 5" strokeLinecap="round" opacity={0.7}>
        {streets.filter((s) => s.i % 2 === 0).map(({ i, o }) => (
          <line key={i} x1={o * W} y1={0} x2={(1 - o) * W * 0.8 + 30} y2={H} />
        ))}
      </g>
      {route && <polyline points={line} fill="none" stroke="#2f9e42" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
      {route && route.path.filter((_, i, a) => i !== 1 || a.length < 3).map((p, i) => {
        const q = proj(p)
        return <circle key={i} cx={q.x} cy={q.y} r={6} fill={i === 0 ? '#2f9e42' : '#e11d48'} stroke="#fff" strokeWidth={2} />
      })}
      {parkings.map((p) => {
        const q = proj(p)
        const sel = selected === p.id
        return (
          <g key={p.id} onClick={() => onSelect(p)} className="cursor-pointer">
            <circle cx={q.x} cy={q.y} r={sel ? 15 : 12} fill={TYPE_COLOR[p.type]} stroke="#fff" strokeWidth={3} />
            <text x={q.x} y={q.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">P</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- Google Maps ---------- */
function GoogleMapView({ city, parkings, selected, onSelect, route, center }: { city: CityId; parkings: Parking[]; selected: string | null; onSelect: (p: Parking) => void; route: RouteInfo | null; center: LatLng | null }) {
  const { isLoaded, loadError } = useJsApiLoader({ id: 'gmaps', googleMapsApiKey: API_KEY!, language: 'fr', region: 'BE' })
  if (loadError) return <p className="card p-4 text-sm text-red-600">Impossible de charger Google Maps (clé invalide ou restreinte ?).</p>
  if (!isLoaded) return <p className="card p-4 text-sm text-slate-500">Chargement de la carte…</p>
  const c = center ?? CITIES[city]
  return (
    <GoogleMap mapContainerClassName="h-[360px] w-full rounded-2xl" center={c} zoom={CITIES[city].zoom} options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}>
      <BicyclingLayer />
      {parkings.map((p) => (
        <MarkerF
          key={p.id}
          position={p}
          onClick={() => onSelect(p)}
          label={{ text: 'P', color: '#fff', fontWeight: '800' }}
          icon={{ path: google.maps.SymbolPath.CIRCLE, scale: selected === p.id ? 14 : 11, fillColor: TYPE_COLOR[p.type], fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }}
        />
      ))}
      {route && <PolylineF path={route.path} options={{ strokeColor: '#2f9e42', strokeWeight: 6, strokeOpacity: 0.9 }} />}
    </GoogleMap>
  )
}

async function googleRoute(a: Place, b: Place): Promise<RouteInfo> {
  const svc = new google.maps.DirectionsService()
  const res = await svc.route({ origin: a, destination: b, travelMode: google.maps.TravelMode.BICYCLING, provideRouteAlternatives: true })
  const risky = /\b[NE]\d{1,3}\b|route nationale|autoroute|\bring\b|chaussée/i
  const scored = res.routes.map((r) => {
    const leg = r.legs[0]
    const hits = leg.steps.filter((s) => risky.test(s.instructions)).length
    return { r, leg, hits }
  })
  scored.sort((x, y) => x.hits - y.hits || x.leg.distance!.value - y.leg.distance!.value)
  const best = scored[0]
  return {
    path: best.r.overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() })),
    km: best.leg.distance!.value / 1000,
    min: Math.round(best.leg.duration!.value / 60),
    score: Math.max(60, 96 - best.hits * 7),
  }
}

/* ---------- Page ---------- */
export function MapPage() {
  const [city, setCity] = useState<CityId>('mons')
  const [sel, setSel] = useState<Parking | null>(null)
  const places = PLACES.filter((p) => p.city === city)
  const [fromId, setFromId] = useState(places[0].id)
  const [toId, setToId] = useState(places[1].id)
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [center, setCenter] = useState<LatLng | null>(null)
  const parkings = PARKINGS.filter((p) => p.city === city)

  function changeCity(c: CityId) {
    setCity(c)
    setSel(null)
    setRoute(null)
    setErr('')
    setCenter(null)
    const ps = PLACES.filter((p) => p.city === c)
    setFromId(ps[0].id)
    setToId(ps[1].id)
  }

  async function trace() {
    const a = places.find((p) => p.id === fromId)!
    const b = places.find((p) => p.id === toId)!
    setErr('')
    if (a.id === b.id) return setErr('Choisissez deux lieux différents.')
    setBusy(true)
    try {
      setRoute(hasKey ? await googleRoute(a, b) : demoRoute(a, b))
    } catch {
      setErr('Itinéraire indisponible, affichage du tracé de démonstration.')
      setRoute(demoRoute(a, b))
    } finally {
      setBusy(false)
    }
  }

  function locate() {
    if (!navigator.geolocation) return setErr('Géolocalisation non disponible.')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const nearest = (Object.keys(CITIES) as CityId[]).sort((x, y) => haversineKm(me, CITIES[x]) - haversineKm(me, CITIES[y]))[0]
        if (nearest !== city) changeCity(nearest)
        setCenter(me)
      },
      () => setErr('Position refusée ou indisponible.'),
    )
  }

  return (
    <div>
      <PageHeader title="Carte vélo" subtitle="Parkings et itinéraires sécurisés" />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 rounded-xl bg-slate-200 p-1 text-sm font-semibold">
            {(Object.keys(CITIES) as CityId[]).map((c) => (
              <button key={c} onClick={() => changeCity(c)} className={`flex-1 rounded-lg py-1.5 ${city === c ? 'bg-white text-navy-800 shadow' : 'text-slate-500'}`}>{CITIES[c].name}</button>
            ))}
          </div>
          <button className="btn btn-ghost px-3" onClick={locate} aria-label="Me géolocaliser"><LocateFixed size={18} /></button>
        </div>

        {!hasKey && (
          <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            <Info size={16} className="shrink-0" /> Mode démo : renseignez VITE_GOOGLE_MAPS_API_KEY dans .env pour activer Google Maps (pistes cyclables réelles).
          </p>
        )}

        {hasKey ? (
          <GoogleMapView city={city} parkings={parkings} selected={sel?.id ?? null} onSelect={setSel} route={route} center={center} />
        ) : (
          <DemoMap city={city} parkings={parkings} selected={sel?.id ?? null} onSelect={setSel} route={route} />
        )}

        <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
          {(Object.keys(TYPE_COLOR) as (keyof typeof TYPE_COLOR)[]).map((t) => (
            <span key={t} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLOR[t] }} />{PARKING_TYPE_LABEL[t]}</span>
          ))}
        </div>

        {sel && (
          <div className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-navy-900">{sel.name}</h3>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: TYPE_COLOR[sel.type] }}>{PARKING_TYPE_LABEL[sel.type]}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600"><strong className="text-leaf-600">{sel.free}</strong> places libres sur {sel.places}</p>
          </div>
        )}

        <section className="card space-y-3 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-navy-800"><Route size={16} /> Itinéraire sécurisé</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label" htmlFor="from">Départ (A)</label>
              <select id="from" className="input" value={fromId} onChange={(e) => setFromId(e.target.value)}>
                {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="to">Arrivée (B)</label>
              <select id="to" className="input" value={toId} onChange={(e) => setToId(e.target.value)}>
                {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full" onClick={trace} disabled={busy}>{busy ? 'Calcul…' : 'Tracer l’itinéraire'}</button>
          {err && <p className="text-xs text-red-600">{err}</p>}
          {route && (
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="rounded-xl bg-slate-100 p-2"><div className="font-extrabold">{route.km.toFixed(1)} km</div><div className="text-xs text-slate-500">Distance</div></div>
              <div className="rounded-xl bg-slate-100 p-2"><div className="font-extrabold">{route.min} min</div><div className="text-xs text-slate-500">Temps estimé</div></div>
              <div className="rounded-xl bg-leaf-100 p-2"><div className="flex items-center justify-center gap-1 font-extrabold text-leaf-600"><ShieldCheck size={15} />{route.score}/100</div><div className="text-xs text-slate-500">Score de sécurité</div></div>
              <div className="rounded-xl bg-leaf-100 p-2"><div className="font-extrabold text-leaf-600">{fmtEur(moneySaved(route.km))}</div><div className="text-xs text-slate-500">Économie · {co2Saved(route.km).toFixed(1)} kg CO₂</div></div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
