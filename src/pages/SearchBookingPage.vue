<template>
  <div class="w-full min-h-screen flex items-center justify-center p-6">
    <div class="bg-white rounded-xl shadow p-6 w-full max-w-md space-y-6">
      <h1 class="text-xl font-semibold text-center">Find Your Booking</h1>

      <div>
        <p class="text-sm text-gray-600 mb-1">Email</p>
        <input
          v-model="email"
          type="email"
          class="w-full p-3 border rounded-md"
          placeholder="Enter your email"
        />
        <p v-if="email && !email.includes('@')" class="text-xs text-red-500 mt-1">
          Invalid email format.
        </p>
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <button
          class="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          @click="resetAll"
        >
          Back
        </button>
        <button
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          :disabled="isLoading || !email || !email.includes('@')"
          @click="searchBooking"
        >
          <span v-if="!isLoading">Search Booking</span>
          <span v-else>Searching...</span>
        </button>
      </div>

      <div v-if="bookings.length" class="border-t pt-4 space-y-3">
        <h2 class="font-semibold text-gray-700">Your Bookings</h2>

        <div
          v-for="b in bookings"
          :key="b.id"
          class="border p-4 rounded-lg flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-sm"
        >
          <div class="text-sm w-full sm:w-auto">
            <p class="mb-1"><b class="text-gray-700">Date:</b> {{ b.date_booking }}</p>
            <p class="mb-1">
              <b class="text-gray-700">Time:</b> {{ b.schedule.start_time }} -
              {{ b.schedule.end_time }}
            </p>
            <p><b class="text-gray-700">Place:</b> {{ b.schedule.gym_enum }}</p>
          </div>

          <div class="flex gap-3 w-full sm:w-auto">
            <router-link
              :to="`/edit-booking/${b.id}`"
              class="flex-1 sm:flex-none text-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
            >
              Edit
            </router-link>

            <button
              class="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
              @click="cancelBooking(b.id)"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <p v-if="searched && !bookings.length" class="text-center text-red-500 text-sm">
        ❌ No bookings found for this email.
      </p>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-2xl w-[340px] text-center shadow-xl">
        <h3
          class="text-lg font-semibold mb-2"
          :class="{
            'text-yellow-500': modalType === 'warning',
            'text-red-500': modalType === 'error',
            'text-green-500': modalType === 'success',
          }"
        >
          {{ modalTitle }}
        </h3>

        <p class="text-gray-600 mb-5">
          {{ modalMessage }}
        </p>

        <div class="flex justify-center gap-3">
          <button
            v-if="modalAction"
            class="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
            :disabled="isLoading"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            class="px-5 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{
              'bg-yellow-500 hover:bg-yellow-600': modalType === 'warning',
              'bg-red-500 hover:bg-red-600': modalType === 'error',
              'bg-green-500 hover:bg-green-600': modalType === 'success',
            }"
            :disabled="isLoading"
            @click="modalAction ? modalAction() : closeModal()"
          >
            OK
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-[60]"
    >
      <svg
        class="animate-spin h-12 w-12 text-white mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-white font-semibold text-lg">Processing...</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '@/api/bookingApi'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const bookings = ref([])
const isLoading = ref(false)
const searched = ref(false)

const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('warning') // warning | success | error
const modalAction = ref(null) // ใช้สำหรับ confirm delete

const openModal = (title, message, type = 'warning', action = null) => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = type
  modalAction.value = action
  showModal.value = true
}

const closeModal = () => {
  if (isLoading.value) return // ป้องกันปิด Modal ตอนโหลด
  showModal.value = false
  modalAction.value = null
}

const resetAll = () => {
  sessionStorage.clear()
  router.push('/')
}

const searchBooking = async () => {
  try {
    isLoading.value = true
    searched.value = false
    bookings.value = []

    const res = await api.bookings.get({
      client_email: email.value,
      exclude_canceled: true,
    })

    const date = new Date()
    date.setHours(0, 0, 0, 0)

    const allBookings = res.data.data || []
    bookings.value = allBookings.filter(
      (b) =>
        b.booking_status !== 'PAYMENTED' &&
        b.booking_status !== 'CANCELED' &&
        new Date(b.date_booking) >= date,
    )
    searched.value = true
  } catch (err) {
    console.error(err)
    openModal('Search Failed', '❌ Unable to search booking. Please try again.', 'error')
  } finally {
    isLoading.value = false
  }
}

const cancelBooking = (bookingId) => {
  openModal(
    'Confirm Cancel',
    'Are you sure you want to cancel this booking?',
    'warning',
    async () => {
      try {
        isLoading.value = true // เริ่มหมุน Loading

        await api.bookings.cancel(bookingId)

        // โหลดข้อมูลใหม่หลังจากลบเสร็จ
        await searchBooking()

        openModal('Canceled Successfully', '✅ Booking has been canceled.', 'success')
      } catch (err) {
        console.error(err)
        openModal('Cancel Failed', '❌ Unable to cancel booking.', 'error')
      } finally {
        isLoading.value = false // หยุดหมุน
      }
    },
  )
}
</script>
