import type { Profile, Reward } from '../types'

// 1 km = 10 points ; 100 points = 1 € de bon
export const REWARDS: Reward[] = [
  { id: 'r-super', title: 'Supermarché partenaire', partner: 'Colruyt, Delhaize, Carrefour', description: 'Chèque valable sur tout le magasin', tag: '10 €', tone: 'green', cost: 1000, value: 10, group: 'supermarche' },
  { id: 'r-super20', title: 'Chèque courses 20 €', partner: 'Carrefour', description: 'Un coup de pouce pour le panier de la semaine', tag: '20 €', tone: 'green', cost: 2000, value: 20, group: 'supermarche' },
  { id: 'r-boul', title: 'Boulangerie du quartier', partner: 'Au Fournil (Mons)', description: 'Petit-déj offert après ton trajet', tag: '5 €', tone: 'yellow', cost: 500, value: 5, group: 'magasin' },
  { id: 'r-livre', title: 'Librairie partenaire', partner: 'Filigranes', description: 'Bon d’achat livres & papeterie', tag: '15 €', tone: 'blue', cost: 1500, value: 15, group: 'magasin' },
  { id: 'r-atelier', title: 'Atelier vélo Pro Velo', partner: 'Pro Velo', description: 'Entretien complet de ton vélo', tag: '-25%', tone: 'volt', cost: 800, value: 8, group: 'magasin' },
  { id: 'r-casque', title: 'Casque -20 %', partner: 'Cyclo Shop Bruxelles', description: 'Sur un casque de vélo homologué', tag: '-20%', tone: 'orange', cost: 1200, value: 12, group: 'magasin' },
  { id: 'r-eclairage', title: 'Kit éclairage LED', partner: 'Bike Point Tournai', description: 'Éclairage avant/arrière rechargeable', tag: '18 €', tone: 'volt', cost: 1800, value: 18, group: 'magasin' },
  { id: 'r-sport', title: 'Équipement sportif', partner: 'Decathlon', description: 'Bon valable en magasin', tag: '15 €', tone: 'blue', cost: 1500, value: 15, group: 'magasin' },
  { id: 'r-cine', title: 'Place de cinéma', partner: 'Imagix', description: 'Une séance du lundi au jeudi', tag: '9 €', tone: 'orange', cost: 900, value: 9, group: 'magasin' },
]

const AUDIENCE: Record<string, Reward[]> = {
  etudiant: [
    { id: 'a-etu-resto', title: 'Resto universitaire', partner: 'Resto U Campus', description: 'Repas étudiant à moitié prix', tag: '-50%', tone: 'orange', cost: 250, value: 3, group: 'perso' },
    { id: 'a-etu-lock', title: 'Antivol U-lock offert', partner: 'Cyclo Shop', description: 'Antivol certifié, réservé aux étudiants', tag: '25 €', tone: 'blue', cost: 1800, value: 25, group: 'perso' },
  ],
  pensionne: [
    { id: 'a-pen-cafe', title: 'Café-gaufre offert', partner: 'Salon de thé Le Beffroi', description: 'Après la balade, un moment convivial', tag: '6 €', tone: 'yellow', cost: 450, value: 6, group: 'perso' },
    { id: 'a-pen-bien', title: 'Séance bien-être', partner: 'Centre Santé Seniors', description: 'Kiné ou massage doux', tag: '-30%', tone: 'orange', cost: 1100, value: 14, group: 'perso' },
  ],
  sans_emploi: [
    { id: 'a-sans-atelier', title: 'Atelier réparation gratuit', partner: 'Pro Velo Atelier', description: 'Remets ton vélo en état avec un mécanicien', tag: '15 €', tone: 'volt', cost: 600, value: 15, group: 'perso' },
    { id: 'a-sans-bon', title: 'Bon alimentation', partner: 'Épicerie sociale Hainaut', description: 'Soutien aux demandeurs d’emploi', tag: '10 €', tone: 'green', cost: 700, value: 10, group: 'perso' },
  ],
}

export function personalRewards(p: Profile | null): Reward[] {
  if (!p) return []
  if (p.category === 'employe' && p.company.trim()) {
    const c = p.company.trim()
    const slug = c.toLowerCase().replace(/\s+/g, '-')
    return [
      { id: `c-cantine-${slug}`, title: 'Cantine d’entreprise', partner: c, description: 'Offert par ton employeur', tag: '-15%', tone: 'orange', cost: 300, value: 3, group: 'perso' },
      { id: `c-bonus-${slug}`, title: 'Bonus mobilité', partner: c, description: `Prime vélo proposée par ${c}`, tag: '25 €', tone: 'navy', cost: 1500, value: 25, group: 'perso' },
      { id: `c-cheque-${slug}`, title: 'Chèque “Je viens à vélo”', partner: c, description: `Chèque dédié aux équipes de ${c}`, tag: '50 €', tone: 'navy', cost: 3500, value: 50, group: 'perso' },
    ]
  }
  return AUDIENCE[p.category] ?? []
}

export const allRewards = (p: Profile | null) => [...personalRewards(p), ...REWARDS]

export const personalLabel = (p: Profile | null) => (p?.category === 'employe' ? 'Ma société' : 'Pour moi')
