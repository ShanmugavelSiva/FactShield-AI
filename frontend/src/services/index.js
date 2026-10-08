import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
}

export const predictionService = {
  predict: (newsText) => api.post('/predict', { news_text: newsText }),
  predictUrl: (url) => api.post('/predict/url', { url }),
  getHistory: (params) => api.get('/history', { params }),
  getHistoryById: (id) => api.get(`/history/${id}`),
  deleteHistory: (id) => api.delete(`/history/${id}`),
}

export const verificationService = {
  verify: (claim) => api.post('/verify', { claim }),
  getHistory: (params) => api.get('/verify/history', { params }),
}

export const summarizerService = {
  summarize: (text) => api.post('/summarize', { text }),
}

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts'),
}

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getSystemStats: () => api.get('/admin/stats'),
  getActivityLogs: () => api.get('/admin/activity'),
}
