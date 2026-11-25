import { CalendarDays, Gift, Home, Map, QrCode, User } from 'lucide-react'

export type TabId = 'home' | 'rewards' | 'map' | 'qr' | 'events' | 'profile'

const TABS = [
  { id: 'home', label: 'Accueil', Icon: Home },
  { id: 'rewards', label: 'Bons', Icon: Gift },
  { id: 'map', label: 'Carte', Icon: Map },
  { id: 'qr', label: 'Pass QR', Icon: QrCode },
  { id: 'events', label: 'Événements', Icon: CalendarDays },
  { id: 'profile', label: 'Profil', Icon: User },
] as const

export function BottomNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md justify-between px-1">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${active ? 'text-leaf-600' : 'text-slate-500'}`}
              >
                <span className={`rounded-full px-3 py-1 ${active ? 'bg-leaf-100' : ''}`}>
                  <Icon size={20} />
                </span>
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
