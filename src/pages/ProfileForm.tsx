import { useState } from 'react'
import { BIKE_LABEL, CATEGORY_LABEL, computeAge } from '../lib/calc'
import { useApp } from '../store/AppContext'
import type { BikeType, Category, Profile } from '../types'

type Draft = Omit<Profile, 'id'>

const blank: Draft = { nom: '', prenom: '', birthDate: '', bikeType: 'ville', bikeModel: '', category: 'employe', company: '' }

export function ProfileForm({ onDone, submitLabel }: { onDone: () => void; submitLabel: string }) {
  const { state, saveProfile } = useApp()
  const [d, setD] = useState<Draft>(() => {
    const { id: _id, ...rest } = state.profile ?? { id: '', ...blank }
    return rest
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))
  const age = computeAge(d.birthDate)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!d.nom.trim()) err.nom = 'Nom requis'
    if (!d.prenom.trim()) err.prenom = 'Prénom requis'
    if (!d.birthDate || age === null) err.birthDate = 'Date de naissance valide requise'
    if (d.category === 'employe' && !d.company.trim()) err.company = 'Indiquez votre société'
    setErrors(err)
    if (Object.keys(err).length) return
    saveProfile({ ...d, nom: d.nom.trim(), prenom: d.prenom.trim(), bikeModel: d.bikeModel.trim(), company: d.category === 'employe' ? d.company.trim() : '' })
    onDone()
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null)

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="prenom">Prénom</label>
          <input id="prenom" className="input" value={d.prenom} onChange={(e) => set('prenom', e.target.value)} autoComplete="given-name" />
          <Err k="prenom" />
        </div>
        <div>
          <label className="label" htmlFor="nom">Nom</label>
          <input id="nom" className="input" value={d.nom} onChange={(e) => set('nom', e.target.value)} autoComplete="family-name" />
          <Err k="nom" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="birth">Date de naissance {age !== null && <span className="ml-1 rounded-full bg-leaf-100 px-2 py-0.5 text-leaf-600">{age} ans</span>}</label>
        <input id="birth" type="date" className="input" max={new Date().toISOString().slice(0, 10)} value={d.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
        <Err k="birthDate" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="bike">Type de vélo</label>
          <select id="bike" className="input" value={d.bikeType} onChange={(e) => set('bikeType', e.target.value as BikeType)}>
            {Object.entries(BIKE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="model">Marque / modèle</label>
          <input id="model" className="input" placeholder="ex. Cannondale Treadwell" value={d.bikeModel} onChange={(e) => set('bikeModel', e.target.value)} />
        </div>
      </div>

      <fieldset>
        <legend className="label">Catégorie</legend>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <label key={c} className={`cursor-pointer rounded-xl border-2 px-3 py-2.5 text-center text-sm font-semibold ${d.category === c ? 'border-leaf-500 bg-leaf-100 text-navy-800' : 'border-slate-200 bg-white text-slate-600'}`}>
              <input type="radio" name="cat" className="sr-only" checked={d.category === c} onChange={() => set('category', c)} />
              {CATEGORY_LABEL[c]}
            </label>
          ))}
        </div>
      </fieldset>

      {d.category === 'employe' && (
        <div>
          <label className="label" htmlFor="company">Société</label>
          <input id="company" className="input" placeholder="ex. Proximus, SNCB, Ville de Mons…" value={d.company} onChange={(e) => set('company', e.target.value)} />
          <p className="mt-1 text-xs text-slate-500">Débloque des récompenses personnalisées de votre employeur.</p>
          <Err k="company" />
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full">{submitLabel}</button>
    </form>
  )
}
