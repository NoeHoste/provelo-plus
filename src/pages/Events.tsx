import { Check, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { Chips, Modal } from '../components/ui'
import { EVENTS, EVENT_TYPE_LABEL, eventDate } from '../data/events'
import { capitalize } from '../lib/calc'
import { useApp } from '../store/AppContext'
import type { EventType, ProEvent } from '../types'

type Filter = 'all' | EventType

const longDate = (e: ProEvent) => capitalize(eventDate(e).toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' }))
const tail = (e: ProEvent) => e.place.split(',')[0]

export function Events() {
  const { state, toggleEvent, addBonus } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const [sel, setSel] = useState<ProEvent | null>(null)
  const [msg, setMsg] = useState('')

  const featured = EVENTS.find((e) => e.featured)
  const list = EVENTS.filter((e) => filter === 'all' || e.type === filter).sort((a, b) => a.daysFromNow - b.daysFromNow)
  const reg = (id: string) => state.registered.includes(id)

  return (
    <div className="mx-auto max-w-md space-y-4 px-5 pt-8">
      <div>
        <h1 className="text-3xl font-bold">Agenda Pro Velo</h1>
        <p className="text-[#4a6275]">Tous les événements organisés près de chez toi</p>
      </div>

      {featured && filter === 'all' && (
        <section className="relative overflow-hidden rounded-[1.5rem] bg-forest-900 p-5 text-white">
          <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" />
          <span className="absolute -right-4 -top-4 h-28 w-28 rounded-full border border-white/10" />
          <span className="inline-block rounded-full bg-volt-400 px-3 py-1 text-[11px] font-bold text-forest-900">À LA UNE · +{featured.points} pts</span>
          <h2 className="mt-3 text-3xl font-bold leading-tight">{featured.title}</h2>
          <p className="mt-2 text-sm text-white/80">{longDate(featured)} · {featured.time} · {tail(featured)}</p>
          <button className={`btn mt-4 px-5 py-3 ${reg(featured.id) ? 'bg-white text-forest-900' : 'btn-volt'}`} onClick={() => toggleEvent(featured.id)}>
            {reg(featured.id) ? <><Check size={18} /> Inscrit·e</> : 'Je participe'}
          </button>
        </section>
      )}

      <Chips<Filter> value={filter} onChange={setFilter} items={[{ id: 'all', label: 'Tout' }, ...(Object.keys(EVENT_TYPE_LABEL) as EventType[]).map((t) => ({ id: t, label: EVENT_TYPE_LABEL[t] }))]} />

      {list.length === 0 && <p className="card p-6 text-center text-sm text-[#4a6275]">Aucun événement pour ce filtre.</p>}
      <div className="card divide-y divide-black/5">
        {list.map((e) => {
          const d = eventDate(e)
          return (
            <div key={e.id} className="flex items-center gap-3 p-3">
              <button onClick={() => { setSel(e); setMsg('') }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-paper text-center leading-none">
                  <span><span className="block text-xl font-bold">{String(d.getDate()).padStart(2, '0')}</span><span className="block text-[10px] font-semibold uppercase text-[#4a6275]">{d.toLocaleDateString('fr-BE', { month: 'short' }).replace('.', '')}</span></span>
                </span>
                <span className="min-w-0">
                  <span className="block font-bold leading-tight">{e.title}</span>
                  <span className="block text-xs text-[#4a6275]">{longDate(e).split(' ')[0]} · {e.time} · {tail(e)}</span>
                  <span className="block text-xs font-bold text-forest-700">+{e.points} pts</span>
                </span>
              </button>
              <button onClick={() => toggleEvent(e.id)} aria-label={reg(e.id) ? 'Se désinscrire' : 'S’inscrire'} className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 ${reg(e.id) ? 'border-volt-400 bg-volt-400' : 'border-[#dbe4ec]'}`}>
                {reg(e.id) ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
          )
        })}
      </div>

      {sel && (
        <Modal onClose={() => setSel(null)} title={sel.title}>
          <div className="space-y-3 text-sm">
            <p className="text-[#4a6275]">{longDate(sel)} · {sel.time}</p>
            <p className="text-[#4a6275]">{sel.place}, {sel.city}</p>
            <p className="flex items-center gap-1.5 text-[#4a6275]"><Users size={14} /> {sel.seats} places · {sel.price}</p>
            <p>{sel.description}</p>
            <button className={`btn w-full ${reg(sel.id) ? 'btn-outline' : 'btn-volt'}`} onClick={() => toggleEvent(sel.id)}>{reg(sel.id) ? 'Inscrit·e : se désinscrire' : 'M’inscrire'}</button>
            {reg(sel.id) && (
              <>
                <button className="btn btn-dark w-full" onClick={() => setMsg(addBonus(`event:${sel.id}`, sel.points) ? `+${sel.points} points ajoutés !` : 'Présence déjà validée.')}>Valider ma présence (démo) · +{sel.points} pts</button>
                {msg && <p role="status" className="text-center font-semibold text-forest-700">{msg}</p>}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
