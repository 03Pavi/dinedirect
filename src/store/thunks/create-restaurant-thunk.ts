import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'
import { CreateRestaurantPayload, Restaurant } from '@/types/restaurant-types'

export interface CreateRestaurantResponse {
  success: boolean
  restaurant: Restaurant
}

export const createRestaurantThunk = createAsyncThunk<
  Restaurant,
  CreateRestaurantPayload,
  { rejectValue: string }
>('restaurant/createRestaurant', async (payload, { rejectWithValue }) => {
  try {
    const data = await apiClient.post<CreateRestaurantResponse>('/api/restaurants', payload)
    return data.restaurant
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create restaurant')
  }
})
