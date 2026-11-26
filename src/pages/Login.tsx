import { ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { ProVeloLogo } from '../components/ProVeloLogo'
import { Modal, Screen } from '../components/ui'
import { useApp } from '../store/AppContext'

export function Login({ onBack, onSignup }: { onBack: () => void; onSignup: () => void }) {
  const { state, verifyPassword, startSession, reset } = useApp()
  const [email, setEmail] = useState(state.account?.email ?? '')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [stay, setStay] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!state.account) return setErr('Aucun compte sur cet appareil. Crée-en un pour commencer.')
    setBusy(true)
    const ok = await verifyPassword(email, pw)
    setBusy(false)
    if (!ok) return setErr('E-mail ou mot de passe incorrect.')
    startSession(stay)
  }

  return (
    <div className="min-h-full bg-forest-900 text-white">
      <Screen className="flex min-h-full flex-col">
        <button onClick={onBack} aria-label="Retour" className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-800"><ChevronLeft /></button>
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <ProVeloLogo light size={64} withText={false} />
          <div className="text-xl font-bold">Pro Velo <span className="text-volt-400">Plus</span></div>
        </div>
        <h1 className="mt-8 text-3xl font-bold">Content de te revoir !</h1>
        <p className="mt-1 text-white/70">Connecte-toi pour retrouver tes kilomètres et tes bons.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="email">Adresse e-mail</label>
            <input id="email" type="email" autoComplete="email" className="input !border-transparent !bg-forest-800 !text-white placeholder:!text-white/40" placeholder="prenom.nom@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="pw">Mot de passe</label>
            <div className="relative">
              <input id="pw" type={show ? 'text' : 'password'} autoComplete="current-password" className="input !border-transparent !bg-forest-800 !pr-12 !text-white placeholder:!text-white/40" placeholder="Ton mot de passe" value={pw} onChange={(e) => setPw(e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} aria-label="Afficher le mot de passe" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={stay} onChange={(e) => setStay(e.target.checked)} className="h-4 w-4 accent-[#33bdf2]" /> Rester connecté·e</label>
            <button type="button" className="font-semibold text-volt-400 underline" onClick={() => setForgot(true)}>Mot de passe oublié ?</button>
          </div>
          {err && <p role="alert" className="rounded-xl bg-red-500/20 p-3 text-sm text-red-100">{err}</p>}
          <button type="submit" disabled={busy || !email || !pw} className="btn btn-volt w-full text-lg">{busy ? 'Connexion…' : 'Se connecter'}</button>
        </form>

        <p className="mt-auto pt-8 text-center text-sm text-white/80">Pas encore de compte ? <button className="font-bold text-volt-400 underline" onClick={onSignup}>Inscris-toi</button></p>
      </Screen>

      {forgot && (
        <Modal onClose={() => setForgot(false)} title="Mot de passe oublié">
          <div className="space-y-3 text-sm text-forest-900">
            <p>Ton compte est enregistré uniquement sur cet appareil (il n’y a pas encore de serveur), donc le mot de passe ne peut pas être envoyé par e-mail.</p>
            <p>Tu peux repartir de zéro : cela efface le compte, les kilomètres et les bons stockés ici.</p>
            <button className="btn btn-dark w-full" onClick={() => { reset(); setForgot(false); onSignup() }}>Effacer et recréer un compte</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
