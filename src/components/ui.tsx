import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/60" onClick={onClose}>
      <div className="safe-bottom rise max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-paper p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold leading-tight">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="rounded-full bg-white p-2"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Chips<T extends string>({ items, value, onChange }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {items.map((i) => (
        <button key={i.id} className="chip" aria-pressed={value === i.id} onClick={() => onChange(i.id)}>{i.label}</button>
      ))}
    </div>
  )
}

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`safe-top mx-auto w-full max-w-md px-5 pb-6 pt-8 ${className}`}>{children}</div>
}

export const TONES = {
  orange: 'bg-[#fde3d1] text-[#b4531a]',
  green: 'bg-[#d9eee0] text-[#1f6b45]',
  yellow: 'bg-[#fbefc2] text-[#8a6a00]',
  blue: 'bg-[#e0e3fb] text-[#3a45a8]',
  volt: 'bg-volt-400 text-forest-900',
  navy: 'bg-forest-900 text-white',
} as const
