import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from './storage'
import authReducer from './slices/auth-slice'
import cartReducer from './slices/cart-slice'
import orderReducer from './slices/order-slice'
import restaurantReducer from './slices/restaurant-slice'
import menuReducer from './slices/menu-slice'

const cartPersistConfig = {
  key: 'dinein_cart',
  storage,
  whitelist: ['restaurantId', 'restaurantName', 'items', 'subtotal', 'deliveryFee'],
}

const authPersistConfig = {
  key: 'dinein_auth',
  storage,
  whitelist: ['user', 'token', 'initialized'],
}

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer)
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cart: persistedCartReducer,
    order: orderReducer,
    restaurant: restaurantReducer,
    menu: menuReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
