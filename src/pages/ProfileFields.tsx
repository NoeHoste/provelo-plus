import { Gift } from 'lucide-react'
import { BIKE_LABEL, INCOME_LABEL, computeAge } from '../lib/calc'
import type { BikeType, Category, Income, Profile } from '../types'

export type Draft = Omit<Profile, 'id'>
export const blankDraft: Draft = { nom: '', prenom: '', birthDate: '', bikeType: 'ville', bikeModel: '', category: 'etudiant', company: '', income: 'chomage' }

const CATS: { id: Category; label: string; sub: string }[] = [
  { id: 'etudiant', label: 'Étudiant', sub: 'Resto & fournitures' },
  { id: 'employe', label: 'Employé', sub: 'Offres société' },
  { id: 'sans_emploi', label: 'Sans emploi', sub: 'Bons +20 %' },
]

export function validateDraft(d: Draft): Record<string, string> {
  const err: Record<string, string> = {}
  if (!d.prenom.trim()) err.prenom = 'Prénom requis'
  if (!d.nom.trim()) err.nom = 'Nom requis'
  if (computeAge(d.birthDate) === null) err.birthDate = 'Date de naissance valide requise'
  if (d.category === 'employe' && !d.company.trim()) err.company = 'Indique ta société'
  return err
}

export const cleanDraft = (d: Draft): Draft => ({
  ...d,
  prenom: d.prenom.trim(),
  nom: d.nom.trim(),
  bikeModel: d.bikeModel.trim(),
  company: d.category === 'employe' ? d.company.trim() : '',
})

interface Props {
  d: Draft
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void
  errors: Record<string, string>
  /** Champs insérés entre le nom et la date de naissance (e-mail, mot de passe). */
  middle?: React.ReactNode
}

export function ProfileFields({ d, set, errors, middle }: Props) {
  const age = computeAge(d.birthDate)
  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="prenom">Prénom</label>
          <input id="prenom" className="input" placeholder="Ton prénom" autoComplete="given-name" value={d.prenom} onChange={(e) => set('prenom', e.target.value)} />
          <Err k="prenom" />
        </div>
        <div>
          <label className="label" htmlFor="nom">Nom</label>
          <input id="nom" className="input" placeholder="Ton nom" autoComplete="family-name" value={d.nom} onChange={(e) => set('nom', e.target.value)} />
          <Err k="nom" />
        </div>
      </div>

      {middle}

      <div>
        <label className="label" htmlFor="birth">Date de naissance</label>
        <div className="flex gap-2">
          <input id="birth" type="date" className="input" max={new Date().toISOString().slice(0, 10)} value={d.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
          {age !== null && <span className="grid shrink-0 place-items-center rounded-2xl bg-forest-900 px-4 text-sm font-bold text-volt-400">{age} ans</span>}
        </div>
        <Err k="birthDate" />
      </div>

      <fieldset>
        <legend className="label">Ta catégorie</legend>
        <div className="grid grid-cols-3 gap-2">
          {CATS.map((c) => {
            const on = d.category === c.id
            return (
              <label key={c.id} className={`cursor-pointer rounded-2xl border-2 px-3 py-2.5 ${on ? 'border-forest-900 bg-forest-900 text-white' : 'border-[#e1e5dc] bg-white'}`}>
                <input type="radio" name="cat" className="sr-only" checked={on} onChange={() => set('category', c.id)} />
                <span className="block text-sm font-bold">{c.label}</span>
                <span className={`block text-[11px] ${on ? 'text-volt-300' : 'text-[#5b6b64]'}`}>{c.sub}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {d.category === 'employe' && (
        <div className="rounded-2xl border-2 border-forest-900 p-3">
          <label className="label" htmlFor="company">Ta société</label>
          <input id="company" className="input" placeholder="Ex. : Proximus, SNCB, Ville de Mons…" value={d.company} onChange={(e) => set('company', e.target.value)} />
          <p className="mt-2 flex items-start gap-2 text-xs text-[#4a5c53]"><Gift size={14} className="mt-0.5 shrink-0" /> Récompenses personnalisées par ton employeur + indemnité vélo.</p>
          <Err k="company" />
        </div>
      )}

      {d.category === 'sans_emploi' && (
        <fieldset className="rounded-2xl border-2 border-forest-900 p-3">
          <legend className="px-1 text-xs font-semibold text-[#4a5c53]">Ton revenu principal</legend>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(INCOME_LABEL) as Income[]).map((i) => {
              const on = d.income === i
              return (
                <label key={i} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-2.5 py-2.5 text-sm font-semibold leading-tight ${on ? 'border-forest-900 bg-volt-400' : 'border-transparent bg-paper'}`}>
                  <input type="radio" name="income" className="h-4 w-4 shrink-0 accent-[#0c3b2d]" checked={on} onChange={() => set('income', i)} />
                  {INCOME_LABEL[i]}
                </label>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-[#4a5c53]">Sert uniquement à adapter tes récompenses. Reste sur cet appareil.</p>
        </fieldset>
      )}

      <div>
        <label className="label" htmlFor="bike">Ton vélo</label>
        <select id="bike" className="input" value={d.bikeType} onChange={(e) => set('bikeType', e.target.value as BikeType)}>
          {Object.entries(BIKE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input className="input mt-2" placeholder="Marque / modèle (facultatif)" aria-label="Marque et modèle" value={d.bikeModel} onChange={(e) => set('bikeModel', e.target.value)} />
      </div>
    </div>
  )
}
