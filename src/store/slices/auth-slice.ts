import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, User } from '@/types/user-types'
import { loginThunk } from '../thunks/login-thunk'
import { registerThunk } from '../thunks/register-thunk'
import { fetchMeThunk } from '../thunks/fetch-me-thunk'
import { logoutThunk } from '../thunks/logout-thunk'

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.initialized = true
      state.error = null
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      state.initialized = true
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.initialized = true
      state.error = null
    })
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || 'Login failed'
    })

    // Register
    builder.addCase(registerThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.initialized = true
      state.error = null
    })
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || 'Registration failed'
    })

    // Fetch Me
    builder.addCase(fetchMeThunk.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchMeThunk.fulfilled, (state, action) => {
      state.loading = false
      state.initialized = true
      if (action.payload?.user) {
        state.user = action.payload.user
      }
    })
    builder.addCase(fetchMeThunk.rejected, (state) => {
      state.loading = false
      state.initialized = true
    })

    // Logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null
      state.token = null
      state.error = null
      state.initialized = true
    })
  },
})

export const {
  setCredentials,
  setUser,
  setLoading,
  setError,
  logout,
  setInitialized,
} = authSlice.actions

export const authReducer = authSlice.reducer
export default authSlice.reducer
