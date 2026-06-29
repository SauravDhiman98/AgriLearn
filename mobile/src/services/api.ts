import axios from 'axios'
import Constants from 'expo-constants'

const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://10.0.2.2:8080/api/v1'

// Strips /api/v1 to get the server root (used for resolving relative file URLs like /uploads/notes/file.pdf)
export const API_ORIGIN = BASE_URL.replace(/\/api\/v\d+\/?$/, '')

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
  timeout: 10000,
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
  getSubject: (id: number) => apiClient.get(`/subjects/${id}`),
  getChapter: (id: number) => apiClient.get(`/exam-chapters/${id}`),
  getTest: (id: number, withAnswers = false) => apiClient.get(`/mcq-tests/${id}`, { params: { withAnswers } }),
  submitAttempt: (testId: number, answers: Record<number, string>, timeTakenSeconds = 0) =>
    apiClient.post(`/mcq-tests/${testId}/submit`, { testId, answers, timeTakenSeconds }),
  getAttempts: (testId: number) => apiClient.get(`/mcq-tests/${testId}/attempts`),
  getMockTests: (examId: number) => apiClient.get(`/exams/${examId}/mock-tests`),
  getLeaderboard: (testId: number) => apiClient.get(`/mock-tests/${testId}/leaderboard`),
  getRecentAttempts: () => apiClient.get('/me/attempts/recent'),
}

export const searchApi = {
  search: (q: string) => apiClient.get('/search', { params: { q } }),
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
