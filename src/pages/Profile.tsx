import { Pencil, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../components/ui'
import { BIKE_LABEL, CATEGORY_LABEL, computeAge } from '../lib/calc'
import { useApp } from '../store/AppContext'
import { ProfileForm } from './ProfileForm'

export function ProfilePage() {
  const { state, reset } = useApp()
  const p = state.profile
  const [editing, setEditing] = useState(!p)
  const age = p ? computeAge(p.birthDate) : null

  return (
    <div>
      <PageHeader title="Mon profil" subtitle={p ? `Membre ${p.id}` : 'Inscription'} />
      <div className="p-4">
        {editing || !p ? (
          <div className="card p-4">
            <ProfileForm onDone={() => setEditing(false)} submitLabel={p ? 'Enregistrer' : 'Créer mon profil'} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card divide-y divide-slate-100 text-sm">
              {([
                ['Nom', `${p.prenom} ${p.nom}`],
                ['Âge', age !== null ? `${age} ans (né(e) le ${new Date(p.birthDate).toLocaleDateString('fr-BE')})` : '—'],
                ['Vélo', `${BIKE_LABEL[p.bikeType]}${p.bikeModel ? ` — ${p.bikeModel}` : ''}`],
                ['Catégorie', CATEGORY_LABEL[p.category]],
                ...(p.category === 'employe' ? [['Société', p.company]] : []),
              ] as string[][]).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-right font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-navy w-full" onClick={() => setEditing(true)}><Pencil size={16} /> Modifier</button>
          </div>
        )}
        <button
          className="mt-6 flex w-full items-center justify-center gap-2 text-xs text-slate-400"
          onClick={() => confirm('Effacer toutes les données locales ?') && reset()}
        >
          <RotateCcw size={12} /> Réinitialiser les données de l’app
        </button>
      </div>
    </div>
  )
}
