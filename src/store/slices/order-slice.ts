import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { OrderState, Order, OrderStatus } from '@/types/order-types'
import { fetchOrdersThunk, updateOrderStatusThunk, createDemoOrderThunk } from '../thunks/order-thunks'

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
    optimisticUpdateStatus: (
      state,
      action: PayloadAction<{ id: string; status: OrderStatus }>
    ) => {
      const idx = state.orders.findIndex((o) => o.id === action.payload.id)
      if (idx !== -1) {
        state.orders[idx].status = action.payload.status
      }
      if (state.current && state.current.id === action.payload.id) {
        state.current.status = action.payload.status
      }
    },
  },
  extraReducers: (builder) => {
    // fetchOrdersThunk
    builder.addCase(fetchOrdersThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchOrdersThunk.fulfilled, (state, action) => {
      state.loading = false
      state.orders = action.payload
    })
    builder.addCase(fetchOrdersThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || 'Failed to fetch orders'
    })

    // updateOrderStatusThunk
    builder.addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
      const updated = action.payload
      const idx = state.orders.findIndex((o) => o.id === updated.id)
      if (idx !== -1) {
        state.orders[idx] = updated
      } else {
        state.orders.unshift(updated)
      }
      if (state.current && state.current.id === updated.id) {
        state.current = updated
      }
    })

    // createDemoOrderThunk
    builder.addCase(createDemoOrderThunk.fulfilled, (state, action) => {
      state.orders.unshift(action.payload)
    })
  },
})

export const {
  setOrders,
  setCurrentOrder,
  setOrderLoading,
  setOrderError,
  setSocketConnected,
  optimisticUpdateStatus,
} = orderSlice.actions

export default orderSlice.reducer
