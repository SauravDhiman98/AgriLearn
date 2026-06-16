import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Only auto-logout on 401 if the user HAD a valid session (token existed).
// A 401 on the /auth/login endpoint is just wrong credentials — don't redirect.
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('accessToken')
      if (hadToken) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      // No token → login attempt failed → let the error bubble up to the thunk
    }
    return Promise.reject(error)
  },
)

export default apiClient
