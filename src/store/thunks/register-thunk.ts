import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'
import { RegisterPayload, User } from '@/types/user-types'

export interface RegisterResponse {
  success: boolean
  user: User
  token: string
}

export const registerThunk = createAsyncThunk<
  RegisterResponse,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const data = await apiClient.post<RegisterResponse>('/api/auth/register', payload)
    return data
  } catch (err: any) {
    return rejectWithValue(err.message || 'Registration failed')
  }
})
