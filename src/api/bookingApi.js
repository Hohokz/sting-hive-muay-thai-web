import axios from '@/utils/axios'

// AUTH
const auth = {
  // Login expects { username, password } per user instructions, but frontend might currently send email.
  // I will leave the argument as 'credentials' so it's flexible, but I'll update the endpoint if it was wrong (it was correct).
  login: (credentials) => axios.post('/api/v1/auth/login', credentials),
  refreshToken: (refreshToken) => axios.post('/api/v1/auth/refresh-token', { refreshToken }),
  logout: () => axios.post('/api/v1/auth/logout'),
}

// DASHBOARD
const dashboard = {
  getDailyBookings: (date) => axios.get('/api/v1/dashboard/daily', { params: { date } }),
}

// BOOKINGS
const bookings = {
  // Search by email or just list
  get: (params) => axios.get('/api/v1/bookings', { params }),
  create: (data) => axios.post('/api/v1/bookings', data),
  update: (id, data) => axios.put(`/api/v1/bookings/${id}`, data),
  cancel: (id) => axios.patch(`/api/v1/bookings/${id}/cancel`),
}

// SCHEDULES
const schedules = {
  get: () => axios.get('/schedules'),
  getAvailable: (params) => axios.get('/api/v1/schedules/available', { params }),
  getCapacity: (scheduleId, date) => axios.get(`/capacity?schedule_id=${scheduleId}&date=${date}`),
  create: (data) => axios.post('/api/v1/schedules', data),
}

export default {
  auth,
  dashboard,
  bookings,
  schedules,
}

/**
 * Export named exports for convenience if needed,
 * but default export is preferred for grouping.
 */
export const api = {
  auth,
  dashboard,
  bookings,
  schedules,
}
