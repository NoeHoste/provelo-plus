import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="safe-bottom max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-navy-800">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="rounded-full bg-slate-100 p-1.5">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="safe-top bg-navy-800 px-5 pb-5 pt-4 text-white">
      <h1 className="text-xl font-bold">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
    </header>
  )
}

export function Stat({ icon, label, value, tone = 'navy' }: { icon: ReactNode; label: string; value: string; tone?: 'navy' | 'leaf' }) {
  return (
    <div className="card flex flex-col gap-1 p-3">
      <span className={tone === 'leaf' ? 'text-leaf-600' : 'text-navy-700'}>{icon}</span>
      <span className="text-lg font-extrabold text-navy-900">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}
