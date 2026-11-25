import type { CityId, Parking, Place } from '../types'

export const CITIES: Record<CityId, { name: string; lat: number; lng: number; zoom: number }> = {
  mons: { name: 'Mons', lat: 50.4542, lng: 3.9523, zoom: 14 },
  bruxelles: { name: 'Bruxelles', lat: 50.8466, lng: 4.3528, zoom: 13 },
  tournai: { name: 'Tournai', lat: 50.6056, lng: 3.388, zoom: 14 },
}

export const PARKINGS: Parking[] = [
  { id: 'p-mons-gare', city: 'mons', name: 'Gare de Mons — Parking sécurisé', lat: 50.4533, lng: 3.9406, places: 240, free: 62, type: 'securise' },
  { id: 'p-mons-gp', city: 'mons', name: 'Grand-Place de Mons', lat: 50.4547, lng: 3.9524, places: 40, free: 18, type: 'arceau' },
  { id: 'p-mons-umons', city: 'mons', name: 'Campus UMONS — Abri couvert', lat: 50.456, lng: 3.944, places: 90, free: 31, type: 'couvert' },
  { id: 'p-mons-waux', city: 'mons', name: 'Parc du Waux-Hall', lat: 50.451, lng: 3.947, places: 30, free: 22, type: 'arceau' },
  { id: 'p-bxl-central', city: 'bruxelles', name: 'Bruxelles-Central — Parking sécurisé', lat: 50.8453, lng: 4.3571, places: 300, free: 47, type: 'securise' },
  { id: 'p-bxl-midi', city: 'bruxelles', name: 'Gare du Midi — Parking sécurisé', lat: 50.8357, lng: 4.3366, places: 420, free: 105, type: 'securise' },
  { id: 'p-bxl-flagey', city: 'bruxelles', name: 'Place Flagey', lat: 50.8274, lng: 4.372, places: 60, free: 14, type: 'arceau' },
  { id: 'p-bxl-cinq', city: 'bruxelles', name: 'Parc du Cinquantenaire — Abri couvert', lat: 50.8409, lng: 4.3935, places: 80, free: 40, type: 'couvert' },
  { id: 'p-tou-gare', city: 'tournai', name: 'Gare de Tournai — Parking sécurisé', lat: 50.6126, lng: 3.3957, places: 180, free: 55, type: 'securise' },
  { id: 'p-tou-gp', city: 'tournai', name: 'Grand-Place de Tournai', lat: 50.6072, lng: 3.3875, places: 36, free: 9, type: 'arceau' },
  { id: 'p-tou-trous', city: 'tournai', name: 'Pont des Trous', lat: 50.605, lng: 3.383, places: 24, free: 15, type: 'arceau' },
  { id: 'p-tou-esp', city: 'tournai', name: 'Esplanade de l’Europe — Abri couvert', lat: 50.6011, lng: 3.3892, places: 70, free: 26, type: 'couvert' },
]

const EXTRA: Place[] = [
  { id: 'x-mons-hotel', city: 'mons', name: 'Hôtel de Ville de Mons', lat: 50.4543, lng: 3.9527 },
  { id: 'x-mons-beffroi', city: 'mons', name: 'Beffroi de Mons', lat: 50.4575, lng: 3.9545 },
  { id: 'x-bxl-parc', city: 'bruxelles', name: 'Parc de Bruxelles', lat: 50.8467, lng: 4.3622 },
  { id: 'x-bxl-etangs', city: 'bruxelles', name: 'Étangs d’Ixelles', lat: 50.8233, lng: 4.3714 },
  { id: 'x-tou-cath', city: 'tournai', name: 'Cathédrale Notre-Dame', lat: 50.6063, lng: 3.3869 },
  { id: 'x-tou-marche', city: 'tournai', name: 'Marché aux Poteries', lat: 50.6039, lng: 3.3853 },
]

export const PLACES: Place[] = [
  ...PARKINGS.map((p) => ({ id: p.id, city: p.city, name: p.name.split(' — ')[0], lat: p.lat, lng: p.lng })),
  ...EXTRA,
]

export const PARKING_TYPE_LABEL = { securise: 'Sécurisé', couvert: 'Couvert', arceau: 'Arceaux' } as const
