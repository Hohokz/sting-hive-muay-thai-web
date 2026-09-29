import { ref, watch } from 'vue'
import { api } from '@/api/bookingApi'

// How far ahead the booking calendar can show closures
const LOOKAHEAD_DAYS = 365

const toDateKey = (d) => d.toLocaleDateString('en-CA') // YYYY-MM-DD, local

/**
 * Dates (YYYY-MM-DD) the selected gym is closed by an advance rule, so the
 * booking calendar can disable them. Refetches when the gym changes. On
 * error it falls back to no closed dates — the API still rejects bookings
 * on a closed day, this only saves the customer a failed attempt.
 *
 * @param {import('vue').Ref<string|null>} gymEnumRef - 'STING_CLUB' | 'STING_HIVE'
 */
export function useGymClosedDates(gymEnumRef) {
  const closedDates = ref([])

  const load = async (gymEnum) => {
    if (!gymEnum) {
      closedDates.value = []
      return
    }
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + LOOKAHEAD_DAYS)

    try {
      const res = await api.schedules.getClosedDates({
        gym_enum: gymEnum,
        start_date: toDateKey(start),
        end_date: toDateKey(end),
      })
      // Ignore a stale response if the gym changed while loading
      if (gymEnumRef.value === gymEnum) closedDates.value = res.data?.data || []
    } catch (err) {
      console.error('[useGymClosedDates] Failed to load closed dates', err)
      if (gymEnumRef.value === gymEnum) closedDates.value = []
    }
  }

  watch(gymEnumRef, load, { immediate: true })

  return { closedDates }
}
