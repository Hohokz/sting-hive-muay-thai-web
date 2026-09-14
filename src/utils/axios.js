import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'http://localhost:3000'

axios.defaults.baseURL = STING_HIVE_API_URL
axios.defaults.timeout = 20000 // 20 seconds timeout to prevent infinite loading on mobile

// A network error / timeout carries no server response, so it can't be
// distinguished from other failures without checking error shape. Turning
// that into one consistent Thai message means every screen can just show
// `err.friendlyMessage` instead of guessing why the request failed.
const getFriendlyErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
    return 'การเชื่อมต่ออินเทอร์เน็ตช้าเกินไป (หมดเวลาเชื่อมต่อ) กรุณาตรวจสอบสัญญาณแล้วลองใหม่อีกครั้ง'
  }
  if (!error.response) {
    return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง'
  }
  return error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}

// Retrying is only safe for GET — a POST/PUT/DELETE that times out might
// have already succeeded server-side (the request could have landed, only
// the response got lost), so blindly re-sending it could double-create or
// double-charge something. GET reads are side-effect-free, so a lost
// response there just means "try the read again."
const MAX_CONNECTIVITY_RETRIES = 2
const RETRY_DELAY_BASE_MS = 1000
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryableConnectivityError = (error) => {
  const config = error.config
  if (!config) return false
  const method = (config.method || 'get').toLowerCase()
  if (method !== 'get') return false
  const isTimeout = error.code === 'ECONNABORTED'
  const isNetworkError = !error.response && error.message !== 'canceled'
  return isTimeout || isNetworkError
}

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

    // Attach a ready-to-display message once, up front, so it's present on
    // every rejection path below (including the auth-refresh branch) —
    // callers can just show `err.friendlyMessage` without re-deriving it.
    error.friendlyMessage = getFriendlyErrorMessage(error)

    // GET requests that failed purely from a slow/dropped connection (no
    // response at all) get a few automatic retries with backoff before
    // giving up — see isRetryableConnectivityError for why this is GET-only.
    if (isRetryableConnectivityError(error)) {
      const retryCount = originalRequest.__retryCount || 0
      if (retryCount < MAX_CONNECTIVITY_RETRIES) {
        originalRequest.__retryCount = retryCount + 1
        await wait(RETRY_DELAY_BASE_MS * originalRequest.__retryCount)
        return axios(originalRequest)
      }
    }

    // 1. ตรวจสอบว่าเป็น Request จากหน้า Login หรือไม่
    const isLoginRequest = originalRequest.url.includes('/api/v1/auth/login')

    // 2. ถ้าเป็น 401 หรือ 403 และ "ไม่ใช่" การ Login ให้ทำ Logic Refresh Token/Redirect ตามปกติ
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      // ✅ เพิ่มเงื่อนไข: ถ้าเป็นหน้า Login ให้พ่น Error กลับไปที่ Component เลย ห้ามเด้งหน้า
      if (isLoginRequest) {
        return Promise.reject(error)
      }

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

      const refreshToken = getLocalRefreshToken()

      if (!refreshToken) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')

        // สั่งเด้งหน้าเฉพาะเมื่อไม่ใช่หน้า Login
        if (!isLoginRequest) {
          window.location.href = '/admin'
        }
        return Promise.reject(error)
      }

      return new Promise(function (resolve, reject) {
        axios
          .post('/api/v1/auth/refresh-token', { refreshToken })
          .then(({ data }) => {
            const { accessToken, refreshToken: newRefreshToken } = data.data || data

            localStorage.setItem('token', accessToken)
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken)
            }

            // Sync with Pinia store
            const auth = useAuthStore()
            auth.setTokens(accessToken, newRefreshToken || refreshToken)

            originalRequest.headers['Authorization'] = 'Bearer ' + accessToken

            processQueue(null, accessToken)
            resolve(axios(originalRequest))
          })
          .catch((err) => {
            processQueue(err, null)
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')

            // ✅ เช็คอีกครั้งเพื่อความชัวร์
            if (!isLoginRequest) {
              window.location.href = '/admin'
            }
            reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    }

    console.error(
      `[Axios Error] ${error.response?.status || 'Network Error'} on ${originalRequest?.url}`,
      error,
    )
    return Promise.reject(error)
  },
)

export default axios
