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

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),
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

export const examApi = {
  getAll: () => apiClient.get('/exams'),
  getById: (id: number) => apiClient.get(`/exams/${id}`),
  getSections: (examId: number) => apiClient.get(`/exams/${examId}/sections`),
  getSubject: (id: number) => apiClient.get(`/subjects/${id}`),
  getChapter: (id: number) => apiClient.get(`/exam-chapters/${id}`),
  getTest: (id: number, withAnswers = false) => apiClient.get(`/mcq-tests/${id}`, { params: { withAnswers } }),
  submitAttempt: (testId: number, answers: Record<number, string>, timeTakenSeconds = 0) =>
    apiClient.post(`/mcq-tests/${testId}/submit`, { testId, answers, timeTakenSeconds }),
  getAttempts: (testId: number) => apiClient.get(`/mcq-tests/${testId}/attempts`),
  getRecentAttempts: () => apiClient.get('/me/attempts/recent'),
  getLeaderboard: (testId: number) => apiClient.get(`/mock-tests/${testId}/leaderboard`),

  // Mock Tests
  getMockTests: (examId: number) => apiClient.get(`/exams/${examId}/mock-tests`),

  // Admin
  createExam: (data: any) => apiClient.post('/admin/exams', data),
  createSubject: (examId: number, data: any) => apiClient.post(`/admin/exams/${examId}/subjects`, data),
  createChapter: (subjectId: number, data: any) => apiClient.post(`/admin/subjects/${subjectId}/chapters`, data),
  createNotes: (chapterId: number, data: any) => apiClient.post(`/admin/chapters/${chapterId}/notes`, data),
  uploadNotesFile: (chapterId: number, formData: FormData) =>
    apiClient.post(`/admin/chapters/${chapterId}/notes/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateNotes: (notesId: number, data: any) => apiClient.put(`/admin/notes/${notesId}`, data),
  createVideo: (chapterId: number, data: any) => apiClient.post(`/admin/chapters/${chapterId}/videos`, data),
  generateMcq: (notesId: number, chapterId: number, questionCount = 10) =>
    apiClient.post(`/admin/notes/${notesId}/generate-mcq?chapterId=${chapterId}&questionCount=${questionCount}`),
  deleteNotes: (id: number) => apiClient.delete(`/admin/notes/${id}`),
  deleteVideo: (id: number) => apiClient.delete(`/admin/videos/${id}`),
  // Sections
  createSection: (examId: number, data: any) => apiClient.post(`/admin/exams/${examId}/sections`, data),
  updateSection: (sectionId: number, data: any) => apiClient.put(`/admin/sections/${sectionId}`, data),
  deleteSection: (sectionId: number) => apiClient.delete(`/admin/sections/${sectionId}`),
  // Admin Mock Tests
  createMockTest: (examId: number, data: any) => apiClient.post(`/admin/exams/${examId}/mock-tests`, data),
  deleteMockTest: (testId: number) => apiClient.delete(`/admin/mcq-tests/${testId}`),
  uploadMockTestCsv: (mockTestId: number, formData: FormData) =>
    apiClient.post(`/admin/mock-tests/${mockTestId}/upload-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const subscriptionApi = {
  getPlans: () => apiClient.get('/subscriptions/plans'),
  getMySubscription: () => apiClient.get('/subscriptions/my-subscription'),
  subscribe: (plan: string) => apiClient.post('/subscriptions/subscribe', { plan }),
  cancel: () => apiClient.post('/subscriptions/cancel'),
}

export const paymentApi = {
  createOrder: (plan: string) => apiClient.post('/payments/create-order', { plan }),
  verifyPayment: (data: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
    plan: string
  }) => apiClient.post('/payments/verify', data),
}


export const adminApi = {
  getAnalytics: () => apiClient.get('/admin/analytics'),
}

export const searchApi = {
  search: (q: string) => apiClient.get('/search', { params: { q } }),
}

export const gamificationApi = {
  getMyStats: () => apiClient.get('/me/stats'),
  getBookmarkedQuestions: () => apiClient.get('/bookmarks/questions'),
  toggleQuestionBookmark: (questionId: number) => apiClient.post(`/bookmarks/questions/${questionId}`),
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
