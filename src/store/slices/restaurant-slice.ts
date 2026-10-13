import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RestaurantState, Restaurant } from '@/types/restaurant-types'
import { fetchRestaurantsThunk } from '../thunks/fetch-restaurants-thunk'
import { fetchMyRestaurantThunk } from '../thunks/fetch-my-restaurant-thunk'
import { createRestaurantThunk } from '../thunks/create-restaurant-thunk'
import { updateRestaurantThunk } from '../thunks/update-restaurant-thunk'

const initialState: RestaurantState = {
  list: [],
  current: null,
  myRestaurant: null,
  loading: false,
  error: null,
}

export const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurants: (state, action: PayloadAction<Restaurant[]>) => {
      state.list = action.payload
    },
    setCurrentRestaurant: (state, action: PayloadAction<Restaurant | null>) => {
      state.current = action.payload
    },
    setMyRestaurant: (state, action: PayloadAction<Restaurant | null>) => {
      state.myRestaurant = action.payload
    },
    setRestaurantLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setRestaurantError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    // fetchRestaurants
    builder.addCase(fetchRestaurantsThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchRestaurantsThunk.fulfilled, (state, action) => {
      state.loading = false
      state.list = action.payload
    })
    builder.addCase(fetchRestaurantsThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || 'Failed to fetch restaurants'
    })

    // fetchMyRestaurant
    builder.addCase(fetchMyRestaurantThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchMyRestaurantThunk.fulfilled, (state, action) => {
      state.loading = false
      state.myRestaurant = action.payload
    })
    builder.addCase(fetchMyRestaurantThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || 'Failed to fetch restaurant'
    })

    // createRestaurant
    builder.addCase(createRestaurantThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createRestaurantThunk.fulfilled, (state, action) => {
      state.loading = false
      state.myRestaurant = action.payload
      state.list.unshift(action.payload)
    })
    builder.addCase(createRestaurantThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || 'Failed to create restaurant'
    })

    // updateRestaurant
    builder.addCase(updateRestaurantThunk.pending, (state) => {
      state.loading = true
    })
    builder.addCase(updateRestaurantThunk.fulfilled, (state, action) => {
      state.loading = false
      state.myRestaurant = action.payload
      const idx = state.list.findIndex((r) => r.id === action.payload.id)
      if (idx !== -1) {
        state.list[idx] = action.payload
      }
    })
    builder.addCase(updateRestaurantThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || 'Failed to update restaurant'
    })
  },
})

export const {
  setRestaurants,
  setCurrentRestaurant,
  setMyRestaurant,
  setRestaurantLoading,
  setRestaurantError,
} = restaurantSlice.actions

export const restaurantReducer = restaurantSlice.reducer
export default restaurantSlice.reducer
