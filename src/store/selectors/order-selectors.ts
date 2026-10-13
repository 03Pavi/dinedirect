import { RootState } from '../store'

export const selectOrders = (state: RootState) => state.order.orders
export const selectCurrentOrder = (state: RootState) => state.order.current
export const selectOrderLoading = (state: RootState) => state.order.loading
export const selectOrderError = (state: RootState) => state.order.error
export const selectSocketConnected = (state: RootState) => state.order.socketConnected
