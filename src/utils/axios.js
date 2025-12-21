import axios from 'axios'

const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'http://localhost:3000'

axios.defaults.baseURL = STING_HIVE_API_URL

// Helper to get tokens to avoid circular dependency issues if store usage is complex
// But mostly we can just read localStorage directly or lazily import store
const getLocalAccessToken = () => localStorage.getItem('token')
const getLocalRefreshToken = () => localStorage.getItem('refreshToken')

axios.interceptors.request.use(
  (config) => {
    const token = getLocalAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return axios(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      // const refreshToken = getLocalRefreshToken(); // If I were using a separate var
      // But actually I need to send the refresh token to the server

      const refreshToken = getLocalRefreshToken()

      if (!refreshToken) {
        // No refresh token? Logout directly.
        // Avoid using store directly if possible to prevent circular dep, or use it carefully.
        // For now, consistent with previous code:
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/admin'
        return Promise.reject(error)
      }

      return new Promise(function (resolve, reject) {
        axios
          .post('/api/v1/auth/refresh-token', { refreshToken })
          .then(({ data }) => {
            const { accessToken, refreshToken: newRefreshToken } = data.data || data // Adapt based on API response structure

            localStorage.setItem('token', accessToken)
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken)
            }

            axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken
            originalRequest.headers['Authorization'] = 'Bearer ' + accessToken

            processQueue(null, accessToken)
            resolve(axios(originalRequest))
          })
          .catch((err) => {
            processQueue(err, null)
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            window.location.href = '/admin'
            reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    }

    return Promise.reject(error)
  },
)

export default axios
