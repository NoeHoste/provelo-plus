import { Gift } from 'lucide-react'
import { useState } from 'react'
import { WORK_WEEKS, fmtEur, fmtNum } from '../lib/calc'
import { useApp } from '../store/AppContext'

type Period = 'mois' | 'an' | '5ans'

function equivalent(eur: number) {
  if (eur < 30) return 'un bon repas au resto'
  if (eur < 80) return 'un plein d’essence !'
  if (eur < 200) return 'une paire de baskets !'
  if (eur < 500) return 'un week-end à la mer !'
  if (eur < 1500) return 'un nouveau smartphone !'
  return 'un voyage en Europe !'
}

export function CompareCalc({ editable = false }: { editable?: boolean }) {
  const { state, setSettings } = useApp()
  const s = state.settings
  const [km, setKm] = useState(8)
  const [days, setDays] = useState(5)
  const [period, setPeriod] = useState<Period>('an')

  const perYear = km * 2 * days * WORK_WEEKS
  const kmTotal = period === 'mois' ? perYear / 12 : period === 'an' ? perYear : perYear * 5
  const car = kmTotal * s.carCost
  const bike = kmTotal * s.bikeCost
  const saved = car - bike
  const periodLabel = { mois: 'par mois', an: 'sur un an', '5ans': 'sur 5 ans' }[period]

  return (
    <div className="space-y-4">
      <section className="card space-y-3 p-4">
        <div className="flex items-baseline justify-between text-sm font-medium text-[#4a6275]">
          <span>Trajet aller</span>
          <span className="text-base font-bold text-forest-900">{km} km</span>
        </div>
        <input className="range" type="range" min={1} max={40} value={km} onChange={(e) => setKm(+e.target.value)} aria-label="Distance du trajet aller" />
        <div className="flex items-center gap-2">
          <span className="mr-1 text-sm text-[#4a6275]">Jours / sem.</span>
          {[1, 2, 3, 4, 5].map((d) => (
            <button key={d} className="chip flex-1 px-0 text-center" aria-pressed={days === d} onClick={() => setDays(d)}>{d}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([['mois', 'Par mois'], ['an', 'Par an'], ['5ans', 'Sur 5 ans']] as const).map(([id, l]) => (
            <button key={id} className="chip px-0" aria-pressed={period === id} onClick={() => setPeriod(id)}>{l}</button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] bg-forest-900 p-5 text-white">
        <p className="text-sm text-white/80">En vélo plutôt qu’en voiture, {periodLabel}, tu économises</p>
        <p className="mt-1 text-6xl font-bold tracking-tight text-volt-400">{fmtEur(saved, 0)}</p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3 font-semibold">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-volt-400 text-forest-900"><Gift size={20} /></span>
          Soit {equivalent(saved)}
        </div>
        <div className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-center gap-3"><span className="w-14 text-white/80">Voiture</span><span className="h-2.5 flex-1 rounded-full bg-white" /><span className="w-16 text-right font-bold">{fmtEur(car, 0)}</span></div>
          <div className="flex items-center gap-3">
            <span className="w-14 text-white/80">Vélo</span>
            <span className="flex-1"><span className="block h-2.5 rounded-full bg-volt-400" style={{ width: `${Math.max(4, (bike / (car || 1)) * 100)}%` }} /></span>
            <span className="w-16 text-right font-bold">{fmtEur(bike, 0)}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Avec cet argent, tu pourrais t’offrir…</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            [Math.floor(saved / 12), 'places de cinéma'],
            [Math.floor(saved / 75), 'pleins d’essence évités'],
            [Math.floor(saved / 25), 'restos entre amis'],
          ].map(([n, l]) => (
            <div key={l as string} className="card p-3">
              <div className="text-3xl font-bold">{fmtNum(n as number)}</div>
              <div className="mt-0.5 text-xs leading-tight text-[#4a6275]">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] leading-snug text-[#5d7284]">
        Hypothèses : voiture {fmtNum(s.carCost, 2)} €/km, vélo {fmtNum(s.bikeCost, 2)} €/km (entretien), {WORK_WEEKS} semaines par an, aller-retour.
      </p>

      {editable && (
        <details className="card p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Modifier les hypothèses</summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="car">Voiture (€/km)</label>
              <input id="car" className="input" type="number" min={0} step={0.01} value={s.carCost} onChange={(e) => setSettings({ ...s, carCost: Math.max(0, +e.target.value) })} />
            </div>
            <div>
              <label className="label" htmlFor="bike">Vélo (€/km)</label>
              <input id="bike" className="input" type="number" min={0} step={0.01} value={s.bikeCost} onChange={(e) => setSettings({ ...s, bikeCost: Math.max(0, +e.target.value) })} />
            </div>
          </div>
        </details>
      )}
    </div>
  )
}

export function Compare() {
  return (
    <div className="mx-auto max-w-md px-5 pt-8">
      <h1 className="text-3xl font-bold">Comparateur</h1>
      <p className="mb-4 text-[#4a6275]">Combien tu gagnes en laissant la voiture au garage</p>
      <CompareCalc editable />
    </div>
  )
}
