import { Maximize2, ShieldCheck, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { PageHeader } from '../components/ui'
import { PARKINGS, CITIES } from '../data/places'
import { useApp } from '../store/AppContext'

export function QrPass({ onProfile }: { onProfile: () => void }) {
  const { state } = useApp()
  const secure = PARKINGS.filter((p) => p.type === 'securise')
  const [pid, setPid] = useState(secure[0].id)
  const [full, setFull] = useState(false)
  const parking = secure.find((p) => p.id === pid)!
  const profile = state.profile

  if (!profile) {
    return (
      <div>
        <PageHeader title="Pass QR" subtitle="Accès aux parkings vélos sécurisés" />
        <div className="p-4">
          <div className="card space-y-3 p-5 text-center">
            <p className="text-sm text-slate-600">Créez votre profil pour obtenir votre QR Code personnel.</p>
            <button className="btn btn-primary" onClick={onProfile}>Créer mon profil</button>
          </div>
        </div>
      </div>
    )
  }

  // Valeur unique et stable : identifiant de l'utilisateur + parking choisi
  const payload = `PROVELOPLUS:v1:user=${profile.id}:parking=${parking.id}`

  return (
    <div>
      <PageHeader title="Pass QR" subtitle="Accès aux parkings vélos sécurisés" />
      <div className="space-y-4 p-4">
        <div>
          <label className="label" htmlFor="pk">Parking sécurisé</label>
          <select id="pk" className="input" value={pid} onChange={(e) => setPid(e.target.value)}>
            {secure.map((p) => <option key={p.id} value={p.id}>{CITIES[p.city].name} — {p.name.split(' — ')[0]}</option>)}
          </select>
        </div>

        <div className="card flex flex-col items-center gap-3 p-6">
          <QRCodeSVG value={payload} size={220} level="M" marginSize={2} />
          <p className="font-bold text-navy-900">{profile.prenom} {profile.nom}</p>
          <p className="font-mono text-xs text-slate-500">{profile.id}</p>
          <p className="flex items-center gap-1.5 text-xs text-leaf-600"><ShieldCheck size={14} /> {parking.free} places libres sur {parking.places}</p>
          <button className="btn btn-navy w-full" onClick={() => setFull(true)}><Maximize2 size={16} /> Afficher en plein écran</button>
        </div>
      </div>

      {full && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-white p-6">
          <button className="absolute right-4 top-4 rounded-full bg-slate-100 p-2" onClick={() => setFull(false)} aria-label="Fermer"><X /></button>
          <QRCodeSVG value={payload} size={Math.min(window.innerWidth - 48, 380)} level="M" marginSize={2} fgColor="#000" bgColor="#fff" />
          <div className="text-center">
            <p className="text-xl font-extrabold text-black">{profile.prenom} {profile.nom}</p>
            <p className="text-sm text-slate-600">{parking.name}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">{profile.id}</p>
          </div>
        </div>
      )}
    </div>
  )
}
