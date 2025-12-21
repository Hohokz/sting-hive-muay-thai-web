import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let token = localStorage.getItem('token') || null
    let refreshToken = localStorage.getItem('refreshToken') || null
    let user = null
    if (token) {
      try {
        user = jwtDecode(token)
      } catch (e) {
        console.error('Invalid token on init', e)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        token = null
        refreshToken = null
      }
    }
    return {
      token,
      refreshToken,
      user,
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    // ✅ ปรับให้เช็กเป็นตัวใหญ่ หรือใช้ .toUpperCase() เพื่อความชัวร์
    isAdmin: (state) => {
      const role = state.user?.role?.toUpperCase()
      return role === 'ADMIN' || state.user?.roles?.includes('admin')
    },
  },
  actions: {
    login(token, refreshToken) {
      if (!token) return
      try {
        this.token = token
        this.refreshToken = refreshToken
        this.user = jwtDecode(token)
        localStorage.setItem('token', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        return true
      } catch (e) {
        console.error('Login error: Invalid token', e)
        return false
      }
    },
    logout() {
      this.token = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
  },
})
