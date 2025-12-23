<template>
  <DashboardLayout>
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">{{ currentGymName }} Bookings</h2>
      <BookingTable
        :bookings="bookings"
        :loading="isLoading"
        v-model:filters="filters"
        @refresh="fetchBookings"
        @cancel="cancelBooking"
      />
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api/bookingApi'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import BookingTable from '@/components/dashboard/BookingTable.vue'

const route = useRoute()
const bookings = ref([])
const isLoading = ref(false)

const filters = ref({
  date: new Date().toISOString().split('T')[0],
  startTime: '',
  endTime: '',
  classType: 'ALL',
  gym: route.query.gym || 'ALL',
})

const showModal = ref(false),
  modalTitle = ref(''),
  modalMessage = ref(''),
  modalType = ref('warning'),
  modalAction = ref(null)

const openModal = (t, m, ty, a) => {
  modalTitle.value = t
  modalMessage.value = m
  modalType.value = ty
  modalAction.value = a
  showModal.value = true
}
const handleConfirm = async () => {
  if (modalAction.value) {
    const a = modalAction.value
    showModal.value = false
    await a()
  }
}

const currentGymName = computed(() =>
  filters.value.gym === 'STING_HIVE'
    ? 'Sting Hive'
    : filters.value.gym === 'STING_CLUB'
      ? 'Sting Club'
      : 'All',
)

const fetchBookings = async () => {
  isLoading.value = true
  try {
    const res = await api.dashboard.getDailyBookings(filters.value.date)
    bookings.value = res.data.data
  } catch (err) {
    console.error(err)
    openModal('Error', 'ไม่สามารถโหลดข้อมูลการจองได้', 'error', null)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => route.query.gym,
  (n) => {
    filters.value.gym = n || 'ALL'
  },
)
watch(() => filters.value.date, fetchBookings)

const cancelBooking = (id) => {
  openModal('Confirm Cancel', 'Are you sure?', 'warning', async () => {
    try {
      isLoading.value = true
      await api.bookings.cancel(id)
      bookings.value = bookings.value.filter((b) => b.id !== id)
      openModal('Success', 'Canceled!', 'success', null)
    } catch {
      openModal('Error', 'Failed', 'error', null)
    } finally {
      isLoading.value = false
    }
  })
}

onMounted(fetchBookings)
</script>
