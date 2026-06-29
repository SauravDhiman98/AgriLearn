import axios from 'axios'
import Constants from 'expo-constants'

const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://10.0.2.2:8080/api/v1'

// Injected from App.tsx after store is created — breaks the circular dependency
let _getToken: (() => string | null) = () => null
let _onUnauthorized: (() => void) = () => {}

export const configureApiClient = (
  getToken: () => string | null,
  onUnauthorized: () => void
) => {
  _getToken = getToken
  _onUnauthorized = onUnauthorized
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const token = _getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) _onUnauthorized()
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; role?: string; preferredLanguage?: string }) =>
    apiClient.post('/auth/register', data),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  forgotPassword: (email: string) => apiClient.post(`/auth/forgot-password?email=${email}`),
}

export const courseApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/courses', { params }),
  getById: (id: number) => apiClient.get(`/courses/${id}`),
  getFeatured: () => apiClient.get('/courses/featured'),
  enroll: (id: number) => apiClient.post(`/courses/${id}/enroll`),
  getMyCourses: () => apiClient.get('/courses/my-courses'),
  getProgress: (id: number) => apiClient.get(`/courses/${id}/progress`),
  completeLesson: (courseId: number, lessonId: number) =>
    apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
}

export const examApi = {
  list: () => apiClient.get('/exams'),
  getById: (id: number) => apiClient.get(`/exams/${id}`),
  getMockTests: (examId: number) => apiClient.get(`/exams/${examId}/mock-tests`),
  getRecentAttempts: () => apiClient.get('/me/attempts/recent'),
}

export const gamificationApi = {
  getMyStats: () => apiClient.get('/me/stats'),
}

export const forumApi = {
  listPosts: (params?: Record<string, unknown>) => apiClient.get('/forum/posts/public', { params }),
  getPost: (id: number) => apiClient.get(`/forum/posts/${id}`),
  createPost: (data: { title: string; content: string; tags: string[] }) =>
    apiClient.post('/forum/posts', data),
  addComment: (postId: number, content: string) =>
    apiClient.post(`/forum/posts/${postId}/comments`, { content }),
  upvotePost: (id: number) => apiClient.post(`/forum/posts/${id}/upvote`),
}

export const marketplaceApi = {
  listProducts: (params?: Record<string, unknown>) => apiClient.get('/marketplace/products/public', { params }),
  getProduct: (id: number) => apiClient.get(`/marketplace/products/${id}`),
  getOrders: () => apiClient.get('/marketplace/orders'),
}

export const liveClassApi = {
  listUpcoming: () => apiClient.get('/live-classes'),
  getClass: (id: number) => apiClient.get(`/live-classes/${id}`),
  register: (id: number) => apiClient.post(`/live-classes/${id}/register`),
}

export const userApi = {
  getMe: () => apiClient.get('/users/me'),
  updateProfile: (data: Record<string, string>) => apiClient.put('/users/me', data),
}

export default apiClient
