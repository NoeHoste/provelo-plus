// Authentification LOCALE : le compte reste sur l'appareil (pas de serveur).
// Le mot de passe n'est jamais stocké en clair, mais ce n'est pas une sécurité de niveau serveur.
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')

export const randomSalt = () => hex(crypto.getRandomValues(new Uint8Array(12)))

export async function hashPassword(salt: string, password: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  return hex(await crypto.subtle.digest('SHA-256', data))
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim())
