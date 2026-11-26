import { BicyclingLayer, GoogleMap, OverlayView, OverlayViewF, PolylineF } from '@react-google-maps/api'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CITIES } from '../data/places'
import type { LatLng, RoutePair } from '../lib/routes'
import type { CityId, Parking } from '../types'

export interface MapProps {
  city: CityId
  parkings: Parking[]
  selectedId: string | null
  onSelect: (p: Parking) => void
  lanes: boolean
  routes?: { pair: RoutePair; active: 'safe' | 'fast' } | null
  origin?: LatLng | null
  dest?: LatLng | null
  focus?: LatLng | null
  pad: { t: number; b: number }
}

const pillClass = (p: Parking, sel: boolean) =>
  `flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold shadow-md border ${sel ? 'bg-volt-400 text-forest-900 border-forest-900' : p.type === 'securise' ? 'bg-forest-900 text-white border-white' : 'bg-white text-forest-900 border-forest-900/20'}`

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* ---------- Carte de démonstration (SVG) ---------- */
export function DemoMap({ city, parkings, selectedId, onSelect, lanes, routes, origin, dest, focus, pad }: MapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 360, h: 560 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth || 360, h: el.clientHeight || 560 }))
    ro.observe(el)
    setSize({ w: el.clientWidth || 360, h: el.clientHeight || 560 })
    return () => ro.disconnect()
  }, [])

  const { w, h } = size
  const pts: LatLng[] = useMemo(() => {
    const base: LatLng[] = routes ? [...routes.pair.safe.path, ...routes.pair.fast.path] : parkings.map((p) => ({ lat: p.lat, lng: p.lng }))
    if (origin) base.push(origin)
    if (dest) base.push(dest)
    if (focus) base.push(focus)
    return base.length ? base : [CITIES[city]]
  }, [routes, parkings, origin, dest, focus, city])

  const proj = useMemo(() => {
    const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length
    const k = Math.cos((lat0 * Math.PI) / 180)
    const xs = pts.map((p) => p.lng * k)
    const ys = pts.map((p) => -p.lat)
    const minx = Math.min(...xs)
    const miny = Math.min(...ys)
    const dx = Math.max(Math.max(...xs) - minx, 0.012)
    const dy = Math.max(Math.max(...ys) - miny, 0.012)
    const l = 44
    const aw = w - l * 2
    const ah = Math.max(80, h - pad.t - pad.b)
    const scale = Math.min(aw / dx, ah / dy)
    const ox = l + (aw - (Math.max(Math.max(...xs) - minx, 0) * scale)) / 2
    const oy = pad.t + (ah - (Math.max(Math.max(...ys) - miny, 0) * scale)) / 2
    return (p: LatLng) => ({ x: ox + (p.lng * k - minx) * scale, y: oy + (-p.lat - miny) * scale })
  }, [pts, w, h, pad.t, pad.b])

  const decor = useMemo(() => {
    const r = rng(city.length * 7919 + 13)
    const roads = Array.from({ length: 9 }, (_, i) =>
      i < 5
        ? { x1: 0, y1: r() * h, x2: w, y2: r() * h, w: 5 + r() * 5 }
        : { x1: r() * w, y1: 0, x2: r() * w, y2: h, w: 5 + r() * 5 },
    )
    const parks = Array.from({ length: 2 }, () => ({ x: r() * w * 0.6, y: r() * h * 0.7, w: 70 + r() * 70, h: 60 + r() * 70 }))
    return { roads, parks, riverY: h * (0.55 + r() * 0.3), arterial: { y1: h * (0.25 + r() * 0.2), y2: h * (0.25 + r() * 0.2) } }
  }, [city, w, h])

  const line = (path: LatLng[]) => path.map((p) => { const q = proj(p); return `${q.x.toFixed(1)},${q.y.toFixed(1)}` }).join(' ')
  const dangerPt = routes?.pair.danger && routes.active === 'safe' ? proj(routes.pair.danger) : null

  return (
    <div ref={ref} className="h-full w-full">
      <svg width={w} height={h} role="img" aria-label="Carte de démonstration">
        <rect width={w} height={h} fill="#e9eef2" />
        {decor.parks.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={14} fill="#d6e8cf" />)}
        <path d={`M0 ${decor.riverY} C ${w * 0.3} ${decor.riverY - 40}, ${w * 0.6} ${decor.riverY + 50}, ${w} ${decor.riverY - 10}`} fill="none" stroke="#bcd7ee" strokeWidth={28} />
        {decor.roads.map((r, i) => <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#fff" strokeWidth={r.w} strokeLinecap="round" />)}
        <line x1={0} y1={decor.arterial.y1} x2={w} y2={decor.arterial.y2} stroke="#f6d78a" strokeWidth={13} />
        {decor.roads.filter((_, i) => lanes || i % 2 === 0).map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#2f9e60" strokeWidth={lanes ? 5 : 3} strokeDasharray="1 8" strokeLinecap="round" />
        ))}

        {routes && (
          <>
            <polyline points={line(routes.active === 'safe' ? routes.pair.fast.path : routes.pair.safe.path)} fill="none" stroke="#8b8f8a" strokeWidth={4} strokeDasharray="7 7" strokeLinecap="round" />
            <polyline points={line(routes.pair[routes.active].path)} fill="none" stroke={routes.active === 'safe' ? '#1f8f5f' : '#0b3c5d'} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {dangerPt && (
          <g transform={`translate(${dangerPt.x - 15} ${dangerPt.y - 15})`}>
            <rect width={30} height={30} rx={9} fill="#b3261e" stroke="#fff" strokeWidth={2} />
            <text x={15} y={21} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff">!</text>
          </g>
        )}
        {origin && <circle cx={proj(origin).x} cy={proj(origin).y} r={9} fill="#fff" stroke="#0b3c5d" strokeWidth={4} />}
        {dest && <circle cx={proj(dest).x} cy={proj(dest).y} r={10} fill="#33bdf2" stroke="#0b3c5d" strokeWidth={3} />}

        {!routes && parkings.map((p) => {
          const q = proj(p)
          const sel = selectedId === p.id
          return (
            <g key={p.id} transform={`translate(${q.x - 28} ${q.y - 15})`} onClick={() => onSelect(p)} className="cursor-pointer" role="button" aria-label={`Parking ${p.name}`}>
              <rect width={56} height={30} rx={15} fill={sel ? '#33bdf2' : p.type === 'securise' ? '#0b3c5d' : '#fff'} stroke={sel ? '#0b3c5d' : '#fff'} strokeWidth={2} />
              <text x={28} y={20} textAnchor="middle" fontSize={14} fontWeight={700} fill={sel || p.type !== 'securise' ? '#0b3c5d' : '#fff'}>P {p.free}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ---------- Google Maps ---------- */
export function GMap({ city, parkings, selectedId, onSelect, lanes, routes, origin, dest, focus, pad }: MapProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const c = CITIES[city]

  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    if (routes) {
      const b = new google.maps.LatLngBounds()
      ;[...routes.pair.safe.path, ...routes.pair.fast.path].forEach((p) => b.extend(p))
      m.fitBounds(b, { top: pad.t, bottom: pad.b, left: 30, right: 30 })
    } else if (focus) {
      m.panTo(focus)
      m.setZoom(15)
    } else {
      m.panTo(c)
      m.setZoom(c.zoom)
    }
  }, [routes, focus, city, c, pad.t, pad.b])

  const center = (w: number, h: number) => ({ x: -w / 2, y: -h / 2 })
  const active = routes?.pair[routes.active]
  const other = routes ? routes.pair[routes.active === 'safe' ? 'fast' : 'safe'] : null

  return (
    <GoogleMap
      mapContainerClassName="h-full w-full"
      center={c}
      zoom={c.zoom}
      onLoad={(m) => { mapRef.current = m }}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, zoomControl: false, clickableIcons: false }}
    >
      {lanes && <BicyclingLayer />}
      {other && <PolylineF path={other.path} options={{ strokeColor: '#8b8f8a', strokeOpacity: 0.9, strokeWeight: 4, zIndex: 1 }} />}
      {active && <PolylineF path={active.path} options={{ strokeColor: routes!.active === 'safe' ? '#1f8f5f' : '#0b3c5d', strokeWeight: 7, zIndex: 2 }} />}
      {routes?.pair.danger && routes.active === 'safe' && (
        <OverlayViewF position={routes.pair.danger} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={() => center(30, 30)}>
          <div className="grid h-[30px] w-[30px] place-items-center rounded-[9px] border-2 border-white bg-[#b3261e] text-lg font-extrabold text-white">!</div>
        </OverlayViewF>
      )}
      {origin && <OverlayViewF position={origin} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={() => center(18, 18)}><div className="h-[18px] w-[18px] rounded-full border-4 border-forest-900 bg-white" /></OverlayViewF>}
      {dest && <OverlayViewF position={dest} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={() => center(20, 20)}><div className="h-5 w-5 rounded-full border-[3px] border-forest-900 bg-volt-400" /></OverlayViewF>}
      {!routes && parkings.map((p) => (
        <OverlayViewF key={p.id} position={p} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={() => center(56, 30)}>
          <button onClick={() => onSelect(p)} className={pillClass(p, selectedId === p.id)} aria-label={`Parking ${p.name}`}>P {p.free}</button>
        </OverlayViewF>
      ))}
    </GoogleMap>
  )
}
