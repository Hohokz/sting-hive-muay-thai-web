import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * useUiStore — shared UI feedback (toast notifications).
 * Use this instead of a local `toast` ref in individual components.
 */
export const useUiStore = defineStore('ui', () => {
  // ─── Toast ────────────────────────────────────────────────────────────────
  const toast = ref({ show: false, message: '', type: 'success' })
  let _toastTimer = null

  /**
   * Show a toast notification that auto-hides after `duration` ms.
   * @param {string} message
   * @param {'success'|'error'|'warning'} type
   * @param {number} duration  milliseconds before auto-hide (default 3000)
   */
  const showToast = (message, type = 'success', duration = 3000) => {
    if (_toastTimer) clearTimeout(_toastTimer)
    toast.value = { show: true, message, type }
    _toastTimer = setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  const hideToast = () => {
    if (_toastTimer) clearTimeout(_toastTimer)
    toast.value.show = false
  }

  return { toast, showToast, hideToast }
})
