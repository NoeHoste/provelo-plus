export type Category = 'etudiant' | 'employe' | 'pensionne' | 'sans_emploi'
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
}

export interface Trip {
  id: string
  date: string // ISO
  km: number
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

export type RewardCategory = 'supermarche' | 'sport' | 'boulangerie' | 'velo' | 'loisirs' | 'employeur'

export interface Reward {
  id: string
  title: string
  partner: string
  value: number // en €
  cost: number // en points
  category: RewardCategory
  description: string
  audience?: Category
  company?: boolean
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

export type EventType = 'atelier' | 'balade' | 'formation' | 'bourse' | 'challenge'

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
}

export interface AppState {
  profile: Profile | null
  trips: Trip[]
  claimed: ClaimedVoucher[]
  registered: string[]
  introSeen: boolean
}
