import type { ProEvent } from '../types'

export const EVENTS: ProEvent[] = [
  { id: 'e1', title: 'Atelier réparation : crevaison & freins', type: 'atelier', daysFromNow: 3, time: '14:00', place: 'Atelier Pro Velo, Rue de Nimy 12', city: 'Mons', description: 'Apprenez à réparer une crevaison, régler vos freins et graisser la chaîne avec un mécanicien. Outils fournis.', seats: 12, price: 'Gratuit' },
  { id: 'e2', title: 'Balade guidée : le long du Haut-Escaut', type: 'balade', daysFromNow: 6, time: '10:00', place: 'Gare de Tournai', city: 'Tournai', description: '25 km tranquilles sur les voies lentes, pause café à mi-parcours. Tous niveaux.', seats: 25, price: 'Gratuit' },
  { id: 'e3', title: 'Formation : rouler en ville en sécurité', type: 'formation', daysFromNow: 9, time: '18:30', place: 'Maison de la Mobilité, Place de la Monnaie', city: 'Bruxelles', description: 'Comprendre les priorités, les angles morts et les bonnes trajectoires. Théorie puis pratique.', seats: 16, price: '5 €' },
  { id: 'e4', title: 'Bourse aux vélos de printemps', type: 'bourse', daysFromNow: 14, time: '09:00', place: 'Parc du Cinquantenaire', city: 'Bruxelles', description: 'Achetez ou vendez un vélo d’occasion vérifié. Dépôt dès 9h, vente 11h–16h.', seats: 200, price: 'Gratuit' },
  { id: 'e5', title: 'Challenge mobilité : 1 000 km en équipe', type: 'challenge', daysFromNow: 20, time: '00:00', place: 'Partout en Wallonie', city: 'Hainaut', description: 'Cumulez des kilomètres avec votre entreprise ou votre école et gagnez des bonus collectifs.', seats: 500, price: 'Gratuit' },
  { id: 'e6', title: 'Atelier : entretien du vélo électrique', type: 'atelier', daysFromNow: 12, time: '10:00', place: 'Bike Point, Rue Royale 8', city: 'Tournai', description: 'Batterie, moteur, pneus : les bons réflexes pour prolonger la durée de vie de votre VAE.', seats: 10, price: '10 €' },
  { id: 'e7', title: 'Balade nocturne éclairée', type: 'balade', daysFromNow: 27, time: '20:30', place: 'Grand-Place de Mons', city: 'Mons', description: 'Découvrez le patrimoine montois de nuit, éclairage obligatoire (kit en vente sur place).', seats: 30, price: 'Gratuit' },
  { id: 'e8', title: 'Formation : vélo cargo & enfants', type: 'formation', daysFromNow: 35, time: '14:00', place: 'Parc Josaphat', city: 'Bruxelles', description: 'Essayez différents vélos cargo, installez les enfants en sécurité et apprenez à manœuvrer.', seats: 14, price: '8 €' },
]

export const EVENT_TYPE_LABEL = {
  atelier: 'Atelier',
  balade: 'Balade',
  formation: 'Formation',
  bourse: 'Bourse',
  challenge: 'Challenge',
} as const

export function eventDate(e: ProEvent): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + e.daysFromNow)
  return d
}
