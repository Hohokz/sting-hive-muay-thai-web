import { ref } from 'vue'
import { api } from '@/api/bookingApi'

export function useSchedules() {
  const schedules = ref([])
  const loading = ref(false)

  const fetchSchedules = async ({ date, gym_enum, is_private_class }) => {
    try {
      if (!date || !gym_enum || is_private_class === null || is_private_class === undefined) {
        console.log('⛔ fetchSchedules skipped — params not ready')
        return
      }
      loading.value = true

      const params = { date, gym_enum, is_private_class }
      const res = await api.schedules.getAvailable({ date, gym_enum, is_private_class })

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
