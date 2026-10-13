import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'
import { LoginPayload, User } from '@/types/user-types'

export interface LoginResponse {
  success: boolean
  user: User
  token: string
}

export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const data = await apiClient.post<LoginResponse>('/api/auth/login', payload)
    return data
  } catch (err: any) {
    return rejectWithValue(err.message || 'Login failed')
  }
})
