import axios from 'axios'
import { trackApiCall } from '../utils/tracker'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach JWT on every request + record start time for response-time tracking
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Store request start time on the config object
  ;(config as any)._startTime = Date.now()
  return config
})

// Auto-refresh on 401: try the refresh token once, then re-send the original request.
// If refresh also fails, clear session and redirect to login.
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (res) => {
    // Track successful API calls
    const startTime = (res.config as any)._startTime
    const responseTimeMs = startTime ? Date.now() - startTime : 0
    const url = res.config.url || ''
    // Only track Spring Boot API calls (ignore refresh/auth internals)
    if (url && !url.includes('/auth/refresh')) {
      trackApiCall(res.config.method?.toUpperCase() || 'GET', url, res.status, responseTimeMs)
    }
    return res
  },
  async (error) => {
    const original = error.config

    // Track error responses
    if (error.response && original) {
      const startTime = (original as any)._startTime
      const responseTimeMs = startTime ? Date.now() - startTime : 0
      const url = original.url || ''
      if (url && !url.includes('/auth/refresh')) {
        trackApiCall(original.method?.toUpperCase() || 'GET', url, error.response.status, responseTimeMs)
      }
    }

    // Attempt refresh on 401 (expired token) or 403 when a token exists (expired token reaching admin endpoints)
    const hasToken = !!localStorage.getItem('accessToken')
    const shouldRetry =
      (error.response?.status === 401 || (error.response?.status === 403 && hasToken)) &&
      !original._retry &&
      !original.url?.includes('/auth/')

    if (shouldRetry) {
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`
          return apiClient(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`
        )
        const { accessToken, refreshToken: newRefresh } = res.data
        localStorage.setItem('accessToken', accessToken)
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh)
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
