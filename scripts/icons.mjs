import sharp from 'sharp'
import { mkdirSync, readFileSync } from 'node:fs'
mkdirSync('public/icons', { recursive: true })
const svg = readFileSync('public/logo-provelo.svg')
await sharp(svg).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/icons/icon-512.png')
// maskable : logo réduit sur fond plein
const inner = await sharp(svg).resize(360, 360).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#0b3b5c' } })
  .composite([{ input: inner, gravity: 'center' }]).png().toFile('public/icons/maskable-512.png')
