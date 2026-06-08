import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/bookingApi'

/**
 * useBookingStore — dashboard bookings list and filter state.
 *
 * Separates data-fetching from DashboardPage.vue so the list can
 * be shared / cached between the dashboard and the booking-list view.
 */
export const useBookingStore = defineStore('booking', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const bookings = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /** Filters used by DashboardPage and BookingTable */
  const filters = ref({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    classType: 'ALL',
    gym: 'ALL',
  })

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Fetch the daily booking list for the given date (defaults to filters.date).
   * @param {string} [date] — YYYY-MM-DD, falls back to filters.value.date
   */
  const fetchBookings = async (date) => {
    const targetDate = date ?? filters.value.date
    isLoading.value = true
    error.value = null
    try {
      const res = await api.dashboard.getDailyBookings(targetDate)
      bookings.value = res.data.data ?? []
    } catch (err) {
      console.error('[bookingStore] fetchBookings error:', err)
      error.value = err?.response?.data?.message ?? 'Failed to load bookings'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cancel a booking by id and remove it from the local list.
   * @param {string|number} id
   * @returns {{ ok: boolean, message?: string }}
   */
  const cancelBooking = async (id) => {
    try {
      await api.bookings.cancel(id)
      bookings.value = bookings.value.filter((b) => b.id !== id)
      return { ok: true }
    } catch (err) {
      console.error('[bookingStore] cancelBooking error:', err)
      return { ok: false, message: err?.response?.data?.message ?? 'Failed to cancel booking' }
    }
  }

  /**
   * Refresh the list using the current filters.date value.
   */
  const refresh = () => fetchBookings()

  return {
    // State
    bookings,
    isLoading,
    error,
    filters,
    // Actions
    fetchBookings,
    cancelBooking,
    refresh,
  }
})
