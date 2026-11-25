import { Banknote, Clock, Heart, Leaf } from 'lucide-react'
import { ProVeloLogo } from '../components/ProVeloLogo'
import { BIKE_COST_PER_KM, CAR_CO2_KG_PER_KM, CAR_COST_PER_KM, fmtEur } from '../lib/calc'

export function Onboarding({ onSignup, onSkip }: { onSignup: () => void; onSkip: () => void }) {
  const rows = [
    { icon: <Banknote size={20} />, label: 'Coût au km', car: `${fmtEur(CAR_COST_PER_KM)}`, bike: `${fmtEur(BIKE_COST_PER_KM)}`, note: 'Carburant, entretien, usure, parking' },
    { icon: <Leaf size={20} />, label: 'CO₂ par km', car: `${Math.round(CAR_CO2_KG_PER_KM * 1000)} g`, bike: '0 g', note: '≈ 12 kg de CO₂ évités pour 100 km' },
    { icon: <Clock size={20} />, label: 'Trajet de 5 km en ville', car: '≈ 25 min', bike: '≈ 20 min', note: 'Embouteillages et recherche de parking inclus' },
    { icon: <Heart size={20} />, label: 'Santé', car: 'Sédentaire', bike: '+ 150 kcal / 30 min', note: 'Cœur, mental et sommeil améliorés' },
  ]
  return (
    <div className="safe-top safe-bottom flex min-h-full flex-col bg-navy-800 text-white">
      <div className="mx-auto w-full max-w-md flex-1 px-5 pb-6 pt-8">
        <ProVeloLogo light size={48} />
        <h1 className="mt-6 text-3xl font-extrabold leading-tight">
          Chaque kilomètre à vélo <span className="text-leaf-500">vous rapporte.</span>
        </h1>
        <p className="mt-2 text-white/75">Vélo contre voiture : voyez ce que vous gagnez, puis transformez vos kilomètres en bons d’achat.</p>

        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="rounded-2xl bg-white/10 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-leaf-500">
                {r.icon} {r.label}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/10 py-2">
                  <div className="text-[11px] uppercase tracking-wide text-white/60">🚗 Voiture</div>
                  <div className="font-bold">{r.car}</div>
                </div>
                <div className="rounded-xl bg-leaf-500/25 py-2 ring-1 ring-leaf-500/50">
                  <div className="text-[11px] uppercase tracking-wide text-white/80">🚲 Vélo</div>
                  <div className="font-bold">{r.bike}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-white/60">{r.note}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-md space-y-2 px-5 pb-6">
        <button className="btn btn-primary w-full text-lg" onClick={onSignup}>Créer mon profil</button>
        <button className="btn w-full text-white/80" onClick={onSkip}>Accéder au tableau de bord</button>
      </div>
    </div>
  )
}
