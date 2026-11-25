import { CalendarDays, Check, MapPin, Users } from 'lucide-react'
import { useState } from 'react'
import { Modal, PageHeader } from '../components/ui'
import { EVENTS, EVENT_TYPE_LABEL, eventDate } from '../data/events'
import { useApp } from '../store/AppContext'
import type { EventType, ProEvent } from '../types'

const fmtDate = (e: ProEvent) => eventDate(e).toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })

export function Events() {
  const { state, toggleEvent } = useApp()
  const [type, setType] = useState<EventType | 'all'>('all')
  const [when, setWhen] = useState<'all' | 'week' | 'month'>('all')
  const [sel, setSel] = useState<ProEvent | null>(null)

  const list = EVENTS.filter((e) => (type === 'all' || e.type === type) && (when === 'all' || e.daysFromNow <= (when === 'week' ? 7 : 31))).sort((a, b) => a.daysFromNow - b.daysFromNow)
  const chip = (active: boolean) => `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${active ? 'bg-navy-800 text-white' : 'bg-white text-slate-600'}`

  return (
    <div>
      <PageHeader title="Événements Pro Velo" subtitle={`${state.registered.length} inscription(s)`} />
      <div className="space-y-3 p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button className={chip(type === 'all')} onClick={() => setType('all')}>Tous</button>
          {(Object.keys(EVENT_TYPE_LABEL) as EventType[]).map((t) => (
            <button key={t} className={chip(type === t)} onClick={() => setType(t)}>{EVENT_TYPE_LABEL[t]}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {([['all', 'Toutes dates'], ['week', '7 jours'], ['month', 'Ce mois']] as const).map(([k, l]) => (
            <button key={k} className={chip(when === k)} onClick={() => setWhen(k)}>{l}</button>
          ))}
        </div>

        {list.length === 0 && <p className="card p-6 text-center text-sm text-slate-500">Aucun événement pour ces filtres.</p>}
        {list.map((e) => {
          const reg = state.registered.includes(e.id)
          return (
            <button key={e.id} onClick={() => setSel(e)} className="card block w-full p-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-[11px] font-bold text-leaf-600">{EVENT_TYPE_LABEL[e.type]}</span>
                {reg && <span className="flex items-center gap-1 text-xs font-bold text-leaf-600"><Check size={14} /> Inscrit</span>}
              </div>
              <h3 className="mt-1.5 font-bold text-navy-900">{e.title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs capitalize text-slate-500"><CalendarDays size={13} /> {fmtDate(e)} · {e.time}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} /> {e.city}</p>
            </button>
          )
        })}
      </div>

      {sel && (
        <Modal onClose={() => setSel(null)} title={sel.title}>
          <div className="space-y-3 text-sm">
            <p className="capitalize text-slate-600"><CalendarDays className="mr-1.5 inline" size={14} />{fmtDate(sel)} · {sel.time}</p>
            <p className="text-slate-600"><MapPin className="mr-1.5 inline" size={14} />{sel.place}, {sel.city}</p>
            <p className="text-slate-600"><Users className="mr-1.5 inline" size={14} />{sel.seats} places · {sel.price}</p>
            <p>{sel.description}</p>
            <button className={`btn w-full ${state.registered.includes(sel.id) ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleEvent(sel.id)}>
              {state.registered.includes(sel.id) ? 'Inscrit — se désinscrire' : 'S’inscrire'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
