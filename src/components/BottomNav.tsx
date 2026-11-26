import { Calendar, Gift, Home, Map, QrCode, Scale } from 'lucide-react'

export type TabId = 'home' | 'map' | 'qr' | 'compare' | 'rewards' | 'events' | 'profile'

const TABS = [
  { id: 'home', label: 'Accueil', Icon: Home },
  { id: 'map', label: 'Carte', Icon: Map },
  { id: 'qr', label: 'Parking', Icon: QrCode },
  { id: 'compare', label: 'Comparer', Icon: Scale },
  { id: 'rewards', label: 'Bons', Icon: Gift },
  { id: 'events', label: 'Agenda', Icon: Calendar },
] as const

export function BottomNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white">
      <ul className="mx-auto flex max-w-md justify-between px-1">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <li key={id} className="flex-1">
              <button onClick={() => onChange(id)} aria-current={active ? 'page' : undefined} className={`flex w-full flex-col items-center gap-1 py-2.5 text-[11px] ${active ? 'font-bold text-forest-900' : 'font-medium text-[#5d7284]'}`}>
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
