// Génère les icônes PWA et la « marque » (cercle seul, fond transparent) à partir du logo officiel
// déposé dans public/logo-provelo.png.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = 'public/logo-provelo.png'
mkdirSync('public/icons', { recursive: true })

// --- Marque : cercle seul, blanc -> transparent, couleur de marque conservée ---
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const BRAND = [51, 189, 242]
const rgba = Buffer.from(data)
for (let i = 0; i < W * H; i++) {
  const r = data[i * 4]
  const a = Math.max(0, Math.min(255, Math.round(((255 - r) / (255 - BRAND[0])) * 255)))
  rgba[i * 4] = BRAND[0]
  rgba[i * 4 + 1] = BRAND[1]
  rgba[i * 4 + 2] = BRAND[2]
  rgba[i * 4 + 3] = a
}
// Le texte « Pro Velo » occupe le bas de l'image : on repère la première ligne vide après le cercle
const rowHasInk = (y) => { for (let x = 0; x < W; x++) if (rgba[(y * W + x) * 4 + 3] > 40) return true; return false }
let top = 0
while (top < H && !rowHasInk(top)) top++
let bottom = top
while (bottom < H && rowHasInk(bottom)) bottom++
let minX = W, maxX = 0
for (let y = top; y < bottom; y++) for (let x = 0; x < W; x++) if (rgba[(y * W + x) * 4 + 3] > 40) { minX = Math.min(minX, x); maxX = Math.max(maxX, x) }
const side = Math.max(maxX - minX + 1, bottom - top)
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: minX, top, width: maxX - minX + 1, height: bottom - top })
  .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
  .png()
  .toFile('public/logo-mark.png')
console.log('mark', { top, bottom, minX, maxX, side })

// --- Icônes PWA : logo complet sur fond blanc ---
async function icon(size, ratio, out) {
  const inner = Math.round(size * ratio)
  const logo = await sharp(SRC).resize(inner, inner, { kernel: 'lanczos3' }).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(out)
}
await icon(192, 0.8, 'public/icons/icon-192.png')
await icon(512, 0.8, 'public/icons/icon-512.png')
await icon(512, 0.58, 'public/icons/maskable-512.png')
