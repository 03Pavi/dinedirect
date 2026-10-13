export interface RestaurantCustomer {
  id: string
  name: string
  email: string
  phone?: string | null
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
}

export interface CustomerState {
  customers: RestaurantCustomer[]
  loading: boolean
  error: string | null
}
