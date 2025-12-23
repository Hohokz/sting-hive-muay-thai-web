<template>
  <DashboardLayout>
    <div class="space-y-10">
      <DashboardStats />

      <BookingTable
        :bookings="bookings"
        :loading="isLoading"
        v-model:filters="filters"
        @refresh="fetchBookings"
        @cancel="cancelBooking"
      />

      <ScheduleTable />
    </div>

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
import { ref, onMounted, watch } from 'vue'
import { api } from '@/api/bookingApi'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import BookingTable from '@/components/dashboard/BookingTable.vue'
import ScheduleTable from '@/components/dashboard/ScheduleTable.vue'

const bookings = ref([])
const isLoading = ref(false)

// ✅ แก้ไข: รวม selectedDate เข้ามาใน filters ตัวเดียวเลย
const filters = ref({
  date: new Date().toISOString().split('T')[0],
  startTime: '',
  endTime: '',
  classType: 'ALL',
  gym: 'ALL', // หน้า Dashboard หลักให้โชว์ ALL เป็นค่าเริ่มต้น
})

/* ================= MODAL SYSTEM ================= */
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('warning')
const modalAction = ref(null)

const openModal = (t, m, ty, a) => {
  modalTitle.value = t
  modalMessage.value = m
  modalType.value = ty
  modalAction.value = a
  showModal.value = true
}

const handleConfirm = async () => {
  if (modalAction.value) {
    const action = modalAction.value
    showModal.value = false
    await action()
  }
}

/* ================= API LOGIC ================= */
const fetchBookings = async () => {
  isLoading.value = true
  try {
    // ✅ ดึงวันที่จาก filters.value.date
    const res = await api.dashboard.getDailyBookings(filters.value.date)
    bookings.value = res.data.data
  } catch (err) {
    console.error('Fetch error:', err)
    openModal('Error', 'ไม่สามารถโหลดข้อมูลการจองได้', 'error', null)
  } finally {
    isLoading.value = false
  }
}

// ✅ Watcher: ถ้าวันที่เปลี่ยน ให้โหลดข้อมูลใหม่
watch(
  () => filters.value.date,
  (newDate) => {
    if (newDate) fetchBookings()
  },
)

/* ================= CANCEL LOGIC ================= */
const cancelBooking = (id) => {
  openModal(
    'Confirm Cancel',
    'Are you sure you want to cancel this booking?',
    'warning',
    async () => {
      try {
        isLoading.value = true
        await api.bookings.cancel(id)
        bookings.value = bookings.value.filter((b) => b.id !== id)
        openModal('Success', '✅ Booking has been canceled.', 'success', null)
      } catch {
        openModal('Error', '❌ Failed to cancel booking.', 'error', null)
      } finally {
        isLoading.value = false
      }
    },
  )
}

onMounted(fetchBookings)
</script>
