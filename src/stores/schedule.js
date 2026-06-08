import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/bookingApi'

/**
 * useScheduleStore — Centralizes all schedule-related state and API calls.
 */
export const useScheduleStore = defineStore('schedule', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const schedules = ref([])
  const isLoading = ref(false)
  const isUpdatingAll = ref(false)
  const updatingItems = ref({}) // Tracks loading state per item id
  const error = ref(null)

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Fetch all schedules.
   */
  const fetchSchedules = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.schedules.get()
      schedules.value = res.data?.data || res.data || []
    } catch (err) {
      console.error('[scheduleStore] Fetch error:', err)
      // Fallback to getAvailable if get() fails, as seen in original code
      try {
        const res2 = await api.schedules.getAvailable()
        schedules.value = res2.data?.data || res2.data || []
      } catch (err2) {
        console.error('[scheduleStore] Fetch fallback error:', err2)
        error.value = 'Failed to load schedules'
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a schedule by ID
   */
  const deleteSchedule = async (id) => {
    try {
      await api.schedules.delete(id)
      schedules.value = schedules.value.filter(s => s.id !== id)
      return { ok: true }
    } catch (err) {
      console.error('[scheduleStore] Delete error:', err)
      return { ok: false, message: 'Failed to delete schedule' }
    }
  }

  /**
   * Toggle the active status of a single schedule
   */
  const toggleActiveStatus = async (item) => {
    const newStatus = item.is_active
    try {
      updatingItems.value[item.id] = true
      const res = await api.schedules.update(item.id, { is_active: newStatus })
      
      const isSuccess = res && (!res.status || (res.status >= 200 && res.status < 300))
      if (isSuccess) {
        return { ok: true }
      } else {
        // Revert on failure
        item.is_active = !newStatus
        return { ok: false, message: 'Failed to update schedule status' }
      }
    } catch (err) {
      console.error('[scheduleStore] Failed to update status:', err)
      // Revert on failure
      item.is_active = !newStatus
      return { ok: false, message: 'Failed to update schedule status' }
    } finally {
      delete updatingItems.value[item.id]
    }
  }

  /**
   * Set active status for all schedules that don't match the desired status
   */
  const setAllActiveStatus = async (status) => {
    if (isUpdatingAll.value) return { ok: false, message: 'Already updating' }
    
    try {
      isUpdatingAll.value = true
      
      const schedulesToUpdate = schedules.value.filter(s => {
        const currentStatus = s.is_active === true
        return currentStatus !== status
      })

      if (schedulesToUpdate.length === 0) {
        return { ok: true, message: `All schedules are already ${status ? 'active' : 'inactive'}`, noOp: true }
      }

      const promises = schedulesToUpdate.map(s =>
        api.schedules.update(s.id, { is_active: status })
      )

      await Promise.all(promises)
      
      // Update local state
      schedulesToUpdate.forEach(s => s.is_active = status)
      
      return { ok: true, count: schedulesToUpdate.length }
    } catch (err) {
      console.error('[scheduleStore] Failed to update all schedules:', err)
      return { ok: false, message: 'Failed to update some schedules' }
    } finally {
      isUpdatingAll.value = false
      await fetchSchedules() // Sync with server to be absolutely sure
    }
  }

  return {
    // State
    schedules,
    isLoading,
    isUpdatingAll,
    updatingItems,
    error,
    // Actions
    fetchSchedules,
    deleteSchedule,
    toggleActiveStatus,
    setAllActiveStatus
  }
})
