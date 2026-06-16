import apiClient from './axios'

export const authApi = {
  register: (data: {
    firstName: string; lastName: string; email: string
    password: string; role?: string; preferredLanguage?: string
  }) => apiClient.post('/auth/register', data),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  refreshToken: (refreshToken: string) =>
    apiClient.post(`/auth/refresh?refreshToken=${refreshToken}`),

  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify-email?token=${token}`),

  forgotPassword: (email: string) =>
    apiClient.post(`/auth/forgot-password?email=${email}`),
}

export const courseApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/courses', { params }),

  getById: (id: number) => apiClient.get(`/courses/${id}`),

  getFeatured: () => apiClient.get('/courses/featured'),

  enroll: (id: number) => apiClient.post(`/courses/${id}/enroll`),

  getProgress: (id: number) => apiClient.get(`/courses/${id}/progress`),

  completeLesson: (courseId: number, lessonId: number) =>
    apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`),

  rate: (id: number, rating: number) =>
    apiClient.post(`/courses/${id}/rate?rating=${rating}`),

  getMyCourses: () => apiClient.get('/courses/my-courses'),

  getMyEnrollments: () => apiClient.get('/courses/my-enrollments'),
}

export const videoApi = {
  getStreamUrl: (lessonId: number) =>
    apiClient.get(`/videos/lessons/${lessonId}/stream`),

  uploadVideo: (lessonId: number, file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post(`/videos/lessons/${lessonId}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
  },

  deleteVideo: (lessonId: number) =>
    apiClient.delete(`/videos/lessons/${lessonId}/video`),

  uploadThumbnail: (courseId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post(`/videos/courses/${courseId}/thumbnail`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const forumApi = {
  listPosts: (params?: Record<string, unknown>) =>
    apiClient.get('/forum/posts/public', { params }),

  getPost: (id: number) => apiClient.get(`/forum/posts/${id}`),

  createPost: (data: { title: string; content: string; tags: string[] }) =>
    apiClient.post('/forum/posts', data),

  addComment: (postId: number, content: string) =>
    apiClient.post(`/forum/posts/${postId}/comments`, { content }),

  upvotePost: (id: number) => apiClient.post(`/forum/posts/${id}/upvote`),

  acceptAnswer: (commentId: number) =>
    apiClient.post(`/forum/comments/${commentId}/accept`),
}

export const marketplaceApi = {
  listProducts: (params?: Record<string, unknown>) =>
    apiClient.get('/marketplace/products/public', { params }),

  getProduct: (id: number) => apiClient.get(`/marketplace/products/${id}`),

  checkout: (items: Array<{ productId: number; quantity: number }>, address: string) =>
    apiClient.post('/marketplace/cart/checkout', { items, shippingAddress: address }),

  getOrders: (params?: Record<string, unknown>) =>
    apiClient.get('/marketplace/orders', { params }),

  getOrder: (orderNumber: string) =>
    apiClient.get(`/marketplace/orders/${orderNumber}`),
}

export const subscriptionApi = {
  getPlans: () => apiClient.get('/subscriptions/plans'),
  getMySubscription: () => apiClient.get('/subscriptions/my-subscription'),
  subscribe: (plan: string) => apiClient.post('/subscriptions/subscribe', { plan }),
  cancel: () => apiClient.post('/subscriptions/cancel'),
}

export const liveClassApi = {
  listUpcoming: () => apiClient.get('/live-classes'),
  getClass: (id: number) => apiClient.get(`/live-classes/${id}`),
  register: (id: number) => apiClient.post(`/live-classes/${id}/register`),
}

export const userApi = {
  getMe: () => apiClient.get('/users/me'),
  updateProfile: (data: Record<string, string>) => apiClient.put('/users/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put('/users/me/password', { currentPassword, newPassword }),
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

export const logApi = {
  getLogs: (params: { level?: string; keyword?: string; page?: number; size?: number }) =>
    apiClient.get('/admin/logs', { params }),

  getLogsSince: (afterId: number, params?: { level?: string; keyword?: string }) =>
    apiClient.get(`/admin/logs/since/${afterId}`, { params }),

  getStats: () => apiClient.get('/admin/logs/stats'),

  getLevels: () => apiClient.get('/admin/logs/levels'),

  setLevel: (loggerName: string, level: string) =>
    apiClient.post(`/admin/logs/levels/${encodeURIComponent(loggerName)}?level=${level}`),

  clearLogs: () => apiClient.delete('/admin/logs'),

  getDownloadUrl: (level?: string, keyword?: string) => {
    const token = localStorage.getItem('accessToken')
    const params = new URLSearchParams()
    if (level && level !== 'ALL') params.set('level', level)
    if (keyword) params.set('keyword', keyword)
    return `/api/v1/admin/logs/download?${params.toString()}`
  },
}
