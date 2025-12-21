<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Bookings</h2>

      <div class="flex items-center gap-2">
        <BookingFilter v-model="filters" />

        <button
          @click="handleRefresh"
          :disabled="loading"
          class="text-sm px-4 py-2 bg-black text-white rounded-lg hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="loading" class="animate-spin">⟳</span>
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto relative min-h-[300px]">
      <table class="w-full text-sm">
        <thead class="border-b bg-gray-50">
          <tr class="text-left text-gray-600 select-none">
            <th class="py-2 px-2 cursor-pointer" @click="setSort('date_booking')">
              Date {{ sortIcon('date_booking') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('gym')">Gym {{ sortIcon('gym') }}</th>
            <th class="px-2 cursor-pointer" @click="setSort('is_private')">
              Class {{ sortIcon('is_private') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('type')">
              Type {{ sortIcon('type') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('client_name')">
              Name {{ sortIcon('client_name') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('capacity')">
              Pax {{ sortIcon('capacity') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('trainer')">
              Trainer {{ sortIcon('trainer') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('client_email')">
              Email {{ sortIcon('client_email') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('note')">
              Note {{ sortIcon('note') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('booking_status')">
              Status {{ sortIcon('booking_status') }}
            </th>
            <th v-if="auth.isAdmin" class="px-2"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading || isFiltering">
            <td colspan="11" class="text-center py-20">
              <div class="inline-flex flex-col items-center">
                <div
                  class="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-2"
                ></div>
                <p class="text-gray-500 font-medium">
                  {{ isFiltering ? 'Filtering...' : 'Fetching data...' }}
                </p>
              </div>
            </td>
          </tr>

          <template v-else-if="sortedBookings.length > 0">
            <tr
              v-for="item in sortedBookings"
              :key="item.id"
              class="border-b hover:bg-gray-50 text-xs sm:text-sm"
            >
              <td class="py-2 px-2 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ formatDate(item.date_booking) }}</div>
                <div class="text-xs text-gray-500">
                  {{ formatTime(item.schedule?.start_time) }} -
                  {{ formatTime(item.schedule?.end_time) }}
                </div>
              </td>
              <td class="px-2 whitespace-nowrap">{{ formatGym(item.schedule?.gym_enum) }}</td>
              <td class="px-2">
                <span
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                  :class="
                    item.is_private ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                  "
                >
                  {{ item.is_private ? 'Private' : 'Group' }}
                </span>
              </td>
              <td class="px-2 text-gray-500">{{ item.type || '-' }}</td>
              <td class="py-2 px-2 font-medium text-gray-900 whitespace-nowrap">
                {{ item.client_name }}
              </td>
              <td class="px-2 text-center">{{ item.capacity }}</td>
              <td class="px-2 text-gray-500 whitespace-nowrap">{{ item.trainer_name || '-' }}</td>
              <td class="px-2 max-w-[150px] truncate" :title="item.client_email">
                {{ item.client_email }}
              </td>
              <td class="px-2 max-w-[150px] truncate text-gray-500" :title="item.note">
                {{ item.note || '-' }}
              </td>
              <td class="px-2">
                <span
                  class="text-xs px-2 py-1 rounded font-semibold inline-block text-center min-w-[80px]"
                  :class="statusClass(item.booking_status)"
                >
                  {{ item.booking_status }}
                </span>
              </td>
              <td v-if="auth.isAdmin" class="px-2 text-right">
                <RouterLink
                  :to="`/edit-booking/${item.id}`"
                  class="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase"
                  >Edit</RouterLink
                >
              </td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="11" class="text-center text-gray-400 py-20">
              No bookings found with current filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BookingFilter from './BookingFilter.vue'

const auth = useAuthStore()
const emit = defineEmits(['refresh'])
const props = defineProps({
  bookings: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

/* ================= FILTER & LOADING SYSTEM ================= */
const isFiltering = ref(false)
const filters = ref({
  date: '',
  startTime: '',
  endTime: '',
  classType: 'ALL',
})

// ล้าง Filter เมื่อกด Refresh
const handleRefresh = () => {
  filters.value = { date: '', startTime: '', endTime: '', classType: 'ALL' }
  emit('refresh')
}

// Watch filters เพื่อสร้าง Loading ตอน Filter ข้อมูล
watch(
  filters,
  () => {
    isFiltering.value = true
    setTimeout(() => {
      isFiltering.value = false
    }, 300)
  },
  { deep: true },
)

const filteredBookings = computed(() => {
  return props.bookings.filter((item) => {
    // กรองวันที่
    if (filters.value.date && item.date_booking !== filters.value.date) return false
    // กรองประเภทคลาส
    if (filters.value.classType !== 'ALL') {
      const isPrivateTarget = filters.value.classType === 'PRIVATE'
      if (item.is_private !== isPrivateTarget) return false
    }
    // กรองเวลา (ถ้ามีระบุ)
    const itemStart = item.schedule?.start_time
    if (filters.value.startTime && itemStart < filters.value.startTime) return false
    if (filters.value.endTime && itemStart > filters.value.endTime) return false

    return true
  })
})

/* ================= SORT SYSTEM ================= */
const sortKey = ref('')
const sortOrder = ref('asc')

const setSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortedBookings = computed(() => {
  const data = [...filteredBookings.value] // เรียกใช้ filteredBookings ตรงนี้
  if (!sortKey.value) return data

  return data.sort((a, b) => {
    let valA, valB
    switch (sortKey.value) {
      case 'gym':
        valA = a.schedule?.gym_enum
        valB = b.schedule?.gym_enum
        break
      case 'time':
        valA = a.schedule?.start_time
        valB = b.schedule?.start_time
        break
      case 'trainer':
        valA = a.trainer_name
        valB = b.trainer_name
        break
      default:
        valA = a[sortKey.value]
        valB = b[sortKey.value]
    }
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const sortIcon = (key) => {
  if (sortKey.value !== key) return '↕'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

/* ================= UTILS ================= */
const formatTime = (time) => time?.slice(0, 5)
const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : '-')
const formatGym = (gym) =>
  gym === 'STING_HIVE' ? 'Sting Hive' : gym === 'STING_CLUB' ? 'Sting Club' : gym
const statusClass = (status) => {
  if (status === 'SUCCEED') return 'bg-green-100 text-green-700'
  if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700'
  if (status === 'CANCELLED') return 'bg-red-100 text-red-700'
  return 'bg-gray-200 text-gray-600'
}
</script>
