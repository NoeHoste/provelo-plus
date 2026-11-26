import { useState } from 'react'

interface Props {
  size?: number
  withText?: boolean
  light?: boolean
}

/**
 * Logo Pro Velo. Pour utiliser le logo officiel, déposez-le dans
 * `public/logo-provelo.png` : il sera affiché automatiquement.
 * À défaut, le SVG stylisé `public/logo-provelo.svg` est utilisé.
 */
export function ProVeloLogo({ size = 40, withText = true, light = false }: Props) {
  const [src, setSrc] = useState('/logo-provelo.png')
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src={src} onError={() => src !== '/logo-provelo.svg' && setSrc('/logo-provelo.svg')} width={size} height={size} alt="Pro Velo" className="rounded-xl" />
      {withText && (
        <span className={`font-bold leading-none tracking-tight ${light ? 'text-white' : 'text-forest-900'}`} style={{ fontSize: size * 0.45 }}>
          Pro Velo <span className={light ? 'text-volt-400' : 'text-forest-700'}>Plus</span>
        </span>
      )}
    </span>
  )
}
