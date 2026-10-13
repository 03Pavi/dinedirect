import { RootState } from '../store'

export const selectRestaurantState = (state: RootState) => state.restaurant
export const selectRestaurantsList = (state: RootState) => state.restaurant.list
export const selectCurrentRestaurant = (state: RootState) => state.restaurant.current
export const selectMyRestaurant = (state: RootState) => state.restaurant.myRestaurant
export const selectRestaurantLoading = (state: RootState) => state.restaurant.loading
export const selectRestaurantError = (state: RootState) => state.restaurant.error
