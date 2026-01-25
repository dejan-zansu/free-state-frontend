import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies
})

// Token storage utilities
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token)
    } else {
      localStorage.removeItem('accessToken')
    }
  }
}

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken')
  }
  return accessToken
}

// Request interceptor to add auth header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: AxiosError) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh for auth endpoints
      if (originalRequest.url?.includes('/auth/refresh') || 
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await api.post('/auth/refresh')
        const { accessToken: newToken } = response.data.data

        setAccessToken(newToken)
        processQueue(null, newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null)
        setAccessToken(null)
        
        // Redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

