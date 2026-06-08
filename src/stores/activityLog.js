import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { api } from '@/api/bookingApi'

/**
 * useActivityLogStore — activity log list with filters and pagination.
 * Extracted from ActivityLogPage.vue.
 */
export const useActivityLogStore = defineStore('activityLog', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const logs = ref([])
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    service: 'ALL',
    date: '', // YYYY-MM-DD
  })

  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Fetch logs using current filters and pagination state. */
  const fetchLogs = async () => {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        offset: (pagination.value.page - 1) * pagination.value.limit,
        service: filters.value.service !== 'ALL' ? filters.value.service : undefined,
        date: filters.value.date || undefined, // For backend support
      }

      const response = await api.logs.get(params)
      const data = response.data.data ?? response.data

      let fetchedLogs = []
      if (Array.isArray(data)) {
        fetchedLogs = data
        pagination.value.total =
          response.data.total ?? response.data.count ?? data.length ?? 0
      } else {
        fetchedLogs = data.logs ?? data.rows ?? data.items ?? data.data ?? []
        pagination.value.total =
          data.total ?? data.count ?? response.data.total ?? fetchedLogs.length ?? 0
      }

      logs.value = fetchedLogs

      pagination.value.totalPages =
        Math.ceil(pagination.value.total / pagination.value.limit) || 1
    } catch (err) {
      console.error('[activityLogStore] fetchLogs error:', err)
      error.value = err?.response?.data?.message ?? 'Failed to load logs'
    } finally {
      loading.value = false
    }
  }

  /**
   * Go to a specific page number.
   * @param {number} newPage
   */
  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.value.totalPages) {
      pagination.value.page = newPage
      fetchLogs()
    }
  }

  /**
   * Reset pagination to page 1 and reload.
   * Called automatically when `filters.service` or `filters.date` changes.
   */
  const resetAndFetch = () => {
    pagination.value.page = 1
    fetchLogs()
  }

  // Re-fetch when the service or date filter changes
  watch(() => filters.value.service, resetAndFetch)
  watch(() => filters.value.date, resetAndFetch)

  return {
    // State
    logs,
    loading,
    error,
    filters,
    pagination,
    // Actions
    fetchLogs,
    changePage,
    resetAndFetch,
  }
})
