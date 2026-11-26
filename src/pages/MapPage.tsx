import { useJsApiLoader } from '@react-google-maps/api'
import { ChevronLeft, LocateFixed, Play, Search } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { TabId } from '../components/BottomNav'
import { RideOverlay } from '../components/RideOverlay'
import { DemoMap, GMap, type MapProps } from '../components/maps'
import { CITIES, PARKINGS, PLACES } from '../data/places'
import { fmtKm, haversineKm, pointsFor } from '../lib/calc'
import { demoRoutes, googleRoutes, type LatLng, type RoutePair } from '../lib/routes'
import type { CityId, Parking, Place } from '../types'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
export const hasKey = !!API_KEY && API_KEY.trim().length > 10

/** Charge Google Maps puis affiche les enfants. N'est monté que si une clé est configurée. */
export function GoogleGate({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({ id: 'gmaps', googleMapsApiKey: API_KEY!, language: 'fr', region: 'BE' })
  if (loadError) return <p className="m-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">Impossible de charger Google Maps (clé invalide ou restreinte ?).</p>
  if (!isLoaded) return <p className="m-5 text-sm text-[#4a5c53]">Chargement de la carte…</p>
  return <>{children}</>
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const fmtDist = (km: number) => (km < 1 ? `${Math.round(km * 10) * 100} m`.replace(/^0 m$/, '50 m') : fmtKm(km))

function nearestCity(p: LatLng): CityId {
  return (Object.keys(CITIES) as CityId[]).sort((a, b) => haversineKm(p, CITIES[a]) - haversineKm(p, CITIES[b]))[0]
}

function locate(): Promise<LatLng | null> {
  return new Promise((res) => {
    if (!navigator.geolocation) return res(null)
    navigator.geolocation.getCurrentPosition(
      (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => res(null),
      { timeout: 4000, maximumAge: 60000 },
    )
  })
}

/* ---------- Écran d'itinéraire ---------- */
function RouteView({ origin, dest, google, onBack }: { origin: Place; dest: Place; google: boolean; onBack: () => void }) {
  const [pair, setPair] = useState<RoutePair | null>(null)
  const [active, setActive] = useState<'safe' | 'fast'>('safe')
  const [note, setNote] = useState('')
  const [riding, setRiding] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = google ? await googleRoutes(origin, dest) : demoRoutes(origin, dest)
        if (!cancelled) setPair(r)
      } catch {
        if (!cancelled) {
          setNote('Itinéraire réel indisponible : tracé de démonstration affiché.')
          setPair(demoRoutes(origin, dest))
        }
      }
    })()
    return () => { cancelled = true }
  }, [origin, dest, google])

  const Map = google ? GMap : DemoMap
  const opt = pair?.[active]
  const diff = pair ? pair.safe.min - pair.fast.min : 0

  return (
    <div className="-mb-24 min-h-[100dvh] bg-paper pb-28">
      <div className="relative h-[340px]">
        <Map city={dest.city} parkings={[]} selectedId={null} onSelect={() => {}} lanes={false} routes={pair ? { pair, active } : null} origin={origin} dest={dest} pad={{ t: 90, b: 40 }} />
        <div className="safe-top absolute inset-x-4 top-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg">
          <button onClick={onBack} aria-label="Retour" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"><ChevronLeft /></button>
          <div className="min-w-0 space-y-1 text-sm">
            <p className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full border-[3px] border-forest-900" /><span className="truncate">{origin.name}</span></p>
            <p className="flex items-center gap-2 font-bold"><span className="h-3 w-3 shrink-0 rounded-full bg-volt-400 ring-2 ring-forest-900" /><span className="truncate">{dest.name}</span></p>
          </div>
        </div>
        {pair?.danger && active === 'safe' && <span className="absolute bottom-3 left-4 flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs shadow"><span className="h-3 w-3 rounded-sm bg-[#b3261e]" />Grand axe évité</span>}
      </div>

      <div className="relative -mt-4 space-y-4 rounded-t-[1.75rem] bg-paper px-5 pt-5">
        {!pair || !opt ? (
          <p className="py-10 text-center text-[#4a5c53]">Calcul des itinéraires…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {([['safe', 'Le plus sûr', pair.safe], ['fast', 'Le plus rapide', pair.fast]] as const).map(([id, l, o]) => (
                <button key={id} onClick={() => setActive(id)} aria-pressed={active === id} className={`rounded-2xl border-2 p-4 text-left ${active === id ? 'border-forest-900 bg-forest-900 text-white' : 'border-[#e1e5dc] bg-white'}`}>
                  <p className="text-sm font-bold">{l}</p>
                  <p className="text-3xl font-bold">{o.min} min</p>
                  <p className={`text-sm ${active === id ? 'text-white/70' : 'text-[#4a5c53]'}`}>{fmtKm(o.km)}</p>
                </button>
              ))}
            </div>

            <div className="card p-4">
              <div className="flex items-baseline justify-between"><h2 className="text-lg font-bold">Score sécurité</h2><span className="text-2xl font-bold">{opt.score}/100</span></div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e6e9e2]"><div className="h-full rounded-full bg-[#1f8f5f]" style={{ width: `${opt.score}%` }} /></div>
              <div className="mt-3 grid grid-cols-3 text-sm">
                <div><b className="text-lg">{opt.piste} %</b><br /><span className="text-xs text-[#4a5c53]">piste séparée</span></div>
                <div><b className="text-lg">{opt.axes}</b><br /><span className="text-xs text-[#4a5c53]">grands axes</span></div>
                <div><b className="text-lg">{opt.lit === null ? '—' : `${opt.lit} %`}</b><br /><span className="text-xs text-[#4a5c53]">zones éclairées</span></div>
              </div>
            </div>

            <p className="text-sm text-[#4a5c53]">
              {diff > 0 ? `${diff} minute${diff > 1 ? 's' : ''} de plus, mais tu restes sur les pistes cyclables et les rues calmes${pair.safe.axes === 0 ? ' : aucun croisement avec la nationale' : ''}.` : 'Le plus sûr est aussi le plus rapide !'}
              {' '}<span className="text-xs">({pair.demo ? 'Estimation de démonstration' : 'Estimation basée sur les données Google Maps'})</span>
            </p>
            {note && <p className="text-xs text-amber-700">{note}</p>}

            <button className="btn btn-dark w-full text-lg" onClick={() => setRiding(true)}>
              <Play size={18} fill="#c8f52f" className="text-volt-400" /> <span className="text-volt-400">Démarrer · + {pointsFor(opt.km)} pts</span>
            </button>
          </>
        )}
      </div>

      {riding && opt && <RideOverlay targetKm={opt.km} label={`${origin.name} → ${dest.name}`} safe={active === 'safe'} onClose={() => setRiding(false)} />}
    </div>
  )
}

