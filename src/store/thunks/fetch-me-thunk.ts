import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'
import { User } from '@/types/user-types'

export interface MeResponse {
  user: User | null
}

export const fetchMeThunk = createAsyncThunk<
  MeResponse,
  void,
  { rejectValue: string }
>('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient.get<MeResponse>('/api/auth/me')
    return data
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch current user')
  }
})
