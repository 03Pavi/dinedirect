import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'
import { Restaurant } from '@/types/restaurant-types'

export interface FetchRestaurantsResponse {
  restaurants: Restaurant[]
}

export const fetchRestaurantsThunk = createAsyncThunk<
  Restaurant[],
  void,
  { rejectValue: string }
>('restaurant/fetchRestaurants', async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient.get<FetchRestaurantsResponse>('/api/restaurants')
    return data.restaurants || []
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch restaurants')
  }
})
