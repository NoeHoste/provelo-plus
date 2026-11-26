import { Clock, Download, Maximize2, X } from 'lucide-react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PARKINGS } from '../data/places'
import { useApp } from '../store/AppContext'

const TTL = 600 // secondes de validité d'un code

function makeCode(userId: string, parkingId: string, nonce: number) {
  let h = 0
  for (const c of `${userId}|${parkingId}|${nonce}`) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return `PV-${String(h % 100000).padStart(5, '0')}`
}

export function QrPass({ onProfile }: { onProfile: () => void }) {
  const { state, addBonus } = useApp()
  const secure = PARKINGS.filter((p) => p.type === 'securise')
  const [pid, setPid] = useState(secure[0].id)
  const [nonce, setNonce] = useState(() => Date.now())
  const [left, setLeft] = useState(TTL)
  const [full, setFull] = useState(false)
  const [msg, setMsg] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)
  const parking = secure.find((p) => p.id === pid)!
  const profile = state.profile

  const issuedAt = useMemo(() => Date.now(), [nonce, pid]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setInterval(() => {
      const left = TTL - Math.floor((Date.now() - issuedAt) / 1000)
      if (left <= 0) setNonce(Date.now())
      else setLeft(left)
    }, 1000)
    setLeft(TTL)
    return () => clearInterval(t)
  }, [issuedAt])

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-3xl font-bold">Parking sécurisé</h1>
        <div className="card mt-4 space-y-3 p-5 text-center"><p className="text-sm text-[#4a5c53]">Crée ton profil pour obtenir ton QR Code personnel.</p><button className="btn btn-volt" onClick={onProfile}>Mon profil</button></div>
      </div>
    )
  }

  const code = makeCode(profile.id, parking.id, nonce)
  const payload = `PROVELOPLUS:v1:user=${profile.id}:parking=${parking.id}:code=${code}:exp=${issuedAt + TTL * 1000}`
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  function save() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `pass-${parking.id}.png`
    a.click()
  }

  return (
    <div className="safe-top -mb-24 min-h-[calc(100dvh)] bg-forest-900 pb-28 text-white">
      <div className="mx-auto max-w-md space-y-4 px-5 pt-8">
        <div>
          <p className="text-xs font-bold tracking-widest text-volt-400">ACCÈS PARKING SÉCURISÉ</p>
          <h1 className="mt-1 text-3xl font-bold">{parking.name.split(' — ')[0].replace(/^Gare de /, 'Vélo-box Gare ')}</h1>
          <p className="text-white/70">{parking.free} places libres · ouvert 24 h/24</p>
        </div>

        <select aria-label="Parking sécurisé" className="input !border-transparent !bg-forest-800 !text-white" value={pid} onChange={(e) => setPid(e.target.value)}>
          {secure.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div className="rounded-[1.75rem] bg-white p-5 text-forest-900">
          <button onClick={() => setFull(true)} aria-label="Afficher le QR en plein écran" className="mx-auto block"><QRCodeSVG value={payload} size={220} level="M" marginSize={1} fgColor="#0c3b2d" bgColor="#fff" /></button>
          <div ref={canvasRef} className="hidden"><QRCodeCanvas value={payload} size={512} level="M" marginSize={2} fgColor="#0c3b2d" bgColor="#fff" /></div>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm"><Clock size={16} /> Valide encore <b>{mm}:{ss}</b> · code <b>{code}</b></p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-outline !border-volt-400 !text-volt-400" onClick={() => setNonce(Date.now())}>Nouveau code</button>
          <button className="btn btn-volt" onClick={save}><Download size={18} /> Enregistrer</button>
        </div>
        <button className="flex w-full items-center justify-center gap-2 text-sm text-white/70" onClick={() => setFull(true)}><Maximize2 size={14} /> Plein écran pour scanner</button>

        <ol className="space-y-2 rounded-2xl bg-forest-800 p-4 text-sm">
          {['Scanne le code sur la borne à l’entrée.', 'Gare ton vélo sur une place libre.', 'Rescanne à la sortie : +20 pts bonus.'].map((t, i) => (
            <li key={t} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-volt-400 text-xs font-bold text-forest-900">{i + 1}</span>{t}</li>
          ))}
        </ol>
        <button className="w-full text-center text-xs text-white/60 underline" onClick={() => setMsg(addBonus(`exit:${code}`, 20) ? '+20 pts ajoutés (démo)' : 'Bonus déjà obtenu pour ce code.')}>Simuler le scan de sortie (démo)</button>
        {msg && <p role="status" className="text-center text-sm font-semibold text-volt-400">{msg}</p>}
      </div>

      {full && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-white p-6 text-black">
          <button className="absolute right-4 top-4 rounded-full bg-slate-100 p-2" onClick={() => setFull(false)} aria-label="Fermer"><X /></button>
          <QRCodeSVG value={payload} size={Math.min(window.innerWidth - 48, 380)} level="M" marginSize={2} fgColor="#000" bgColor="#fff" />
          <div className="text-center"><p className="text-xl font-bold">{profile.prenom} {profile.nom}</p><p className="text-sm text-slate-600">{parking.name}</p><p className="mt-1 font-mono text-sm">{code} · {mm}:{ss}</p></div>
        </div>
      )}
    </div>
  )
}
