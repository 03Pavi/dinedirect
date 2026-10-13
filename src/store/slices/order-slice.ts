import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { OrderState, Order } from '@/types/order-types'

const initialState: OrderState = {
  orders: [],
  current: null,
  loading: false,
  error: null,
  socketConnected: false,
}

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.current = action.payload
    },
    setOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setOrderError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload
    },
  },
})

export const {
  setOrders,
  setCurrentOrder,
  setOrderLoading,
  setOrderError,
  setSocketConnected,
} = orderSlice.actions

export default orderSlice.reducer
