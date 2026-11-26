import { Bike, Car } from 'lucide-react'
import { useState } from 'react'
import { ProVeloLogo } from '../components/ProVeloLogo'
import { Screen } from '../components/ui'
import { CAR_CO2_KG_PER_KM, CAR_SPEED_KMH, WORKDAYS, BIKE_SPEED_KMH, bikeMinutes, carMinutes, fmtEur, fmtNum, pointsFor } from '../lib/calc'
import { useApp } from '../store/AppContext'

export function Splash({ onSignup, onLogin }: { onSignup: () => void; onLogin: () => void }) {
  const { state } = useApp()
  const s = state.settings
  const [km, setKm] = useState(5)
  const yearKm = km * 2 * WORKDAYS

  return (
    <div className="min-h-full bg-forest-900 text-white">
      <Screen className="flex min-h-full flex-col">
        <ProVeloLogo light size={44} />
        <p className="mt-8 text-xs font-bold tracking-widest text-volt-400">AVANT DE PARTIR…</p>
        <h1 className="mt-2 text-[2rem] font-bold leading-tight">Ton trajet de {km} km, vélo ou voiture ?</h1>

        <div className="mt-5 rounded-2xl bg-forest-800/70 p-4">
          <div className="flex justify-between text-sm"><span className="text-white/80">Distance du trajet</span><span className="font-bold">{km} km</span></div>
          <input className="range mt-3" type="range" min={1} max={30} value={km} onChange={(e) => setKm(+e.target.value)} aria-label="Distance du trajet" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rise">
          <div className="rounded-2xl bg-volt-400 p-4 text-forest-900">
            <div className="flex items-center gap-2 font-bold"><Bike size={20} /> Vélo</div>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="opacity-70">Coût</dt><dd className="text-2xl font-bold">{fmtEur(km * s.bikeCost)}</dd></div>
              <div><dt className="opacity-70">CO₂</dt><dd className="text-2xl font-bold">0 g</dd></div>
              <div><dt className="opacity-70">Durée</dt><dd className="text-2xl font-bold">{bikeMinutes(km)} min</dd></div>
            </dl>
            <p className="mt-2 text-xs font-semibold">+ {pointsFor(km)} points gagnés</p>
          </div>
          <div className="rounded-2xl bg-forest-800 p-4">
            <div className="flex items-center gap-2 font-bold"><Car size={20} /> Voiture</div>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="text-white/60">Coût</dt><dd className="text-2xl font-bold">{fmtEur(km * s.carCost)}</dd></div>
              <div><dt className="text-white/60">CO₂</dt><dd className="text-2xl font-bold">{fmtNum(km * CAR_CO2_KG_PER_KM * 1000)} g</dd></div>
              <div><dt className="text-white/60">Durée + parking</dt><dd className="text-2xl font-bold">{carMinutes(km)} min</dd></div>
            </dl>
            <p className="mt-2 text-xs text-white/60">+ 0 point</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-white/85">
          Sur un an (aller-retour, {WORKDAYS} jours), le vélo t’économise{' '}
          <b className="text-volt-400">{fmtEur(yearKm * (s.carCost - s.bikeCost), 0)}</b> et évite{' '}
          <b className="text-volt-400">{fmtNum(yearKm * CAR_CO2_KG_PER_KM)} kg</b> de CO₂.
        </p>

        <div className="mt-auto space-y-2 pt-8">
          <button className="btn btn-volt w-full text-lg" onClick={onSignup}>Je crée mon compte</button>
          <button className="btn w-full text-volt-400" onClick={onLogin}>J’ai déjà un compte</button>
          <p className="pt-2 text-center text-[11px] text-white/50">
            Hypothèses : {fmtNum(s.carCost, 2)} €/km et {Math.round(CAR_CO2_KG_PER_KM * 1000)} g CO₂/km en voiture, vélo à {BIKE_SPEED_KMH} km/h, voiture à {CAR_SPEED_KMH} km/h + 8 min de parking.
          </p>
        </div>
      </Screen>
    </div>
  )
}
