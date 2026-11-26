import { Calendar, ChevronRight, MapPin, Plus, QrCode, Star, User } from 'lucide-react'
import { useState } from 'react'
import type { TabId } from '../components/BottomNav'
import { RideOverlay } from '../components/RideOverlay'
import { Modal, TONES } from '../components/ui'
import { allRewards, personalRewards } from '../data/rewards'
import { CATEGORY_LABEL, capitalize, co2Saved, fmtEur, fmtNum, moneySaved, monthKm, pointsFor, relativeDay, weekdayKm } from '../lib/calc'
import { useApp } from '../store/AppContext'

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function Home({ onNav }: { onNav: (t: TabId) => void }) {
  const { state, available, addTrip } = useApp()
  const [adding, setAdding] = useState(false)
  const [manual, setManual] = useState('5')
  const [ride, setRide] = useState<number | null>(null)

  const trips = state.trips
  const month = monthKm(trips)
  const week = weekdayKm(trips)
  const maxWeek = Math.max(1, ...week)
  const todayIdx = (new Date().getDay() + 6) % 7
  const totalSaved = moneySaved(trips.reduce((s, t) => s + t.km, 0), state.settings)
  const savedMonth = moneySaved(month, state.settings)

  const sorted = allRewards(state.profile).sort((a, b) => a.cost - b.cost)
  const next = sorted.find((r) => r.cost > available)
  const prev = [...sorted].reverse().find((r) => r.cost <= available)?.cost ?? 0
  const pct = next ? Math.min(100, Math.max(4, ((available - prev) / (next.cost - prev)) * 100)) : 100
  const perso = personalRewards(state.profile)[0]
  const p = state.profile
  const who = !p ? '' : p.category === 'employe' ? `employé·e chez ${p.company}` : p.category === 'etudiant' ? 'étudiant·e' : CATEGORY_LABEL[p.category].toLowerCase()

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#4a5c53]">{capitalize(new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' }))}</p>
          <h1 className="text-3xl font-bold">Salut {p?.prenom} !</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-volt-400 px-3 py-2 text-sm font-bold"><Star size={15} /> {fmtNum(available)} pts</span>
          <button onClick={() => onNav('profile')} aria-label="Mon profil" className="grid h-10 w-10 place-items-center rounded-full bg-white"><User size={18} /></button>
        </div>
      </header>

      <section className="rounded-[1.75rem] bg-forest-900 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80">Ce mois-ci</p>
            <p className="mt-1 text-6xl font-bold leading-none">{fmtNum(Math.round(month))}<span className="ml-1.5 text-2xl text-volt-400">km</span></p>
          </div>
          <div className="flex h-14 items-end gap-1.5" aria-label="Kilomètres de la semaine">
            {week.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-2 rounded-full ${i === todayIdx ? 'bg-volt-400' : 'bg-white/35'}`} style={{ height: Math.max(4, (v / maxWeek) * 40) }} />
                <span className="text-[9px] text-white/60">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-volt-400 p-3 text-forest-900"><p className="text-xs">Économisé vs voiture</p><p className="text-2xl font-bold">{fmtEur(savedMonth)}</p></div>
          <div className="rounded-2xl bg-forest-800 p-3"><p className="text-xs text-white/70">CO₂ évité</p><p className="text-2xl font-bold">{fmtNum(co2Saved(month))} kg</p></div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>{next ? `Prochain bon de ${next.value} €` : 'Tous les bons débloqués !'}</span>
          {next && <span className="font-bold">{fmtNum(next.cost - available)} pts restants</span>}
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-forest-800" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-volt-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-white/50">Total économisé depuis le début : {fmtEur(totalSaved)}</p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {([['map', MapPin, 'Itinéraire sûr'], ['qr', QrCode, 'QR parking'], ['events', Calendar, 'Événements']] as const).map(([id, Icon, l]) => (
          <button key={id} onClick={() => onNav(id)} className="card flex flex-col items-start gap-3 p-4 text-left text-sm font-bold leading-tight"><Icon size={22} />{l}</button>
        ))}
      </section>

      {perso && (
        <section>
          <h2 className="mb-2 text-xl font-bold">Pour toi, {who}</h2>
          <button onClick={() => onNav('rewards')} className="card flex w-full items-center gap-3 p-3 text-left">
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold ${TONES[perso.tone]}`}>{perso.tag}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{perso.title}</span>
              <span className="block text-sm text-[#4a5c53]">{perso.description} · {perso.cost} pts</span>
            </span>
            <ChevronRight className="text-[#5b6b64]" />
          </button>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">Derniers trajets</h2>
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 rounded-full bg-forest-900 px-3 py-1.5 text-sm font-bold text-volt-400"><Plus size={15} /> Ajouter</button>
        </div>
        {trips.length === 0 ? (
          <p className="card p-5 text-center text-sm text-[#4a5c53]">Aucun trajet pour l’instant. Lance un itinéraire ou ajoute un trajet pour gagner tes premiers points !</p>
        ) : (
          <div className="card divide-y divide-black/5">
            {trips.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{t.label ?? 'Trajet libre'}</p>
                  <p className="text-sm text-[#4a5c53]">{relativeDay(t.date)} · {fmtNum(t.km, 1)} km{t.safe ? ' · itinéraire sûr' : ''}</p>
                </div>
                <span className="font-bold text-forest-700">+{pointsFor(t.km)} pts</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {adding && (
        <Modal title="Ajouter un trajet" onClose={() => setAdding(false)}>
          <div className="space-y-3">
            <label className="label" htmlFor="km">Distance (km)</label>
            <input id="km" className="input" type="number" min={0.1} step={0.1} value={manual} onChange={(e) => setManual(e.target.value)} />
            <button className="btn btn-volt w-full" disabled={!(parseFloat(manual) > 0)} onClick={() => { addTrip(parseFloat(manual), 'Trajet libre'); setAdding(false) }}>Enregistrer ce trajet</button>
            <button className="btn btn-outline w-full" disabled={!(parseFloat(manual) > 0)} onClick={() => { setAdding(false); setRide(parseFloat(manual)) }}>Simuler le trajet en direct</button>
          </div>
        </Modal>
      )}
      {ride && <RideOverlay targetKm={ride} label="Trajet libre" onClose={() => setRide(null)} />}
    </div>
  )
}
