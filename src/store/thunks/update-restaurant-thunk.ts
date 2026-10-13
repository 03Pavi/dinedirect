import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'
import { UpdateRestaurantPayload, Restaurant } from '@/types/restaurant-types'

export interface UpdateRestaurantResponse {
  success: boolean
  restaurant: Restaurant
}

export const updateRestaurantThunk = createAsyncThunk<
  Restaurant,
  UpdateRestaurantPayload,
  { rejectValue: string }
>('restaurant/updateRestaurant', async (payload, { rejectWithValue }) => {
  try {
    const data = await apiClient.patch<UpdateRestaurantResponse>('/api/restaurants/me', payload)
    return data.restaurant
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update restaurant')
  }
})
