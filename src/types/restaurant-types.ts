export interface Restaurant {
  id: string
  ownerId: string
  name: string
  description: string
  address: string
  city: string
  phone: string
  imageUrl?: string | null
  cuisine: string[] // decoded from JSON string or array
  openingTime: string
  closingTime: string
  isOpen: boolean
  isApproved: boolean
  fssaiNumber?: string | null
  deliveryFee: number
  minOrder: number
  createdAt: string
  categories?: any[]
  _count?: {
    orders?: number
    items?: number
  }
}

export interface RestaurantState {
  list: Restaurant[]
  current: Restaurant | null
  myRestaurant: Restaurant | null
  loading: boolean
  error: string | null
}

export interface CreateRestaurantPayload {
  name: string
  description: string
  address: string
  city: string
  phone: string
  imageUrl?: string
  cuisine: string[]
  openingTime: string
  closingTime: string
  fssaiNumber?: string
  deliveryFee?: number
  minOrder?: number
}

export interface UpdateRestaurantPayload extends Partial<CreateRestaurantPayload> {
  id: string
  isOpen?: boolean
}
