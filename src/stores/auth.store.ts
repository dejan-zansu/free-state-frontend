import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { getAccessToken, setAccessToken } from '@/lib/api'
import { authService } from '@/services/auth.service'
import type { LoginRequest, RegisterRequest, User } from '@/types/auth'

type ApiError = {
  response?: { data?: { error?: { code?: string; message?: string } } }
}

function getErrorCode(error: unknown): string | undefined {
  return (error as ApiError)?.response?.data?.error?.code
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

interface AuthActions {
  // Actions
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  googleLogin: (code: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  updateUser: (user: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.login(data)
          
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          })
        } catch (error: unknown) {
          const errorCode = getErrorCode(error) || 'loginFailed'
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorCode,
          })
          
          throw error
        }
      },

      googleLogin: async (code: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.googleAuth(code)

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          })
        } catch (error: unknown) {
          const errorCode = getErrorCode(error) || 'GOOGLE_AUTH_FAILED'

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorCode,
          })

          throw error
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.register(data)
          
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          })
        } catch (error: unknown) {
          const errorCode = getErrorCode(error) || 'registerFailed'
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorCode,
          })
          
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          await authService.logout()
        } finally {
          setAccessToken(null)
          set({
            ...initialState,
            isInitialized: true,
          })
        }
      },

      logoutAll: async () => {
        set({ isLoading: true })
        
        try {
          await authService.logoutAll()
        } finally {
          setAccessToken(null)
          set({
            ...initialState,
            isInitialized: true,
          })
        }
      },

      checkAuth: async () => {
        const token = getAccessToken()
        
        if (!token) {
          set({ isInitialized: true, isAuthenticated: false })
          return
        }

        set({ isLoading: true })
        
        try {
          const user = await authService.getMe()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          })
        } catch {
          setAccessToken(null)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)

