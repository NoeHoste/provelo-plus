import { Bike, Leaf, PiggyBank, Play, Plus, Square, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PageHeader, Stat } from '../components/ui'
import { CAR_COST_PER_KM, BIKE_COST_PER_KM, co2Saved, fmtEur, fmtKm, moneySaved } from '../lib/calc'
import { REWARDS, rewardsForProfile } from '../data/rewards'
import { useApp } from '../store/AppContext'

export function Dashboard({ onNav }: { onNav: (t: 'rewards' | 'profile') => void }) {
  const { state, km, points, available, addTrip } = useApp()
  const [running, setRunning] = useState(false)
  const [live, setLive] = useState(0)
  const [manual, setManual] = useState('5')
  const liveRef = useRef(0)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      liveRef.current += 0.1 // simulation accélérée ×20 (≈ 18 km/h)
      setLive(liveRef.current)
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  function stop() {
    setRunning(false)
    addTrip(liveRef.current)
    liveRef.current = 0
    setLive(0)
  }

  const all = [...rewardsForProfile(state.profile), ...REWARDS].sort((a, b) => a.cost - b.cost)
  const next = all.find((r) => r.cost > available) ?? null
  const prevCost = [...all].reverse().find((r) => r.cost <= available)?.cost ?? 0
  const pct = next ? Math.min(100, ((available - prevCost) / (next.cost - prevCost)) * 100) : 100
  const shownKm = km + live

  return (
    <div>
      <PageHeader title={`Salut ${state.profile?.prenom || 'cycliste'} 👋`} subtitle="Votre tableau de bord Pro Velo Plus" />
      <div className="-mt-3 space-y-4 px-4 pb-4">
        {!state.profile && (
          <button onClick={() => onNav('profile')} className="card w-full border-2 border-leaf-500 p-3 text-left text-sm font-semibold text-navy-800">
            Créez votre profil pour débloquer vos récompenses personnalisées →
          </button>
        )}

        <section className="card bg-gradient-to-br from-navy-800 to-navy-700 p-5 text-white">
          <div className="flex items-center gap-2 text-sm text-white/70"><Bike size={16} /> Kilomètres parcourus</div>
          <div className="mt-1 text-4xl font-extrabold">{fmtKm(shownKm)}</div>
          <div className="mt-1 text-sm text-leaf-500">{available.toLocaleString('fr-BE')} points disponibles · {points.toLocaleString('fr-BE')} gagnés au total</div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Stat tone="leaf" icon={<PiggyBank size={22} />} label={`Économisé vs voiture (${CAR_COST_PER_KM.toFixed(2)} − ${BIKE_COST_PER_KM.toFixed(2)} €/km)`} value={fmtEur(moneySaved(shownKm))} />
          <Stat tone="leaf" icon={<Leaf size={22} />} label="CO₂ évité" value={`${co2Saved(shownKm).toFixed(1)} kg`} />
        </section>

        <section className="card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-navy-800"><Trophy size={16} /> Prochain palier</div>
          {next ? (
            <>
              <p className="text-sm text-slate-600">{next.title} — {next.partner}</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-leaf-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Encore {fmtKm((next.cost - available) / 10)} ({(next.cost - available).toLocaleString('fr-BE')} pts)
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">Tous les bons sont débloqués, bravo !</p>
          )}
          <button className="btn btn-ghost mt-3 w-full" onClick={() => onNav('rewards')}>Voir le catalogue</button>
        </section>

        <section className="card p-4">
          <h2 className="mb-3 text-sm font-bold text-navy-800">Ajouter un trajet</h2>
          {running ? (
            <button className="btn w-full bg-red-600 text-white" onClick={stop}><Square size={16} /> Terminer le trajet ({live.toFixed(1)} km)</button>
          ) : (
            <button className="btn btn-navy w-full" onClick={() => setRunning(true)}><Play size={16} /> Démarrer un trajet (simulation)</button>
          )}
          <div className="mt-3 flex gap-2">
            <input className="input" type="number" min="0.1" step="0.1" value={manual} onChange={(e) => setManual(e.target.value)} aria-label="Kilomètres" />
            <button className="btn btn-primary shrink-0" disabled={!(parseFloat(manual) > 0)} onClick={() => addTrip(parseFloat(manual))}>
              <Plus size={16} /> km
            </button>
          </div>
        </section>

        {state.trips.length > 0 && (
          <section className="card divide-y divide-slate-100">
            <h2 className="p-4 pb-2 text-sm font-bold text-navy-800">Derniers trajets</h2>
            {state.trips.slice(0, 5).map((t) => (
              <div key={t.id} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-500">{new Date(t.date).toLocaleString('fr-BE', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span className="font-semibold">{fmtKm(t.km)}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
