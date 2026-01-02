import { ref } from 'vue'
import { api } from '@/api/bookingApi'

export function useSchedules() {
  const schedules = ref([])
  const loading = ref(false)

  const fetchSchedules = async ({ date, gym_enum, is_private_class }) => {
    try {
      if (!date || !gym_enum || is_private_class === null || is_private_class === undefined) {
        return
      }
      loading.value = true

      // Ensure date is YYYY-MM-DD string in Local Time to avoid UTC shift
      // If date is a Date object or ISO string, convert to YYYY-MM-DD
      let formattedDate = date
      if (date instanceof Date) {
        // Adjust for timezone offset to get "Local Date" part correctly
        const offset = date.getTimezoneOffset()
        formattedDate = new Date(date.getTime() - offset * 60 * 1000).toISOString().split('T')[0]
      } else if (typeof date === 'string' && date.includes('T')) {
        // If ISO string, do same logic or just split if we trust the input is already local-ish (risky)
        // Safer to treat as Date and format
        const d = new Date(date)
        const offset = d.getTimezoneOffset()
        formattedDate = new Date(d.getTime() - offset * 60 * 1000).toISOString().split('T')[0]
      }

      const params = { date: formattedDate, gym_enum, is_private_class }
      const res = await api.schedules.getAvailable(params)

      schedules.value = res.data.data || []
    } catch (err) {
      console.error('Failed to load schedules:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    schedules,
    loading,
    fetchSchedules,
  }
}
