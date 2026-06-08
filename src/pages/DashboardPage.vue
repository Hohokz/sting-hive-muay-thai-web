<template>
  <DashboardLayout>
    <div class="space-y-10">
      <DashboardStats :filters="bookingStore.filters" />

      <BookingTable
        :bookings="bookingStore.bookings"
        :loading="bookingStore.isLoading"
        v-model:filters="bookingStore.filters"
        @refresh="bookingStore.refresh"
        @cancel="confirmCancel"
      />

      <ScheduleTable />
    </div>

    <!-- Confirm / Status Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div class="text-center">
          <div class="text-3xl mb-4">{{ modalType === 'success' ? '✅' : '⚠️' }}</div>
          <h3 class="text-xl font-bold mb-2">{{ modalTitle }}</h3>
          <p class="text-gray-500 mb-6">{{ modalMessage }}</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showModal = false"
            class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold"
          >
            Cancel
          </button>
          <button
            v-if="modalAction"
            @click="handleConfirm"
            class="flex-1 py-2 bg-black text-white rounded-xl font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useBookingStore } from '@/stores/booking'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import BookingTable from '@/components/dashboard/BookingTable.vue'
import ScheduleTable from '@/components/dashboard/ScheduleTable.vue'

const bookingStore = useBookingStore()

/* ================= MODAL SYSTEM ================= */
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('warning')
const modalAction = ref(null)

const openModal = (title, message, type, action = null) => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = type
  modalAction.value = action
  showModal.value = true
}

const handleConfirm = async () => {
  if (modalAction.value) {
    const action = modalAction.value
    showModal.value = false
    await action()
  }
}

/* ================= CANCEL LOGIC ================= */
const confirmCancel = (id) => {
  openModal(
    'Confirm Cancel',
    'Are you sure you want to cancel this booking?',
    'warning',
    async () => {
      const result = await bookingStore.cancelBooking(id)
      if (result.ok) {
        openModal('Success', '✅ Booking has been canceled.', 'success')
      } else {
        openModal('Error', result.message ?? '❌ Failed to cancel booking.', 'error')
      }
    },
  )
}

/* ================= WATCHERS ================= */
// Re-fetch when date filter changes
watch(
  () => bookingStore.filters.date,
  (newDate) => {
    if (newDate) bookingStore.fetchBookings(newDate)
  },
)

onMounted(() => bookingStore.fetchBookings())
</script>
