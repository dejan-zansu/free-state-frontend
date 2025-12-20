import api, { setAccessToken } from '@/lib/api'
import type { AuthResponse, LoginRequest, RefreshResponse, RegisterRequest, User } from '@/types/auth'

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    
    if (response.data.success) {
      setAccessToken(response.data.data.accessToken)
    }
    
    return response.data
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    
    if (response.data.success) {
      setAccessToken(response.data.data.accessToken)
    }
    
    return response.data
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      setAccessToken(null)
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await api.post('/auth/logout-all')
    } finally {
      setAccessToken(null)
    }
  }

  /**
   * Refresh access token
   */
  async refresh(): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>('/auth/refresh')
    
    if (response.data.success) {
      setAccessToken(response.data.data.accessToken)
    }
    
    return response.data
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await api.get<{ success: boolean; data: { user: User } }>('/auth/me')
    return response.data.data.user
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token })
  }

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword })
  }
}

export const authService = new AuthService()

