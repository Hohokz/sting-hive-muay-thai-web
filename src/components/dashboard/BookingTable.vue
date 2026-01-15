<template>
  <div class="bg-white rounded-xl shadow p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-800">Bookings Management</h2>
        <span
          v-if="totalPax > 0"
          class="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-lg border border-gray-200"
        >
          Total Pax: <span class="text-black font-bold">{{ totalPax }}</span>
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2">

        <button
          v-if="auth.isAdmin"
          @click="openAddModal"
          class="group text-sm px-4 py-2 bg-white border border-gray-500 text-black rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex items-center gap-2"
        >
          <img
            src="/dashboard/add-circle-svgrepo-com.svg"
            class="w-5 h-5 shrink-0 transition-all group-hover:brightness-0 group-hover:invert"
            alt="Add Booking"
          />
          Add Booking
        </button>
        <button
            @click="openSearchModal"
            class="group text-sm px-4 py-2 bg-white border border-gray-500 text-black rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex items-center gap-2"
        >
            Search By Name
        </button>
        <BookingFilter v-model="filters" />
        <button
          @click="handleRefresh"
          :disabled="loading"
          class="text-sm px-4 py-2 border border-black bg-black text-white rounded-lg disabled:opacity-50 whitespace-nowrap hover:bg-white hover:text-black hover:border-gray-500 transition-colors"
        >
          <span v-if="loading" class="inline-block animate-spin mr-1">⟳</span>
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Booking List Implementation -->
    <BookingList
        :bookings="filteredBookings"
        :loading="loading || isFiltering"
        @refresh="emit('refresh')"
        @cancel="(id) => emit('cancel', id)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import BookingFilter from './BookingFilter.vue'
import EditBookingModal from './EditBookingModal.vue'
import BookingList from './BookingList.vue'
import SearchBookingModal from './SearchBookingModal.vue'

const auth = useAuthStore()
const modalStore = useModalStore()
const emit = defineEmits(['refresh', 'cancel'])
const props = defineProps({
  bookings: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const filters = defineModel('filters')
const isFiltering = ref(false)

// ฟังก์ชันสำหรับเปิดเพื่อเพิ่มใหม่
const openAddModal = () => {
  if (!auth.isAdmin) return
  modalStore.open(EditBookingModal, {
    bookingId: null,
    onUpdated: () => emit('refresh'),
  })
}

const openSearchModal = () => {
    modalStore.open(SearchBookingModal)
}

/* ================= FILTER & REFRESH ================= */
const handleRefresh = () => {
  const gym = filters.value.gym
  // ✅ สร้างวันที่ปัจจุบันแบบปลอดภัย (YYYY-MM-DD)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const today = `${year}-${month}-${day}`

  filters.value = {
    date: today, // ✅ ได้ YYYY-MM-DD แน่นอน
    scheduleId: '',
    classType: 'ALL',
    gym: gym,
  }
  emit('refresh')
}

const filteredBookings = computed(() => {
  if (!props.bookings) return []
  return props.bookings.filter((item) => {
    // 0. Canceled Booking (Generally hidden in main table unless filtered otherwise?)
    // Original code: if (item.booking_status === 'CANCELED') return false
    if (item.booking_status === 'CANCELED') return false

    // ✅ 0.1 เพิ่มการกรองด้วยชื่อ (NAME FILTER) - Keep this as backup if filters has name
    const searchName = filters.value.name?.toLowerCase().trim() || ''
    if (searchName) {
      // เช็คว่าชื่อลูกค้า (client_name) ตรงกับที่พิมพ์ไหม
      const clientName = item.client_name?.toLowerCase() || ''
      if (!clientName.includes(searchName)) return false
    }
    // 1. Gym
    if (filters.value.gym && filters.value.gym !== 'ALL') {
      if (item.schedule?.gym_enum !== filters.value.gym) return false
    }
    // 2. Date
    if (filters.value.date) {
      const itemDate = item.date_booking?.slice(0, 10)
      if (itemDate !== filters.value.date) return false
    }
    // 3. Schedule ID (Strict Filter)
    if (filters.value.scheduleId && filters.value.scheduleId !== '') {
      const b_scheduleId = item.schedule_id || item.schedule?.id
      if (b_scheduleId != filters.value.scheduleId) return false
    }
    // 4. Class Type
    if (filters.value.classType !== 'ALL') {
      const isPrivateTarget = filters.value.classType === 'PRIVATE'
      if (item.is_private !== isPrivateTarget) return false
    }
    return true
  })
})

const totalPax = computed(() => {
  return filteredBookings.value.reduce((sum, item) => {
    return sum + (Number(item.capacity) || 0)
  }, 0)
})
</script>
