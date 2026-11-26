import type { ProEvent } from '../types'

export const EVENTS: ProEvent[] = [
  { id: 'e1', title: 'Atelier : répare ton vélo', type: 'atelier', daysFromNow: 3, time: '18 h 30', place: 'Maison du vélo, Rue de Nimy 12', city: 'Mons', description: 'Crevaison, freins, chaîne : un mécanicien t’apprend les bases. Outils fournis.', seats: 12, price: 'Gratuit', points: 100 },
  { id: 'e2', title: 'Cours : rouler en ville', type: 'formation', daysFromNow: 7, time: '17 h', place: 'Maison de la Mobilité, Place de la Monnaie', city: 'Bruxelles', description: 'Priorités, angles morts, bonnes trajectoires. Théorie puis pratique, débutants bienvenus.', seats: 16, price: '5 €', points: 150 },
  { id: 'e3', title: 'Balade guidée des lumières de Noël', type: 'balade', daysFromNow: 16, time: '18 h', place: 'Départ Grand-Place', city: 'Mons', description: '12 km tranquilles sur les voies lentes, vin chaud à mi-parcours. Éclairage obligatoire.', seats: 40, price: 'Gratuit', points: 200, featured: true },
  { id: 'e4', title: 'Balade découverte du patrimoine', type: 'balade', daysFromNow: 23, time: '10 h', place: 'Gare de Tournai', city: 'Tournai', description: '20 km le long de l’Escaut, tous niveaux. Pause café à mi-parcours.', seats: 25, price: 'Gratuit', points: 200 },
  { id: 'e5', title: 'Bourse aux vélos', type: 'bourse', daysFromNow: 30, time: '9 h', place: 'Parc du Cinquantenaire', city: 'Bruxelles', description: 'Achète ou vends un vélo d’occasion vérifié. Dépôt dès 9 h, vente 11 h–16 h.', seats: 200, price: 'Gratuit', points: 100 },
  { id: 'e6', title: 'Défi mobilité inter-entreprises', type: 'entreprise', daysFromNow: 20, time: '00 h', place: 'Partout en Wallonie', city: 'Hainaut', description: 'Cumule des kilomètres avec ton entreprise et gagne des bonus collectifs. Ouvert aux employés.', seats: 500, price: 'Gratuit', points: 250 },
  { id: 'e7', title: 'Atelier : entretien du vélo électrique', type: 'atelier', daysFromNow: 12, time: '10 h', place: 'Bike Point, Rue Royale 8', city: 'Tournai', description: 'Batterie, moteur, pneus : les bons réflexes pour ton VAE.', seats: 10, price: '10 €', points: 120 },
  { id: 'e8', title: 'Formation : vélo cargo & enfants', type: 'formation', daysFromNow: 35, time: '14 h', place: 'Parc Josaphat', city: 'Bruxelles', description: 'Essaie des vélos cargo, installe les enfants en sécurité et apprends à manœuvrer.', seats: 14, price: '8 €', points: 150 },
]

export const EVENT_TYPE_LABEL = {
  atelier: 'Ateliers',
  balade: 'Balades',
  formation: 'Formations',
  bourse: 'Bourses',
  entreprise: 'Entreprises',
} as const

export function eventDate(e: ProEvent): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + e.daysFromNow)
  return d
}
