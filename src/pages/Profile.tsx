import { ChevronLeft, LogOut, Pencil, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { BIKE_LABEL, CATEGORY_LABEL, INCOME_LABEL, computeAge } from '../lib/calc'
import { useApp } from '../store/AppContext'
import { ProfileFields, cleanDraft, validateDraft, type Draft } from './ProfileFields'

export function ProfilePage({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const { state, saveProfile, logout, reset } = useApp()
  const p = state.profile!
  const [editing, setEditing] = useState(false)
  const [d, setD] = useState<Draft>(() => { const { id: _id, ...rest } = p; return rest })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const age = computeAge(p.birthDate)

  function save(e: React.FormEvent) {
    e.preventDefault()
    const err = validateDraft(d)
    setErrors(err)
    if (Object.keys(err).length) return
    saveProfile(cleanDraft(d))
    setEditing(false)
  }

  return (
    <div className="mx-auto max-w-md space-y-4 px-5 pt-8">
      <div className="flex items-center gap-3">
        <button onClick={onBack} aria-label="Retour" className="grid h-11 w-11 place-items-center rounded-2xl bg-white"><ChevronLeft /></button>
        <h1 className="text-3xl font-bold">Mon profil</h1>
      </div>

      <div className="flex items-center gap-4 rounded-[1.5rem] bg-forest-900 p-5 text-white">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-volt-400 text-2xl font-bold text-forest-900">{p.prenom[0]}{p.nom[0]}</span>
        <div><p className="text-xl font-bold">{p.prenom} {p.nom}</p><p className="text-sm text-white/70">{state.account?.email}</p><p className="font-mono text-xs text-volt-400">{p.id}</p></div>
      </div>

      {editing ? (
        <form onSubmit={save} className="space-y-4">
          <ProfileFields d={d} set={set} errors={errors} />
          <button type="submit" className="btn btn-dark w-full text-volt-400">Enregistrer</button>
        </form>
      ) : (
        <>
          <div className="card divide-y divide-black/5 text-sm">
            {([
              ['Âge', age !== null ? `${age} ans` : '—'],
              ['Vélo', `${BIKE_LABEL[p.bikeType]}${p.bikeModel ? ` · ${p.bikeModel}` : ''}`],
              ['Catégorie', CATEGORY_LABEL[p.category]],
              ...(p.category === 'employe' ? [['Société', p.company]] : []),
              ...(p.category === 'sans_emploi' ? [['Revenu principal', INCOME_LABEL[p.income]]] : []),
            ] as string[][]).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3.5"><span className="text-[#4a5c53]">{k}</span><span className="text-right font-bold">{v}</span></div>
            ))}
          </div>
          <button className="btn btn-dark w-full" onClick={() => setEditing(true)}><Pencil size={16} /> Modifier mon profil</button>
          <button className="btn btn-outline w-full" onClick={() => { logout(); onLogout() }}><LogOut size={16} /> Me déconnecter</button>
        </>
      )}

      <button className="flex w-full items-center justify-center gap-2 pt-4 text-xs text-[#5b6b64]" onClick={() => confirm('Effacer le compte et toutes les données de cet appareil ?') && (reset(), onLogout())}>
        <RotateCcw size={12} /> Supprimer mon compte et mes données
      </button>
    </div>
  )
}
