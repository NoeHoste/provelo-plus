import { Check, Gift, Ticket } from 'lucide-react'
import { useState } from 'react'
import { Chips, Modal, TONES } from '../components/ui'
import { baseRewards, personalLabel, personalRewards } from '../data/rewards'
import { fmtEur, fmtNum } from '../lib/calc'
import { useApp } from '../store/AppContext'
import type { Reward } from '../types'

type Filter = 'all' | 'supermarche' | 'magasin' | 'perso' | 'mes'

export function Rewards() {
  const { state, available, claim } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const [sel, setSel] = useState<Reward | null>(null)
  const [done, setDone] = useState(false)

  const perso = personalRewards(state.profile)
  const list = [...perso, ...baseRewards(state.profile)].filter((r) => filter === 'all' || r.group === filter)
  const close = () => { setSel(null); setDone(false) }

  return (
    <div className="mx-auto max-w-md space-y-4 px-5 pt-8">
      <h1 className="text-3xl font-bold">Mes récompenses</h1>

      <section className="flex items-center justify-between rounded-[1.5rem] bg-volt-400 p-5">
        <div>
          <p className="text-sm">Solde disponible</p>
          <p className="text-5xl font-bold">{fmtNum(available)} pts</p>
          <p className="mt-1 text-sm">1 km = 10 pts · ≈ {fmtNum(available / 100)} € en bons</p>
        </div>
        <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-forest-900"><Gift size={28} /></span>
      </section>

      {state.profile?.category === 'sans_emploi' && (
        <p className="rounded-2xl bg-forest-900 px-4 py-3 text-sm text-white">Tes bons valent <b className="text-volt-400">+20 %</b> : ils coûtent moins de points.</p>
      )}

      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        items={[
          { id: 'all', label: 'Tout' },
          { id: 'supermarche', label: 'Supermarchés' },
          { id: 'magasin', label: 'Magasins' },
          ...(perso.length ? [{ id: 'perso' as const, label: personalLabel(state.profile) }] : []),
          { id: 'mes', label: `Mes bons (${state.claimed.length})` },
        ]}
      />

      {filter === 'mes' ? (
        state.claimed.length === 0 ? (
          <p className="card p-6 text-center text-sm text-[#4a6275]">Aucun bon pour l’instant. Échange tes points contre ta première récompense !</p>
        ) : (
          <div className="space-y-3">
            {state.claimed.map((v) => (
              <div key={v.id} className="card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-dashed border-black/15 p-4">
                  <Ticket className="text-forest-700" />
                  <div className="flex-1"><p className="font-bold">{v.title}</p><p className="text-sm text-[#4a6275]">{v.partner} · {fmtEur(v.value)}</p></div>
                </div>
                <div className="flex justify-between bg-paper px-4 py-2.5 text-sm"><span className="font-mono font-bold tracking-wider">{v.code}</span><span className="text-[#4a6275]">{new Date(v.date).toLocaleDateString('fr-BE')}</span></div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const ok = available >= r.cost
            return (
              <div key={r.id} className="card flex items-center gap-3 p-3">
                <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-xl font-bold ${TONES[r.tone]}`}>{r.tag}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{r.title}</p>
                  <p className="mt-0.5 text-sm leading-tight text-[#4a6275]">{r.description}</p>
                  <p className="mt-1 text-sm font-bold">{fmtNum(r.cost)} pts</p>
                </div>
                <button className={`btn px-4 py-3 text-sm ${ok ? 'btn-dark text-white' : 'bg-[#e3eaf0] text-[#5d7284]'}`} onClick={() => setSel(r)}>Échanger</button>
              </div>
            )
          })}
        </div>
      )}

      {sel && (
        <Modal onClose={close} title={done ? 'Bon réclamé !' : sel.title}>
          {done ? (
            <div className="space-y-3 text-center">
              <Check className="mx-auto text-forest-700" size={44} />
              <p className="text-sm text-[#4a6275]">Retrouve ton code dans « Mes bons ».</p>
              <button className="btn btn-volt w-full" onClick={() => { close(); setFilter('mes') }}>Voir mes bons</button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#4a6275]">{sel.partner}</p>
              <p>{sel.description}</p>
              <p className="text-sm font-bold">Coût : {fmtNum(sel.cost)} pts · Tu as {fmtNum(available)} pts</p>
              <button className="btn btn-volt w-full" disabled={available < sel.cost} onClick={() => claim(sel) && setDone(true)}>
                {available >= sel.cost ? 'Confirmer l’échange' : `Il te manque ${fmtNum(sel.cost - available)} pts`}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
