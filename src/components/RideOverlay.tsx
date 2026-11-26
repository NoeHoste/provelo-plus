import { Check, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BIKE_SPEED_KMH, fmtKm, pointsFor } from '../lib/calc'
import { useApp } from '../store/AppContext'

/** Simulation accélérée d'un trajet : le compteur avance jusqu'à la distance cible. */
export function RideOverlay({ targetKm, label, safe, onClose }: { targetKm: number; label: string; safe?: boolean; onClose: () => void }) {
  const { addTrip } = useApp()
  const [km, setKm] = useState(0)
  const ref = useRef(0)
  const done = km >= targetKm

  useEffect(() => {
    const t = setInterval(() => {
      ref.current = Math.min(targetKm, ref.current + targetKm / 30)
      setKm(ref.current)
      if (ref.current >= targetKm) clearInterval(t)
    }, 400)
    return () => clearInterval(t)
  }, [targetKm])

  function finish() {
    addTrip(done ? targetKm : ref.current, label, safe)
    onClose()
  }

  const pct = Math.min(100, (km / targetKm) * 100)
  return (
    <div className="safe-top safe-bottom fixed inset-0 z-[70] flex flex-col bg-forest-900 p-6 text-white">
      <button onClick={onClose} aria-label="Annuler" className="grid h-11 w-11 place-items-center self-end rounded-2xl bg-forest-800"><X /></button>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-xs font-bold tracking-widest text-volt-400">{done ? 'TRAJET TERMINÉ' : 'EN ROUTE · SIMULATION'}</p>
        <p className="mt-3 text-sm text-white/70">{label}</p>
        <p className="mt-2 text-7xl font-bold tabular-nums">{km.toFixed(1)}</p>
        <p className="text-lg text-white/70">sur {fmtKm(targetKm)} · {BIKE_SPEED_KMH} km/h</p>
        <div className="mt-6 h-3 w-full max-w-xs overflow-hidden rounded-full bg-forest-800"><div className="h-full rounded-full bg-volt-400 transition-all" style={{ width: `${pct}%` }} /></div>
        <p className="mt-4 text-xl font-bold text-volt-400">+ {pointsFor(done ? targetKm : km)} pts</p>
      </div>
      <button className="btn btn-volt w-full text-lg" onClick={finish}>{done ? <><Check size={20} /> Encaisser mes points</> : 'Terminer maintenant'}</button>
    </div>
  )
}
