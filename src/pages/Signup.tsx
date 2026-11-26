import { ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../components/ui'
import { hashPassword, isEmail, randomSalt } from '../lib/auth'
import { useApp } from '../store/AppContext'
import { CompareCalc } from './Compare'
import { ProfileFields, blankDraft, cleanDraft, validateDraft, type Draft } from './ProfileFields'

export function Signup({ onBack, onLogin, onCreated }: { onBack: () => void; onLogin: () => void; onCreated: () => void }) {
  const { createAccount } = useApp()
  const [d, setD] = useState<Draft>(blankDraft)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateDraft(d)
    if (!isEmail(email)) err.email = 'Adresse e-mail invalide'
    if (pw.length < 8) err.pw = '8 caractères minimum'
    setErrors(err)
    if (Object.keys(err).length) return
    setBusy(true)
    const salt = randomSalt()
    const hash = await hashPassword(salt, pw)
    createAccount(cleanDraft(d), email, salt, hash)
    onCreated()
  }

  return (
    <Screen>
      <div className="flex items-center gap-4">
        <button onClick={onBack} aria-label="Retour" className="grid h-11 w-11 place-items-center rounded-2xl bg-white"><ChevronLeft /></button>
        <span className="flex-1 text-center text-sm text-[#4a6275]">Étape 1 sur 2</span>
        <span className="w-11" />
      </div>
      <h1 className="mt-4 text-3xl font-bold leading-tight text-forest-900">Crée ton compte cycliste</h1>

      <form onSubmit={submit} className="mt-5 space-y-5" noValidate>
        <ProfileFields
          d={d}
          set={set}
          errors={errors}
          middle={
            <>
              <div>
                <label className="label" htmlFor="email">Adresse e-mail</label>
                <input id="email" type="email" autoComplete="email" className="input" placeholder="prenom.nom@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="label" htmlFor="pw">Mot de passe</label>
                <div className="relative">
                  <input id="pw" type={show ? 'text' : 'password'} autoComplete="new-password" className="input !pr-12" placeholder="8 caractères minimum" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <button type="button" onClick={() => setShow(!show)} aria-label="Afficher le mot de passe" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5d7284]">{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                {errors.pw && <p className="mt-1 text-xs text-red-600">{errors.pw}</p>}
              </div>
            </>
          }
        />
        <button type="submit" disabled={busy} className="btn btn-dark w-full text-lg text-volt-400">Continuer</button>
        <p className="text-center text-sm text-[#4a6275]">Déjà inscrit·e ? <button type="button" className="font-bold text-forest-900 underline" onClick={onLogin}>Se connecter</button></p>
        <p className="text-center text-[11px] text-[#5d7284]">Ton compte est enregistré sur cet appareil.</p>
      </form>
    </Screen>
  )
}

export function Welcome({ onDone }: { onDone: () => void }) {
  const { state } = useApp()
  return (
    <Screen>
      <p className="text-xs font-bold tracking-widest text-forest-700">ÉTAPE 2 SUR 2 · INSCRIPTION TERMINÉE</p>
      <h1 className="mt-1 text-3xl font-bold">Bienvenue {state.profile?.prenom} !</h1>
      <p className="mb-4 mt-1 text-[#4a6275]">Voici ce que le vélo va te rapporter. Indique ton trajet habituel :</p>
      <CompareCalc />
      <button className="btn btn-volt mt-5 w-full border-2 border-forest-900 text-lg" onClick={onDone}>C’est parti, je pédale ! <ArrowRight size={20} /></button>
    </Screen>
  )
}
