import axios from '@/utils/axios'

// AUTH
const auth = {
  login: (credentials) => axios.post('/api/v1/auth/login', credentials),
  refreshToken: (refreshToken) => axios.post('/api/v1/auth/refresh-token', { refreshToken }),
  getUser: () => axios.get('/api/v1/users'),
  getAllUser: () => axios.get('/api/v1/users/justUsers'),
  logout: () => axios.post('/api/v1/auth/logout'),
  createUser: (data) => axios.post('/api/v1/users', data),
  updateUser: (id, data) => axios.put(`/api/v1/users/${id}`, data),
  deleteUser: (id) => axios.delete(`/api/v1/users/${id}`),
}

// DASHBOARD
const dashboard = {
  getDailyBookings: (date) => axios.get('/api/v1/dashboard/daily', { params: { date } }),
  getSummary: (date) => axios.get('/api/v1/dashboard/summary', { params: { date } }),
  getDbSize: () => axios.get('/api/v1/dashboard/db-size'),
}

// BOOKINGS
const bookings = {
  // Search by email or just list
  get: (params) => axios.get('/api/v1/bookings', { params }),
  create: (data) => axios.post('/api/v1/bookings', data),
  update: (id, data) => axios.put(`/api/v1/bookings/${id}`, data),
  cancel: (id) => axios.patch(`/api/v1/bookings/${id}/cancel`),
  updateTrainer: (id, data) => axios.put(`/api/v1/bookings/updateBookingTrainer/${id}`, data),
  updateNote: (id, data) => axios.put(`/api/v1/bookings/updateBookingNote/${id}`, data),
  updatePayment: (id, data) => axios.put(`/api/v1/bookings/${id}/payment`, data),
  getTrainers: () => axios.get('/api/v1/bookings/trainers'),
  getByName: (name) => axios.get(`/api/v1/bookings/${name}`),
  getExportMonths: () => axios.get('/api/v1/bookings/export/months'),
  exportCsv: (params) =>
    axios.get('/api/v1/bookings/export', { params, responseType: 'blob' }),
  getExportedMonths: () => axios.get('/api/v1/bookings/purge/exported-months'),
  getPurgePreview: (month) => axios.get('/api/v1/bookings/purge/preview', { params: { month } }),
  purge: (month) => axios.delete('/api/v1/bookings/purge', { params: { month } }),
}

// SCHEDULES
const schedules = {
  get: () => axios.get('/api/v1/schedules'),
  getAvailable: (params) => axios.get('/api/v1/schedules/available', { params }),
  getCapacity: (scheduleId, date) => axios.get(`/capacity?schedule_id=${scheduleId}&date=${date}`),
  create: (data) => axios.post('/api/v1/schedules', data),
  update: (id, data) => axios.put(`/api/v1/schedules/${id}`, data),
  delete: (id) => axios.delete(`/api/v1/schedules/${id}`),
  createAdvance: (data) => axios.post('/api/v1/schedules/in-advance', data),
  getAdvanced: (params) => axios.get('/api/v1/schedules/in-advance', { params }),
  updateAdvanced: (id, data) => axios.put(`/api/v1/schedules/in-advance/${id}`, data),
  deleteAdvanced: (id) => axios.delete(`/api/v1/schedules/in-advance/${id}`),
}

// LOGS
const logs = {
  get: (params) => axios.get('/api/v1/activity-logs', { params }),
  getExportMonths: () => axios.get('/api/v1/activity-logs/export/months'),
  exportCsv: (params) =>
    axios.get('/api/v1/activity-logs/export', { params, responseType: 'blob' }),
  getExportedMonths: () => axios.get('/api/v1/activity-logs/purge/exported-months'),
  getPurgePreview: (month) =>
    axios.get('/api/v1/activity-logs/purge/preview', { params: { month } }),
  purge: (month) => axios.delete('/api/v1/activity-logs/purge', { params: { month } }),
}

export const api = {
  auth,
  dashboard,
  bookings,
  schedules,
  logs,
}
