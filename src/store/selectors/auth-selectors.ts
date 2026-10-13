    import { RootState } from '../store'

export const selectAuth = (state: RootState) => state.auth
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user
export const selectIsOwner = (state: RootState) => state.auth.user?.role === 'RESTAURANT_OWNER'
export const selectIsCustomer = (state: RootState) => state.auth.user?.role === 'CUSTOMER'
export const selectAuthLoading = (state: RootState) => state.auth.loading
export const selectAuthError = (state: RootState) => state.auth.error
export const selectAuthInitialized = (state: RootState) => state.auth.initialized
