import type { Profile, Reward } from '../types'

// 1 km = 10 points ; 100 points = 1 € de valeur de bon (le coût d'un bon = valeur × 100)
export const REWARDS: Reward[] = [
  { id: 'r-colruyt', title: 'Bon de 5 €', partner: 'Colruyt', value: 5, cost: 500, category: 'supermarche', description: 'Valable sur vos courses en magasin, dès 25 € d’achat.' },
  { id: 'r-delhaize', title: 'Bon de 10 €', partner: 'Delhaize', value: 10, cost: 1000, category: 'supermarche', description: 'Valable dans tous les magasins Delhaize participants.' },
  { id: 'r-carrefour', title: 'Chèque de 20 €', partner: 'Carrefour', value: 20, cost: 2000, category: 'supermarche', description: 'Un coup de pouce pour le panier de la semaine.' },
  { id: 'r-boulanger', title: 'Petit-déjeuner offert', partner: 'Boulangerie Au Fournil (Mons)', value: 4, cost: 400, category: 'boulangerie', description: 'Un café et une viennoiserie chez votre boulanger local.' },
  { id: 'r-pain', title: 'Bon de 8 €', partner: 'Maison Dubois (Tournai)', value: 8, cost: 800, category: 'boulangerie', description: 'Pains, tartes et spécialités du Hainaut.' },
  { id: 'r-decathlon', title: 'Bon de 15 €', partner: 'Decathlon', value: 15, cost: 1500, category: 'sport', description: 'Pour vos équipements de sport et accessoires.' },
  { id: 'r-casque', title: 'Réduction casque -20 %', partner: 'Cyclo Shop Bruxelles', value: 12, cost: 1200, category: 'velo', description: 'Sur un casque de vélo homologué.' },
  { id: 'r-revision', title: 'Révision complète offerte', partner: 'Atelier Vélo Mons', value: 35, cost: 3500, category: 'velo', description: 'Contrôle freins, transmission, pneus et réglages.' },
  { id: 'r-eclairage', title: 'Kit éclairage LED', partner: 'Bike Point Tournai', value: 18, cost: 1800, category: 'velo', description: 'Éclairage avant/arrière rechargeable USB.' },
  { id: 'r-cine', title: 'Place de cinéma', partner: 'Imagix', value: 9, cost: 900, category: 'loisirs', description: 'Une séance au choix, du lundi au jeudi.' },
]

const AUDIENCE: Reward[] = [
  { id: 'a-etu-resto', title: 'Repas étudiant -50 %', partner: 'Resto U Campus', value: 3, cost: 250, category: 'loisirs', description: 'Offre spéciale étudiants sur présentation de la carte.', audience: 'etudiant' },
  { id: 'a-etu-lock', title: 'Antivol U-lock offert', partner: 'Cyclo Shop Bruxelles', value: 25, cost: 1800, category: 'velo', description: 'Antivol certifié, réservé aux étudiants.', audience: 'etudiant' },
  { id: 'a-pen-cafe', title: 'Café-gaufre offert', partner: 'Salon de thé Le Beffroi', value: 6, cost: 450, category: 'boulangerie', description: 'Un moment convivial après la balade, pour les pensionnés.', audience: 'pensionne' },
  { id: 'a-pen-bien', title: 'Séance bien-être -30 %', partner: 'Centre Santé Seniors', value: 14, cost: 1100, category: 'loisirs', description: 'Kiné ou massage doux, offre pensionnés.', audience: 'pensionne' },
  { id: 'a-sans-atelier', title: 'Atelier réparation gratuit', partner: 'Pro Velo Atelier', value: 15, cost: 600, category: 'velo', description: 'Remettez votre vélo en état avec un mécanicien.', audience: 'sans_emploi' },
  { id: 'a-sans-bon', title: 'Bon de 10 € alimentation', partner: 'Épicerie sociale Hainaut', value: 10, cost: 700, category: 'supermarche', description: 'Soutien aux demandeurs d’emploi.', audience: 'sans_emploi' },
]

export function rewardsForProfile(p: Profile | null): Reward[] {
  if (!p) return []
  const personal: Reward[] = AUDIENCE.filter((r) => r.audience === p.category)
  if (p.category === 'employe' && p.company.trim()) {
    const c = p.company.trim()
    const slug = c.toLowerCase().replace(/\s+/g, '-')
    personal.push(
      { id: `c-bonus-${slug}`, title: 'Bonus employeur mobilité', partner: c, value: 25, cost: 1500, category: 'employeur', description: `Prime vélo proposée par ${c} à ses collaborateurs cyclistes.`, company: true, audience: 'employe' },
      { id: `c-cheque-${slug}`, title: 'Chèque “Je viens à vélo”', partner: c, value: 50, cost: 3500, category: 'employeur', description: `Chèque dédié aux équipes de ${c}, cumulable avec l’indemnité vélo.`, company: true, audience: 'employe' },
    )
  }
  return personal
}

export const CATEGORY_NAMES: Record<string, string> = {
  supermarche: 'Supermarché',
  sport: 'Sport',
  boulangerie: 'Boulangerie',
  velo: 'Équipement vélo',
  loisirs: 'Loisirs',
  employeur: 'Employeur',
}
