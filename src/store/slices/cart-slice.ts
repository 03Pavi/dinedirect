import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CartState, CartItem } from '@/types/order-types'

const initialState: CartState = {
  restaurantId: null,
  restaurantName: null,
  items: [],
  subtotal: 0,
  deliveryFee: 0,
}

const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{ item: CartItem; restaurantId: string; restaurantName?: string }>
    ) => {
      if (state.restaurantId && state.restaurantId !== action.payload.restaurantId) {
        state.items = []
      }
      state.restaurantId = action.payload.restaurantId
      if (action.payload.restaurantName) {
        state.restaurantName = action.payload.restaurantName
      }

      const existing = state.items.find((i) => i.menuItemId === action.payload.item.menuItemId)
      if (existing) {
        existing.quantity += action.payload.item.quantity
      } else {
        state.items.push(action.payload.item)
      }
      state.subtotal = calculateSubtotal(state.items)
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.menuItemId !== action.payload)
      state.subtotal = calculateSubtotal(state.items)
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = null
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ menuItemId: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.menuItemId === action.payload.menuItemId)
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.menuItemId !== action.payload.menuItemId)
        } else {
          item.quantity = action.payload.quantity
        }
      }
      state.subtotal = calculateSubtotal(state.items)
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = null
      }
    },
    clearCart: (state) => {
      state.restaurantId = null
      state.restaurantName = null
      state.items = []
      state.subtotal = 0
      state.deliveryFee = 0
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
