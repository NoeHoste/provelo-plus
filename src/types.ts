export type Category = 'etudiant' | 'employe' | 'sans_emploi'
/** Revenu principal (uniquement pour la catégorie « Sans emploi »). */
export type Income = 'chomage' | 'incapacite' | 'pension' | 'ris'
export type BikeType = 'ville' | 'electrique' | 'route' | 'cargo' | 'vtt'

export interface Profile {
  id: string
  nom: string
  prenom: string
  birthDate: string // ISO yyyy-mm-dd
  bikeType: BikeType
  bikeModel: string
  category: Category
  company: string
  income: Income
}

/** Compte stocké uniquement sur l'appareil (pas de backend). */
export interface Account {
  email: string
  salt: string
  hash: string
  stay: boolean
}

export interface Settings {
  carCost: number // €/km voiture
  bikeCost: number // €/km vélo (entretien)
}

export interface Trip {
  id: string
  date: string // ISO
  km: number
  label?: string
  safe?: boolean
}

export interface ClaimedVoucher {
  id: string
  rewardId: string
  title: string
  partner: string
  value: number
  cost: number
  code: string
  date: string
}

export type RewardGroup = 'supermarche' | 'magasin' | 'perso'
export type Tone = 'orange' | 'green' | 'yellow' | 'blue' | 'volt' | 'navy'

export interface Reward {
  id: string
  title: string
  partner: string
  description: string
  tag: string
  tone: Tone
  cost: number // points
  value: number // valeur en €
  group: RewardGroup
}

export type ParkingType = 'securise' | 'couvert' | 'arceau'
export type CityId = 'mons' | 'bruxelles' | 'tournai'

export interface Parking {
  id: string
  city: CityId
  name: string
  lat: number
  lng: number
  places: number
  free: number
  type: ParkingType
}

export interface Place {
  id: string
  city: CityId
  name: string
  lat: number
  lng: number
}

export type EventType = 'atelier' | 'balade' | 'formation' | 'bourse' | 'entreprise'

export interface ProEvent {
  id: string
  title: string
  type: EventType
  daysFromNow: number
  time: string
  place: string
  city: string
  description: string
  seats: number
  price: string
  points: number
  featured?: boolean
}

export interface BonusEntry {
  key: string
  pts: number
}

export interface AppState {
  profile: Profile | null
  account: Account | null
  loggedIn: boolean
  settings: Settings
  trips: Trip[]
  claimed: ClaimedVoucher[]
  registered: string[]
  bonusLog: BonusEntry[]
}
