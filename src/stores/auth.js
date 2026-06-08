import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const token = ref(null)
  const refreshToken = ref(null)
  const user = ref(null)

  // ─── Initialise from localStorage ────────────────────────────────────────
  const _init = () => {
    const savedToken = localStorage.getItem('token')
    const savedRefreshToken = localStorage.getItem('refreshToken')
    if (savedToken) {
      try {
        token.value = savedToken
        refreshToken.value = savedRefreshToken
        user.value = jwtDecode(savedToken)
      } catch (e) {
        console.error('Invalid token on init:', e)
        _clearStorage()
      }
    }
  }

  const _clearStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    token.value = null
    refreshToken.value = null
    user.value = null
  }

  // ─── Getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)

  const isAdmin = computed(() => {
    const role = user.value?.role?.toUpperCase()
    return role === 'ADMIN' || user.value?.roles?.includes('admin')
  })

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Called after a successful login API response.
   * @param {string} newToken  - JWT access token
   * @param {string|null} newRefreshToken
   * @returns {boolean} true if token was decoded successfully
   */
  const login = (newToken, newRefreshToken = null) => {
    if (!newToken) return false
    try {
      token.value = newToken
      refreshToken.value = newRefreshToken
      user.value = jwtDecode(newToken)
      localStorage.setItem('token', newToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }
      return true
    } catch (e) {
      console.error('Login error: Invalid token', e)
      return false
    }
  }

  /**
   * Update tokens (e.g., after a silent refresh).
   */
  const setTokens = (newToken, newRefreshToken = null) => {
    token.value = newToken
    refreshToken.value = newRefreshToken
    try {
      user.value = jwtDecode(newToken)
    } catch (e) {
      console.error('Invalid token on setTokens:', e)
    }
  }

  /**
   * Clear all auth state and remove from localStorage.
   */
  const logout = () => {
    _clearStorage()
  }

  // Run initialisation immediately
  _init()

  return {
    // State
    token,
    refreshToken,
    user,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    login,
    setTokens,
    logout,
  }
})
