import axios from 'axios'

const API_URL = 'http://localhost:3000'
const DATE = '2025-12-21'
const TIME = '15:00'

const gyms = ['STING_CLUB', 'STING_HIVE']
const types = [false, true] // false = group, true = private

async function findSchedule() {
  for (const gym of gyms) {
    for (const isPrivate of types) {
      try {
        const res = await axios.get(`${API_URL}/api/v1/schedules/available`, {
          params: {
            date: DATE,
            gym_enum: gym,
            is_private_class: isPrivate,
          },
        })

        // Assuming response structure based on common patterns, need to verify if it's res.data or res.data.data
        // BookingPage says: const { fetchSchedules } = useSchedules() ...
        const schedules = res.data.data || res.data

        const target = schedules.find((s) => s.start_time.startsWith(TIME))

        if (target) {
          return { schedule: target, gym, isPrivate }
        }
      } catch (err) {
        console.error(`Error fetching schedules for ${gym}:`, err.message)
      }
    }
  }
  return null
}

async function createBooking() {
  const result = await findSchedule()

  if (!result) {
    return
  }

  const { schedule, gym, isPrivate } = result

  const payload = {
    gym_enum: gym,
    client_name: 'Antigravity Agent',
    client_phone: '0812345678',
    client_email: 'agent@example.com',
    participants: 1,
    is_private: isPrivate,
    classes_schedule_id: schedule.id,
    date_booking: DATE,
    capacity: 1,
  }

  try {
    await axios.post(`${API_URL}/api/v1/bookings`, payload)
  } catch (err) {
    console.error('Failed to create booking:', err.response ? err.response.data : err.message)
  }
}

createBooking()
