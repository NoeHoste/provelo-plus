import { Building2, Check, Lock, Sparkles, Ticket } from 'lucide-react'
import { useState } from 'react'
import { Modal, PageHeader } from '../components/ui'
import { CATEGORY_LABEL, fmtEur } from '../lib/calc'
import { CATEGORY_NAMES, REWARDS, rewardsForProfile } from '../data/rewards'
import { useApp } from '../store/AppContext'
import type { Reward } from '../types'

function RewardCard({ r, onClaim }: { r: Reward; onClaim: (r: Reward) => void }) {
  const { available } = useApp()
  const ok = available >= r.cost
  return (
    <div className="card flex items-center gap-3 p-3">
      <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-center ${r.company ? 'bg-navy-800 text-white' : 'bg-leaf-100 text-leaf-600'}`}>
        <span className="text-lg font-extrabold leading-none">{r.value}€</span>
        <span className="mt-0.5 text-[9px] uppercase">{CATEGORY_NAMES[r.category]}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-navy-900">{r.title}</div>
        <div className="truncate text-xs text-slate-500">{r.partner}</div>
        <div className="mt-0.5 text-xs font-semibold text-navy-700">{r.cost.toLocaleString('fr-BE')} pts</div>
      </div>
      <button className={`btn px-3 py-2 text-sm ${ok ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onClaim(r)}>
        {ok ? 'Réclamer' : <Lock size={14} />}
      </button>
    </div>
  )
}

export function Rewards() {
  const { state, available, claim } = useApp()
  const [view, setView] = useState<'catalogue' | 'mes'>('catalogue')
  const [sel, setSel] = useState<Reward | null>(null)
  const [done, setDone] = useState(false)
  const personal = rewardsForProfile(state.profile)

  function confirm() {
    if (sel && claim(sel)) setDone(true)
  }
  function close() {
    setSel(null)
    setDone(false)
  }

  return (
    <div>
      <PageHeader title="Récompenses" subtitle={`${available.toLocaleString('fr-BE')} points disponibles`} />
      <div className="space-y-4 p-4">
        <div className="flex rounded-xl bg-slate-200 p-1 text-sm font-semibold">
          {(['catalogue', 'mes'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`flex-1 rounded-lg py-2 ${view === v ? 'bg-white text-navy-800 shadow' : 'text-slate-500'}`}>
              {v === 'catalogue' ? 'Catalogue' : `Mes bons (${state.claimed.length})`}
            </button>
          ))}
        </div>

        {view === 'catalogue' ? (
          <>
            {personal.length > 0 && (
              <section className="space-y-2">
                <h2 className="flex items-center gap-2 text-sm font-bold text-navy-800">
                  {state.profile?.category === 'employe' ? <Building2 size={16} /> : <Sparkles size={16} />}
                  Pour vous · {state.profile && CATEGORY_LABEL[state.profile.category]}
                  {state.profile?.company && ` · ${state.profile.company}`}
                </h2>
                {personal.map((r) => <RewardCard key={r.id} r={r} onClaim={setSel} />)}
              </section>
            )}
            {!state.profile && <p className="card p-3 text-sm text-slate-600">Complétez votre profil pour voir les offres adaptées à votre situation.</p>}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-navy-800">Tous les partenaires</h2>
              {REWARDS.map((r) => <RewardCard key={r.id} r={r} onClaim={setSel} />)}
            </section>
          </>
        ) : state.claimed.length === 0 ? (
          <p className="card p-6 text-center text-sm text-slate-500">Aucun bon pour l’instant. Roulez pour en débloquer !</p>
        ) : (
          <div className="space-y-3">
            {state.claimed.map((v) => (
              <div key={v.id} className="card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-dashed border-slate-300 p-3">
                  <Ticket className="text-leaf-600" />
                  <div className="flex-1">
                    <div className="text-sm font-bold">{v.title}</div>
                    <div className="text-xs text-slate-500">{v.partner} · {fmtEur(v.value)}</div>
                  </div>
                </div>
                <div className="flex justify-between bg-slate-50 px-3 py-2 text-xs">
                  <span className="font-mono font-bold tracking-wider text-navy-800">{v.code}</span>
                  <span className="text-slate-500">{new Date(v.date).toLocaleDateString('fr-BE')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sel && (
        <Modal onClose={close} title={done ? 'Bon réclamé 🎉' : sel.title}>
          {done ? (
            <div className="space-y-3 text-center">
              <Check className="mx-auto text-leaf-600" size={40} />
              <p className="text-sm text-slate-600">Retrouvez votre code dans « Mes bons ».</p>
              <button className="btn btn-primary w-full" onClick={() => { close(); setView('mes') }}>Voir mes bons</button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">{sel.partner}</p>
              <p className="text-sm">{sel.description}</p>
              <p className="text-sm font-semibold">Coût : {sel.cost.toLocaleString('fr-BE')} pts · Vous avez {available.toLocaleString('fr-BE')} pts</p>
              <button className="btn btn-primary w-full" disabled={available < sel.cost} onClick={confirm}>
                {available >= sel.cost ? 'Confirmer' : `Il manque ${(sel.cost - available).toLocaleString('fr-BE')} pts`}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
