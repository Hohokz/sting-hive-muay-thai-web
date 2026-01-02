<template>
  <div class="grid md:grid-cols-4 gap-6">
    <!-- Loading State -->
    <template v-if="isLoading">
      <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-xl shadow animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div class="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </template>

    <!-- Loaded Data -->
    <template v-else>
      <div class="bg-white p-6 rounded-xl shadow">
        <p class="text-sm text-gray-500">Today Bookings</p>
        <p class="text-2xl font-bold">{{ summary.todayBooking || 0 }}</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow">
        <p class="text-sm text-gray-500">All Class</p>
        <p class="text-2xl font-bold">{{ summary.totalCapacityToday || 0 }}</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow">
        <p class="text-sm text-gray-500">Group Class</p>
        <p class="text-2xl font-bold">{{ summary.isNotPrivateCapacity || 0 }}</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow">
        <p class="text-sm text-gray-500">Private Class</p>
        <p class="text-2xl font-bold">{{ summary.isPrivateCapacity || 0 }}</p>
      </div>
    </template>

    <!-- ✅ STATUS MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showModal = false"></div>
      <div
        class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fadeIn"
      >
        <div class="text-3xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold mb-2">{{ modalTitle }}</h3>
        <p class="text-gray-500 mb-6">{{ modalMessage }}</p>
        <button
          @click="showModal = false"
          class="w-full py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from '@/api/bookingApi'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ date: '' }), // รูปแบบ YYYY-MM-DD
  },
})

const summary = ref({
  todayBooking: null,
  totalCapacityToday: null,
  isNotPrivateCapacity: null,
  isPrivateCapacity: null,
})

const isLoading = ref(false)

// ✅ MODAL STATE
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')

const openModal = (title, message) => {
  modalTitle.value = title
  modalMessage.value = message
  showModal.value = true
}

const fetchSummary = async (dateValue) => {
  try {
    isLoading.value = true
    const res = await api.dashboard.getSummary(dateValue)

    summary.value = res.data.data
  } catch (err) {
    console.error('❌ โหลด dashboard summary ไม่สำเร็จ:', err)
    openModal('Error', 'โหลดข้อมูลสรุปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.filters.date,
  () => fetchSummary(props.filters.date),
)
onMounted(() => fetchSummary(props.filters.date))
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
