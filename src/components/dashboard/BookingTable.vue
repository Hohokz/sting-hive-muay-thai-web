<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Bookings</h2>
      <div class="flex items-center gap-2">
        <BookingFilter v-model="filters" />
        <button
          @click="handleRefresh"
          :disabled="loading"
          class="text-sm px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
        >
          <span v-if="loading">⟳</span> {{ loading ? 'Loading...' : 'Refresh' }}
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
            <th class="px-2">Class</th>
            <th class="px-2">Name</th>
            <th class="px-2">Pax</th>
            <th class="px-2">Trainer</th>
            <th class="px-2">Status</th>
            <th v-if="auth.isAdmin" class="px-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading || isFiltering">
            <td colspan="11" class="text-center py-20 text-gray-500">Processing...</td>
          </tr>
          <template v-else-if="sortedBookings.length > 0">
            <tr v-for="item in sortedBookings" :key="item.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-2">
                <div class="font-medium">{{ formatDate(item.date_booking) }}</div>
                <div class="text-xs text-gray-500">
                  {{ formatTime(item.schedule?.start_time) }} -
                  {{ formatTime(item.schedule?.end_time) }}
                </div>
              </td>
              <td class="px-2">{{ formatGym(item.schedule?.gym_enum) }}</td>
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
              <td class="px-2 font-medium">{{ item.client_name }}</td>
              <td class="px-2 text-center">{{ item.capacity }}</td>
              <td class="px-2 text-gray-500">{{ item.trainer_name || '-' }}</td>
              <td class="px-2">
                <span
                  class="text-xs px-2 py-1 rounded font-semibold min-w-[80px] inline-block text-center"
                  :class="statusClass(item.booking_status)"
                >
                  {{ item.booking_status }}
                </span>
              </td>
              <td v-if="auth.isAdmin" class="px-2 text-center">
                <div class="flex items-center justify-center gap-3">
                  <RouterLink
                    :to="`/edit-booking/${item.id}`"
                    class="text-blue-500 hover:text-blue-700"
                    >✎</RouterLink
                  >
                  <button
                    v-if="item.booking_status !== 'CANCELLED'"
                    @click="confirmCancel(item)"
                    class="text-red-400 hover:text-red-600"
                  >
                    ✖
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="11" class="text-center py-20 text-gray-400">No bookings found.</td>
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
const emit = defineEmits(['refresh', 'cancel'])
const props = defineProps({
  bookings: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

// ✅ รับ v-model:filters มาจากแม่
const filters = defineModel('filters')
const isFiltering = ref(false)

const handleRefresh = () => {
  const gym = filters.value.gym
  filters.value = {
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    classType: 'ALL',
    gym,
  }
  emit('refresh')
}

watch(
  filters,
  () => {
    isFiltering.value = true
    setTimeout(() => (isFiltering.value = false), 300)
  },
  { deep: true },
)

const filteredBookings = computed(() => {
  if (!props.bookings) return []
  return props.bookings.filter((item) => {
    if (filters.value.gym !== 'ALL' && item.schedule?.gym_enum !== filters.value.gym) return false
    if (filters.value.date && item.date_booking?.slice(0, 10) !== filters.value.date) return false
    if (
      filters.value.classType !== 'ALL' &&
      item.is_private !== (filters.value.classType === 'PRIVATE')
    )
      return false
    const itemTime = item.schedule?.start_time?.slice(0, 5)
    if (itemTime && filters.value.startTime && itemTime < filters.value.startTime) return false
    if (itemTime && filters.value.endTime && itemTime > filters.value.endTime) return false
    return true
  })
})

/* ================= SORTING ================= */
const sortKey = ref('')
const sortOrder = ref('asc')
const setSort = (key) => {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}
const sortedBookings = computed(() => {
  const data = [...filteredBookings.value]
  if (!sortKey.value) return data
  return data.sort((a, b) => {
    let valA = a[sortKey.value],
      valB = b[sortKey.value]
    if (sortKey.value === 'gym') {
      valA = a.schedule?.gym_enum
      valB = b.schedule?.gym_enum
    }
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const sortIcon = (key) => (sortKey.value !== key ? '↕' : sortOrder.value === 'asc' ? '↑' : '↓')
const formatTime = (t) => t?.slice(0, 5) || '--:--'
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-')
const formatGym = (g) =>
  g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : '-'
const statusClass = (s) =>
  s === 'SUCCEED'
    ? 'bg-green-100 text-green-700'
    : s === 'CANCELLED'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700'
const confirmCancel = (i) => emit('cancel', i.id)
</script>
