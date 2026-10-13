export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'

export type PaymentMode = 'CASH' | 'UPI' | 'CARD'

export interface OrderItem {
  id: string
  orderId: string
  menuItemId?: string | null
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  customerId: string
  restaurantId: string
  status: OrderStatus
  totalAmount: number
  deliveryFee: number
  address: string
  note?: string | null
  paymentMode: PaymentMode
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  restaurant?: {
    id: string
    name: string
    phone: string
    address: string
    city: string
  }
  customer?: {
    id: string
    name: string
    email: string
    phone?: string | null
  }
}

export interface OrderState {
  orders: Order[]
  current: Order | null
  loading: boolean
  error: string | null
  socketConnected: boolean
}

export interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  isVeg: boolean
  imageUrl?: string | null
}

export interface CartState {
  restaurantId: string | null
  restaurantName?: string | null
  items: CartItem[]
  subtotal: number
  deliveryFee: number
}

export interface PlaceOrderItemPayload {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

export interface PlaceOrderPayload {
  restaurantId: string
  items: PlaceOrderItemPayload[]
  address: string
  note?: string
  paymentMode: PaymentMode
}

export interface UpdateOrderStatusPayload {
  orderId: string
  status: OrderStatus
}
