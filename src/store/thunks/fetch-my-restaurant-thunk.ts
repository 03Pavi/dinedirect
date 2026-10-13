import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'
import { Restaurant } from '@/types/restaurant-types'

export interface FetchMyRestaurantResponse {
  restaurant: Restaurant | null
}

export const fetchMyRestaurantThunk = createAsyncThunk<
  Restaurant | null,
  void,
  { rejectValue: string }
>('restaurant/fetchMyRestaurant', async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient.get<FetchMyRestaurantResponse>('/api/restaurants/me')
    return data.restaurant
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch your restaurant')
  }
})
