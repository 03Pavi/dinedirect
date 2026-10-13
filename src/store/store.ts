import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth-slice'
import cartReducer from './slices/cart-slice'
import orderReducer from './slices/order-slice'
import restaurantReducer from './slices/restaurant-slice'
import menuReducer from './slices/menu-slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    restaurant: restaurantReducer,
    menu: menuReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
