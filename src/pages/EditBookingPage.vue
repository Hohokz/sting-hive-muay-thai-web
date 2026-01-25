<template>
  <div class="w-full min-h-screen p-6 pb-20">
    <div
      v-if="isInitialLoading"
      class="max-w-4xl mx-auto bg-white rounded-xl shadow p-12 text-center"
    >
      <div
        class="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-gray-500 font-medium">Loading booking details...</p>
    </div>

    <div v-else class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Read-only Alert -->
      <div
        v-if="isReadOnly"
        class="lg:col-span-3 bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3"
      >
        <span class="text-2xl">⚠️</span>
        <div>
          <h3 class="font-bold text-red-800">Booking is {{ bookingStatus }}</h3>
          <p class="text-red-600 text-sm">
            This booking cannot be edited because its status is not a confirmed success status.
          </p>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Select Place</h2>
          <div class="flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-6">
            <label
              class="flex items-center gap-2"
              :class="isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
            >
              <input
                type="radio"
                value="STING_CLUB"
                v-model="selectedGym"
                class="accent-blue-600"
                :disabled="isReadOnly"
              />
              <span>Sting Club</span>
            </label>
            <label
              class="flex items-center gap-2"
              :class="isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
            >
              <input
                type="radio"
                value="STING_HIVE"
                v-model="selectedGym"
                class="accent-blue-600"
                :disabled="isReadOnly"
              />
              <span>Sting Hive</span>
            </label>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-6 pb-8 space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-4">Class Type</h3>
          </div>
          <div class="flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-6">
            <label
              class="flex items-center gap-2"
              :class="isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
            >
              <input
                type="radio"
                :value="false"
                v-model="selectPrivate"
                class="accent-blue-600"
                :disabled="isReadOnly"
              />
              <span>Group Class</span>
            </label>
            <label
              class="flex items-center gap-2"
              :class="isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
            >
              <input
                type="radio"
                :value="true"
                v-model="selectPrivate"
                class="accent-blue-600"
                :disabled="isReadOnly"
              />
              <span>Private Class</span>
            </label>
          </div>

          <h2 class="text-xl font-semibold mb-4">Select a Slot</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div class="calendar-wrapper">
              <p class="text-gray-600 text-sm mb-2">Select Date</p>
              <BookingCalender v-model="selectedDate" :disabled="isReadOnly" />
            </div>

            <div>
              <p class="text-gray-600 text-sm mb-5">Select Time</p>
              <BookingTimeSlots
                :date="selectedDate"
                :gym_enum="selectedGym"
                :is_private_class="selectPrivate"
                :filter-past-time="true"
                :disabled="isReadOnly"
                @select="onSelectSchedule"
              />
              <span v-if="!selectedGym" class="text-sm text-red-500">
                Please select a Place first.
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">Name</p>
              </div>
              <input
                v-model="clientName"
                class="w-full p-3 border rounded-md"
                placeholder="Enter name"
                :disabled="isReadOnly"
              />
            </div>
            <div>
              <p class="text-gray-600 text-sm mb-1">Mobile Number</p>
              <input
                v-model="mobile"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full p-3 border rounded-md"
                placeholder="Enter mobile number"
                maxlength="10"
                :disabled="isReadOnly"
                @input="mobile = mobile.replace(/\D/g, '')"
              />
            </div>
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">Email</p>
              </div>
              <input
                v-model="email"
                disabled
                class="w-full p-3 border rounded-md bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">Participants</p>
              </div>
              <input
                v-model.number="participants"
                type="number"
                class="w-full p-3 border rounded-md"
                placeholder="Number of participants (Maximum 5 people)"
                min="1"
                max="5"
                :disabled="isReadOnly"
                @input="handleParticipantsInput"
                @blur="handleParticipantsBlur"
              />
            </div>

            <!-- ✅ MULTIPLE STUDENTS -->
            <div v-if="selectPrivate">
              <p class="text-gray-600 text-sm mb-1">Multiple Students</p>
              <div class="flex items-center gap-6 p-3 border rounded-md">
                <label
                  class="flex items-center gap-2"
                  :class="isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
                >
                  <input
                    type="radio"
                    :value="true"
                    v-model="multipleStudents"
                    class="accent-blue-600"
                    :disabled="isReadOnly"
                  />
                  <span>Yes</span>
                </label>

                <label
                  class="flex items-center gap-2"
                  :class="isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
                >
                  <input
                    type="radio"
                    :value="false"
                    v-model="multipleStudents"
                    class="accent-blue-600"
                    :disabled="isReadOnly"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <!-- ✅ TRAINER (Optional) -->
            <div v-if="selectPrivate" class="md:col-span-2 relative trainer-select-container">
              <p class="text-gray-600 text-sm mb-1">Request Trainer (Optional)</p>
              <div class="relative group">
                <input
                  v-model="trainerSearchQuery"
                  type="text"
                  class="w-full p-3 border rounded-md pr-10"
                  placeholder="Search and select trainer..."
                  :disabled="isReadOnly"
                  @focus="showTrainerDropdown = true"
                  @input="onTrainerInput"
                />
                <button
                  @click="toggleTrainerDropdown"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform"
                  :class="{ 'rotate-180': showTrainerDropdown }"
                  :disabled="isReadOnly"
                >
                  ▼
                </button>
              </div>

              <!-- Dropdown -->
              <div
                v-if="showTrainerDropdown"
                class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-xl max-h-60 overflow-auto"
              >
                <div
                  v-for="trainer in filteredTrainers"
                  :key="trainer.id"
                  @click="selectTrainer(trainer)"
                  class="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-none flex justify-between items-center transition-colors"
                >
                  <span class="font-medium text-gray-700">{{ trainer.name }}</span>
                  <span v-if="selectedTrainerName === trainer.name" class="text-blue-600 font-bold"
                    >✓</span
                  >
                </div>
                <div
                  v-if="filteredTrainers.length === 0"
                  class="p-4 text-center text-gray-400 italic text-sm"
                >
                  No trainers found matching your search.
                </div>
              </div>

              <!-- Selected Trainer Info (Helper Text) -->
              <p
                v-if="selectedTrainerName && !showTrainerDropdown"
                class="text-[10px] text-blue-600 mt-1 font-semibold"
              >
                ✓ Currently selected: {{ selectedTrainerName }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow p-6 h-fit">
          <h2 class="text-lg font-semibold mb-4">Edit Summary</h2>

          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">Place</p>
            <p class="text-sm">{{ gymLabel }}</p>
          </div>

          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">Date & Time</p>
            <p v-if="!selectedDate || !selectedSchedule" class="text-sm mt-1">-</p>
            <p v-else class="text-sm mt-1">{{ displayDate }} - {{ displayTime }}</p>
          </div>

          <div class="border-b pb-4 mb-6">
            <p class="text-gray-700 font-medium mb-2">Booking Info</p>
            <div class="text-sm space-y-1">
              <p>
                <span class="text-gray-500">Name:</span> <span class="ml-1">{{ clientName }}</span>
              </p>
              <p>
                <span class="text-gray-500">Participants:</span>
                <span class="ml-1">{{ participants }}</span>
              </p>
              <p>
                <span class="text-gray-500">Type:</span>
                <span class="ml-1">{{ selectPrivate ? 'Private' : 'Group' }}</span>
              </p>
              <p>
                <span class="text-gray-500">Trainer:</span>
                <span class="ml-1">{{
                  selectPrivate && selectedTrainerName ? selectedTrainerName : '-'
                }}</span>
              </p>
              <p v-if="selectPrivate">
                <span class="text-gray-500">Type of Students:</span>
                <span class="ml-1">{{ multipleStudents ? '2v1' : '1v1' }}</span>
              </p>
              <p>
                <span class="text-gray-500">Status:</span>
                <span
                  class="ml-1 font-bold"
                  :class="isReadOnly ? 'text-red-600' : 'text-green-600'"
                  >{{ bookingStatus }}</span
                >
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button
              class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
              :disabled="isSubmitting || isReadOnly"
              @click="updateBooking"
            >
              <span v-if="!isSubmitting">Update Booking</span>
              <span v-else>Updating...</span>
            </button>
            <button
              class="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
              :disabled="isSubmitting || isReadOnly"
              @click="confirmCancel"
            >
              Cancel Booking
            </button>
            <button
              class="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold"
              @click="resetAll"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isSubmitting" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white px-6 py-4 rounded-xl shadow text-lg font-semibold">
      Updating Booking...
    </div>
  </div>

  <div v-if="showStatusModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm"
      @click="showStatusModal = false"
    ></div>
    <div
      class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fadeIn"
    >
      <div class="text-3xl mb-4">{{ modalType === 'success' ? '✅' : '⚠️' }}</div>
      <h3 class="text-xl font-bold mb-2">{{ modalTitle }}</h3>
      <p class="text-gray-500 mb-6">{{ modalMessage }}</p>
      <button
        @click="handleModalClose"
        class="w-full py-2 bg-black text-white rounded-xl font-semibold"
      >
        OK
      </button>
    </div>
  </div>

  <div v-if="showCancelConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm"
      @click="showCancelConfirm = false"
    ></div>
    <div
      class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fadeIn"
    >
      <div class="text-3xl mb-4">🗑️</div>
      <h3 class="text-xl font-bold mb-2">Cancel Booking?</h3>
      <p class="text-gray-500 mb-6">
        Are you sure you want to cancel this booking? This action cannot be undone.
      </p>

      <div class="flex gap-3">
        <button
          @click="showCancelConfirm = false"
          class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold"
        >
          No, Keep it
        </button>
        <button
          @click="handleConfirmCancel"
          class="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold"
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/bookingApi'
import { useSchedules } from '@/composables/useSchedules'
import BookingCalender from '@/components/ฺbooking/BookingCalender.vue'
import BookingTimeSlots from '@/components/ฺbooking/BookingTimeSlots.vue'
import trainerGymApi from '@/api/trainerGymApi'

const route = useRoute()
const router = useRouter()
const { fetchSchedules } = useSchedules()

const bookingId = route.params.id
const isSubmitting = ref(false)
const isInitialLoading = ref(true)

// Form State
const selectedGym = ref('')
const selectedDate = ref(null)
const selectedSchedule = ref(null)
const selectPrivate = ref(false)
const clientName = ref('')
const mobile = ref('')
const email = ref('')
const participants = ref(1)

// Trainer Selection
const trainers = ref([])
const trainerSearchQuery = ref('')
const selectedTrainerName = ref('')

// Multiple Students
const multipleStudents = ref(false)
const showTrainerDropdown = ref(false)

const bookingStatus = ref('')
const isReadOnly = computed(() => {
  const status = bookingStatus.value?.toLowerCase() || ''
  return status !== 'success' && status !== 'succeed'
})

const filteredTrainers = computed(() => {
  const q = trainerSearchQuery.value.toLowerCase().trim()
  // If the query exactly matches the selected name and dropdown has just been opened, show all for convenience
  if (selectedTrainerName.value === trainerSearchQuery.value && q !== '') {
    return trainers.value
  }
  if (!q) return trainers.value
  return trainers.value.filter((t) => t.name.toLowerCase().includes(q))
})

const fetchTrainers = async () => {
  // Strict check: Gym + Date + Schedule + Private
  if (
    !selectedGym.value ||
    !selectedDate.value ||
    !selectedSchedule.value ||
    !selectPrivate.value
  ) {
    trainers.value = []
    return
  }

  try {
    const gymId =
      selectedGym.value === 'STING_CLUB' ? 1 : selectedGym.value === 'STING_HIVE' ? 2 : null
    if (!gymId) {
      trainers.value = []
      return
    }

    // Format params
    const d = new Date(selectedDate.value)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    const params = {
      date: dateStr,
      classes_schedule_id: selectedSchedule.value.id,
    }

    const response = await trainerGymApi.getGymTrainers(gymId, params)
    const responseData = response.data
    const actualData = Array.isArray(responseData) ? responseData : responseData.data || []

    trainers.value = actualData.map((item) => {
      const raw = item.dataValues || item
      return {
        id: raw.id,
        name: raw.name || raw.username || (typeof raw === 'string' ? raw : ''),
      }
    })
  } catch (err) {
    console.error('❌ Fetch Trainers Error:', err)
    trainers.value = []
  }
}

const toggleTrainerDropdown = () => {
  showTrainerDropdown.value = !showTrainerDropdown.value
}

const onTrainerInput = () => {
  showTrainerDropdown.value = true
}

const selectTrainer = (trainer) => {
  selectedTrainerName.value = trainer.name
  trainerSearchQuery.value = trainer.name
  showTrainerDropdown.value = false
}

const handleClickOutside = (event) => {
  const container = document.querySelector('.trainer-select-container')
  if (container && !container.contains(event.target)) {
    showTrainerDropdown.value = false
  }
}

// Modal State
const showStatusModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('success')
const modalRedirect = ref(false)

const showCancelConfirm = ref(false)

const confirmCancel = () => {
  showCancelConfirm.value = true
}

// Computed (เหมือนไฟล์ที่ 1)
const gymLabel = computed(() => {
  if (selectedGym.value === 'STING_CLUB') return 'Sting Club'
  if (selectedGym.value === 'STING_HIVE') return 'Sting Hive'
  return '-'
})

const displayDate = computed(() => {
  if (!selectedDate.value) return '-'
  return new Date(selectedDate.value).toLocaleDateString('en-EN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const displayTime = computed(() => {
  if (!selectedSchedule.value) return '-'
  const start = selectedSchedule.value.start_time.slice(0, 5)
  const end = selectedSchedule.value.end_time.slice(0, 5)
  return `${start} - ${end}`
})

const onSelectSchedule = (payload) => {
  selectedSchedule.value = payload
}

const openStatusModal = (title, message, type = 'success', redirect = false) => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = type
  modalRedirect.value = redirect
  showStatusModal.value = true
}

const handleModalClose = () => {
  showStatusModal.value = false
  if (modalRedirect.value) router.push('/search-booking')
}

const resetAll = () => {
  sessionStorage.clear()
  router.push('/')
}

const handleParticipantsInput = () => {
  if (participants.value > 5) {
    participants.value = 5
  }
}

const handleParticipantsBlur = () => {
  // ✅ เช็ค Min ตอนลูกค้ากดออกจากช่อง (Blur) แล้วเท่านั้น
  if (!participants.value || participants.value < 1) {
    participants.value = 1
  }
}

const formatDateToLocal = (date) => {
  if (!date) return null
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T00:00:00.000+07:00`
}

// Fetch Initial Data
const fetchBookingDetail = async () => {
  try {
    isInitialLoading.value = true
    const res = await api.bookings.get({ classes_booking_id: bookingId })
    const b = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data

    if (!b) {
      openStatusModal('Error', 'ไม่พบข้อมูล booking', 'error')
      return
    }

    selectedGym.value = b.schedule.gym_enum
    selectedDate.value = b.date_booking
    selectPrivate.value = b.is_private
    clientName.value = b.client_name
    mobile.value = b.client_phone
    email.value = b.client_email
    participants.value = b.capacity
    multipleStudents.value = !!(b.multipleStudents || b.multiple_students)
    // Handle trainer as either string or object
    const tName =
      b.trainer_name || (typeof b.trainer === 'string' ? b.trainer : b.trainer?.name) || ''
    selectedTrainerName.value = tName
    trainerSearchQuery.value = tName
    bookingStatus.value = b.booking_status || b.status || ''
    selectedSchedule.value = {
      id: b.classes_schedule_id,
      start_time: b.schedule.start_time,
      end_time: b.schedule.end_time,
    }

    if (isReadOnly.value) {
      openStatusModal(
        'Warning',
        `Booking status : ${bookingStatus.value} can not reschedule this booking`,
        'warning',
      )
    }
  } catch {
    openStatusModal('Error', 'โหลดข้อมูล booking ไม่สำเร็จ', 'error')
  } finally {
    isInitialLoading.value = false
  }
}

onMounted(() => {
  fetchBookingDetail()
  // fetchTrainers() // Don't call immediately, let watchers handle or handle after details loaded
  // fetchBookingDetail calls fetchTrainers? No, but watchers might.
  // Actually, fetchBookingDetail sets selectedSchedule etc.
  // We should wait for booking detail to be loaded.
  // But wait, the watcher watches [selectedDate, selectPrivate, selectedGym] but NOT selectedSchedule?
  // Let's update the watcher logic below.
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// Watcher เพื่อดึงตารางเวลาใหม่
watch([selectedDate, selectPrivate, selectedGym], () => {
  if (selectedDate.value && selectedGym.value) {
    fetchSchedules({
      date: selectedDate.value,
      gym_enum: selectedGym.value,
      is_private_class: selectPrivate.value,
    })
  }
})

// Watcher to fetch trainers
watch([selectedGym, selectedDate, selectedSchedule, selectPrivate], () => {
  fetchTrainers()
})

const updateBooking = async () => {
  if (!selectedSchedule.value) {
    openStatusModal('Warning', 'กรุณาเลือกเวลาใหม่', 'warning')
    return
  }

  const payload = {
    gym_enum: selectedGym.value,
    client_name: clientName.value,
    client_phone: mobile.value,
    client_email: email.value,
    capacity: participants.value,
    is_private: selectPrivate.value,
    classes_schedule_id: selectedSchedule.value.id,
    date_booking: formatDateToLocal(selectedDate.value),
    trainer: selectPrivate.value ? selectedTrainerName.value || null : null,
    multipleStudents: selectPrivate.value ? multipleStudents.value : false,
  }

  try {
    isSubmitting.value = true
    await api.bookings.update(bookingId, payload)
    openStatusModal('Success', '✅ อัปเดต Booking สำเร็จแล้ว', 'success', true)
  } catch {
    openStatusModal('Error', '❌ อัปเดตไม่สำเร็จ', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleConfirmCancel = async () => {
  showCancelConfirm.value = false // ปิด Modal ยืนยัน

  try {
    isSubmitting.value = true // แสดง loading overlay
    await api.bookings.cancel(bookingId)

    // เมื่อลบสำเร็จ แสดง Modal แจ้งผล และตั้ง redirect เป็น true เพื่อกลับไปหน้าค้นหา
    openStatusModal('Success', '✅ ยกเลิกการจองเรียบร้อยแล้ว', 'success', true)
  } catch (err) {
    console.error(err)
    openStatusModal('Error', '❌ ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
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