/* ---------- Écran carte ---------- */
type Layer = 'parkings' | 'secure' | 'lanes'

export function MapScreen({ google: useG, onNav }: { google: boolean; onNav: (t: TabId) => void }) {
  const [city, setCity] = useState<CityId>('mons')
  const [layer, setLayer] = useState<Layer>('parkings')
  const [selId, setSelId] = useState<string | null>(() => PARKINGS.find((p) => p.city === 'mons' && p.type === 'securise')?.id ?? null)
  const [query, setQuery] = useState('')
  const [me, setMe] = useState<LatLng | null>(null)
  const [focus, setFocus] = useState<LatLng | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [route, setRoute] = useState<{ origin: Place; dest: Place } | null>(null)

  const cityParkings = useMemo(() => PARKINGS.filter((p) => p.city === city), [city])
  const shown = layer === 'lanes' ? [] : layer === 'secure' ? cityParkings.filter((p) => p.type === 'securise') : cityParkings
  const sel = PARKINGS.find((p) => p.id === selId && p.city === city) ?? null

  const matches = useMemo(() => {
    const q = norm(query.trim())
    if (q.length < 2) return []
    return PLACES.filter((p) => norm(p.name).includes(q) || norm(CITIES[p.city].name).includes(q)).slice(0, 5)
  }, [query])

  function changeCity(c: CityId) {
    setCity(c)
    setFocus(null)
    setSelId(PARKINGS.find((p) => p.city === c && p.type === 'securise')?.id ?? null)
  }

  async function startRoute(dest: Place) {
    setBusy(true)
    setMsg('')
    const pos = await locate()
    setBusy(false)
    const useMe = pos && haversineKm(pos, dest) < 30
    const origin: Place = useMe ? { id: 'me', city: dest.city, name: 'Ma position', ...pos } : { id: 'ctr', city: dest.city, name: `Centre de ${CITIES[dest.city].name}`, lat: CITIES[dest.city].lat, lng: CITIES[dest.city].lng }
    if (!useMe) setMsg('Position indisponible : départ depuis le centre-ville.')
    setQuery('')
    setRoute({ origin, dest })
  }

  async function geocode() {
    if (!useG) return
    setBusy(true)
    try {
      const r = await new google.maps.Geocoder().geocode({ address: query, region: 'BE' })
      const g = r.results[0]
      if (!g) return setMsg('Adresse introuvable.')
      const pt = { lat: g.geometry.location.lat(), lng: g.geometry.location.lng() }
      const dest: Place = { id: 'geo', city: nearestCity(pt), name: g.formatted_address.split(',')[0], ...pt }
      setBusy(false)
      await startRoute(dest)
    } catch {
      setMsg('Recherche d’adresse indisponible (activez l’API Geocoding).')
    } finally {
      setBusy(false)
    }
  }

  async function goMe() {
    const pos = await locate()
    if (!pos) return setMsg('Position refusée ou indisponible.')
    setMe(pos)
    const c = nearestCity(pos)
    if (c !== city) changeCity(c)
    setFocus(pos)
  }

  if (route) return <RouteView origin={route.origin} dest={route.dest} google={useG} onBack={() => setRoute(null)} />

  const Map = useG ? GMap : DemoMap
  const props: MapProps = { city, parkings: shown, selectedId: selId, onSelect: (p: Parking) => setSelId(p.id), lanes: layer === 'lanes', focus, pad: { t: 150, b: 230 } }
  const ref = me ?? CITIES[city]

  return (
    <div className="relative -mb-24 h-[calc(100dvh-4.6rem)] overflow-hidden">
      <div className="absolute inset-0"><Map {...props} /></div>

      <div className="safe-top absolute inset-x-0 top-0 z-10 px-4 pt-4">
        <div className="relative">
          <form onSubmit={(e) => { e.preventDefault(); if (matches[0]) startRoute(matches[0]); else if (useG && query.trim()) geocode() }} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-lg">
            <Search size={20} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Où vas-tu à vélo ?" aria-label="Destination" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#7d8b84]" />
            {useG && <span className="text-[10px] text-[#7d8b84]">Google Maps</span>}
          </form>
          {query.trim().length >= 2 && (
            <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-white shadow-lg">
              {matches.map((m) => (
                <li key={m.id}><button onClick={() => startRoute(m)} className="flex w-full justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-paper"><span className="truncate font-semibold">{m.name}</span><span className="shrink-0 text-[#7d8b84]">{CITIES[m.city].name}</span></button></li>
              ))}
              {matches.length === 0 && <li className="px-4 py-3 text-sm text-[#4a5c53]">{useG ? <button className="font-semibold underline" onClick={geocode}>Chercher « {query} » comme adresse</button> : 'Aucun lieu trouvé (mode démo : parkings et sites de Mons, Bruxelles, Tournai).'}</li>}
            </ul>
          )}
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {([['parkings', 'Parkings vélo'], ['secure', 'Sécurisés'], ['lanes', 'Pistes cyclables']] as const).map(([id, l]) => (
            <button key={id} className="chip shadow" aria-pressed={layer === id} onClick={() => setLayer(id)}>{l}</button>
          ))}
          <select aria-label="Ville" value={city} onChange={(e) => changeCity(e.target.value as CityId)} className="chip shadow">
            {(Object.keys(CITIES) as CityId[]).map((c) => <option key={c} value={c}>{CITIES[c].name}</option>)}
          </select>
        </div>
      </div>

      <button onClick={goMe} aria-label="Ma position" className="absolute bottom-[15.5rem] right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg"><LocateFixed size={20} /></button>

      <div className="absolute inset-x-4 bottom-[5.5rem] z-10 space-y-2">
        {(msg || busy) && <p role="status" className="rounded-xl bg-white/95 px-3 py-2 text-xs text-[#4a5c53] shadow">{busy ? 'Recherche de ta position…' : msg}</p>}
        {sel ? (
          <div className="rounded-[1.5rem] bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-wider text-forest-700">{sel.type === 'securise' ? 'PARKING SÉCURISÉ · ACCÈS QR' : sel.type === 'couvert' ? 'PARKING COUVERT' : 'ARCEAUX VÉLO'}</p>
                <h2 className="truncate text-2xl font-bold">{sel.name.split(' — ')[0]}</h2>
                <p className="text-sm text-[#4a5c53]">{fmtDist(haversineKm(ref, sel))} · {sel.type === 'securise' ? '24 h/24' : 'accès libre'}</p>
              </div>
              <span className="shrink-0 rounded-2xl bg-volt-400 px-3 py-1.5 text-center leading-none"><b className="block text-2xl">{sel.free}</b><span className="text-[11px]">places</span></span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button className="btn btn-outline px-2 py-3" onClick={() => startRoute({ id: sel.id, city: sel.city, name: sel.name.split(' — ')[0], lat: sel.lat, lng: sel.lng })}>Itinéraire sûr</button>
              <button className="btn btn-dark px-2 py-3 text-volt-400 disabled:opacity-40" disabled={sel.type !== 'securise'} onClick={() => onNav('qr')}>Mon QR d’accès</button>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl bg-white p-4 text-center text-sm text-[#4a5c53] shadow-xl">{layer === 'lanes' ? 'Les pistes cyclables sont tracées en pointillés verts.' : 'Touche un parking pour voir ses places libres.'}</p>
        )}
      </div>
    </div>
  )
}
