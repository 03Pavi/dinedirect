import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'

export const logoutThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await apiClient.post('/api/auth/logout')
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to log out')
  }
})
