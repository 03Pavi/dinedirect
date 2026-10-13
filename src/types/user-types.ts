export type UserRole = 'CUSTOMER' | 'RESTAURANT_OWNER'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  phone?: string | null
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  initialized: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
}

export interface LoginPayload {
  email: string
  password: string
}
