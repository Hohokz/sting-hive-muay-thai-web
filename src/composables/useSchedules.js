import { ref } from 'vue'
import axios from 'axios'

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
      const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL

      const res = await axios.get(`${STING_HIVE_API_URL}/api/v1/schedules/available`, { params })

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
