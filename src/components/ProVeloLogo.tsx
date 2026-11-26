interface Props {
  size?: number
  withText?: boolean
  light?: boolean
}

/**
 * Logo Pro Velo : le cercle officiel (`public/logo-mark.png`, tiré de `public/logo-provelo.png`)
 * suivi du nom de l'application. Pour changer de logo, remplacez `public/logo-provelo.png`
 * puis lancez `node scripts/icons.mjs`.
 */
export function ProVeloLogo({ size = 40, withText = true, light = false }: Props) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/logo-mark.png" width={size} height={size} alt="Pro Velo" className="shrink-0" />
      {withText && (
        <span className={`font-bold leading-none tracking-tight ${light ? 'text-white' : 'text-forest-900'}`} style={{ fontSize: size * 0.5 }}>
          Pro Velo <span className="text-volt-400">Plus</span>
        </span>
      )}
    </span>
  )
}
