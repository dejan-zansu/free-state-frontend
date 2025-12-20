export type UserRole = 'ADMIN' | 'CUSTOMER' | 'SALES_REP'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: UserRole
  status: UserStatus
  preferredLanguage: string
  emailVerified: boolean
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  preferredLanguage?: 'de' | 'fr' | 'it' | 'en' | 'sr' | 'es'
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    expiresIn: number
  }
  message?: string
}

export interface RefreshResponse {
  success: boolean
  data: {
    accessToken: string
    expiresIn: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

