<template>
  <div class="w-full min-h-screen p-6 pb-20">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT CONTENT -->
      <div class="lg:col-span-2 space-y-6">
        <!-- ✅ SELECT GYM -->
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Select Place</h2>

          <div class="flex justify-around items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="STING_CLUB"
                v-model="selectedGym"
                class="accent-blue-600"
              />
              <span>Sting Club</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="STING_HIVE"
                v-model="selectedGym"
                class="accent-blue-600"
              />
              <span>Sting Hive</span>
            </label>
          </div>
        </div>

        <!-- ✅ SELECT A SLOT -->
        <div class="bg-white rounded-xl shadow p-6 pb-8 space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-4">Class Type</h3>
          </div>
          <div class="flex justify-around items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="false" v-model="selectPrivate" class="accent-blue-600" />
              <span>Group Class</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="true" v-model="selectPrivate" class="accent-blue-600" />
              <span>Private Class</span>
            </label>
          </div>
          <h2 class="text-xl font-semibold mb-4">Select a Slot</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <!-- DATE -->
            <div class="calendar-wrapper">
              <p class="text-gray-600 text-sm mb-2">Select Date</p>
              <BookingCalender v-model="selectedDate" />
            </div>

            <!-- TIME -->
            <div>
              <p class="text-gray-600 text-sm mb-5">Select Time</p>

              <BookingTimeSlots
                :date="selectedDate"
                :gym_enum="selectedGym"
                :is_private_class="selectPrivate"
                :filter-past-time="true"
                @select="onSelectSchedule"
              />
            </div>
          </div>
        </div>
        <!-- ✅ CONTACT INFO -->
        <div class="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 class="text-xl font-semibold mb-4">Contact Information</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- NAME  -->
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">Name</p>
              </div>

              <input
                v-model="clientName"
                type="text"
                class="w-full p-3 border rounded-md"
                placeholder="Enter Your Name"
              />
            </div>
            <!-- ✅ MOBILE -->
            <div>
              <p class="text-gray-600 text-sm mb-1">Mobile Number</p>
              <input
                v-model="mobile"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full p-3 border rounded-md"
                placeholder="Enter mobile number"
                maxlength="10"
                @input="mobile = mobile.replace(/\D/g, '')"
              />
            </div>

            <!-- ✅ EMAIL -->
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">Email</p>
              </div>
              <input
                v-model="email"
                type="email"
                class="w-full p-3 border rounded-md"
                placeholder="Enter email address"
              />
              <p v-if="email && !email.includes('@')" class="text-red-500 text-xs mt-1">
                Invalid email format.
              </p>
            </div>
            <!-- ✅ Person -->
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
                @input="handleParticipantsInput"
                @blur="handleParticipantsBlur"
              />
            </div>

            <!-- ✅ TRAINER (Optional) -->
            <div class="md:col-span-2 relative trainer-select-container">
              <p class="text-gray-600 text-sm mb-1">Request Trainer (Optional)</p>
              <div class="relative group">
                <input
                  v-model="trainerSearchQuery"
                  type="text"
                  class="w-full p-3 border rounded-md pr-10"
                  placeholder="Search and select trainer..."
                  @focus="showTrainerDropdown = true"
                  @input="onTrainerInput"
                />
                <button
                  @click="toggleTrainerDropdown"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform"
                  :class="{ 'rotate-180': showTrainerDropdown }"
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

      <!-- ✅ RIGHT SUMMARY -->
      <div>
        <div class="bg-white rounded-xl shadow p-6 h-fit">
          <h2 class="text-lg font-semibold mb-4">Booking Details</h2>

          <!-- ✅ PLACE -->
          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">Place</p>
            <p class="text-sm">{{ gymLabel }}</p>
          </div>

          <!-- ✅ DATE & TIME -->
          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">Date & Time</p>
            <p v-if="!selectedDate || !selectedSchedule" class="text-sm mt-1">-</p>
            <p v-else class="text-sm mt-1">{{ displayDate }} - {{ displayTime }}</p>
          </div>

          <!-- ✅ CONTACT INFO SUMMARY -->
          <div class="border-b pb-4">
            <p class="text-gray-700 font-medium mb-2">Contact Information</p>

            <div class="text-sm space-y-1">
              <p>
                <span class="text-gray-500">Name:</span>
                <span class="ml-1">{{ clientName || '-' }}</span>
              </p>
              <p>
                <span class="text-gray-500">Mobile:</span>
                <span class="ml-1">{{ mobile || '-' }}</span>
              </p>

              <p>
                <span class="text-gray-500">Email:</span>
                <span class="ml-1">{{ email || '-' }}</span>
              </p>
              <p>
                <span class="text-gray-500">Participants:</span>
                <span class="ml-1">{{ participants || '-' }}</span>
              </p>
              <p>
                <span class="text-gray-500">Trainer:</span>
                <span class="ml-1">{{ selectedTrainerName || '-' }}</span>
              </p>
            </div>
          </div>

          <button
            class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
            :disabled="isSubmitting"
            @click="submitBooking"
          >
            <span v-if="!isSubmitting">Proceed to Booking</span>
            <span v-else>Loading...</span>
          </button>
        </div>

        <div
          v-if="isSubmitting"
          class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <div class="bg-white px-6 py-4 rounded-xl shadow text-lg font-semibold">
            Creating Booking...
          </div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 h-fit mt-6">
          <h2 class="text-lg font-semibold mb-4">Find Your Booking</h2>
          <button
            class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
            @click="goToFindBooking"
          >
            <span>Find Booking</span>
          </button>
        </div>
      </div>
    </div>
    <!-- WARNING MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-2xl w-[340px] text-center shadow-xl animate-fadeIn">
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

        <p class="text-gray-600">
          {{ modalMessage }}
        </p>

        <button
          class="mt-5 px-5 py-2 rounded-lg transition"
          :class="{
            'bg-yellow-500 text-white hover:bg-yellow-600': modalType === 'warning',
            'bg-red-500 text-white hover:bg-red-600': modalType === 'error',
            'bg-green-500 text-white hover:bg-green-600': modalType === 'success',
          }"
          @click="showModal = false"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import BookingCalender from '@/components/ฺbooking/BookingCalender.vue'
import BookingTimeSlots from '@/components/ฺbooking/BookingTimeSlots.vue'
import { api } from '@/api/bookingApi' // Updated import
import { useRouter } from 'vue-router'
import { useSchedules } from '@/composables/useSchedules'
import { onMounted, onUnmounted } from 'vue'

// const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'localhost:3000'; // Removed
const router = useRouter()

const goToFindBooking = () => {
  router.push('/search-booking') // ✅ path ของหน้าค้นหา booking
}
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('warning')

const openModal = (title, message, type = 'warning') => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = type
  showModal.value = true
}

// ... existing helper functions omitted for brevity in replace block if unchanged,
// but since this is a clean replacement let's include context or replace minimal part.
// I'll replace the script section mostly.

const gymLabel = computed(() => {
  if (selectedGym.value === 'STING_CLUB') return 'Sting Club'
  if (selectedGym.value === 'STING_HIVE') return 'Sting Hive'
  return '-'
})

const displayDate = computed(() => {
  if (!selectedDate.value) return '-'

  const d = new Date(selectedDate.value)
  return d.toLocaleDateString('en-EN', {
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

const selectedSchedule = ref(null)
const selectedDate = ref(null)

const selectedGym = ref(null)
const selectPrivate = ref(false)
const mobile = ref('')
const email = ref('')
const clientName = ref('')
const participants = ref(1)

// Trainer Selection
const trainers = ref([])
const trainerSearchQuery = ref('')
const selectedTrainerName = ref('')
const showTrainerDropdown = ref(false)

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
  try {
    const response = await api.bookings.getTrainers()
    const responseData = response.data
    const actualData = responseData.data || responseData

    if (Array.isArray(actualData)) {
      trainers.value = actualData.map((item) => {
        const raw = item.dataValues || item
        return {
          id: raw.id,
          name: raw.name || raw.username || (typeof raw === 'string' ? raw : ''),
        }
      })
    }
  } catch (err) {
    console.error('❌ Fetch Trainers Error:', err)
  }
}

const toggleTrainerDropdown = () => {
  showTrainerDropdown.value = !showTrainerDropdown.value
}

const onTrainerInput = () => {
  showTrainerDropdown.value = true
  // Clear selection if input changes significantly but keep it if it's just a prefix for now
  // We'll trust the selectTrainer function to finalize the selection
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

onMounted(() => {
  fetchTrainers()
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const onSelectSchedule = (payload) => {
  selectedSchedule.value = payload
}

const isSubmitting = ref(false)

const { fetchSchedules } = useSchedules()

const resetForm = () => {
  clientName.value = ''
  mobile.value = ''
  email.value = ''
  participants.value = 1
  selectedTrainerName.value = ''
  trainerSearchQuery.value = ''

  // ล้างค่าการเลือก (ถ้าต้องการให้เลือก Gym ใหม่ด้วยให้ uncomment บรรทัด selectedGym)
  selectedSchedule.value = null
  selectedDate.value = null
  selectedGym.value = null
  selectPrivate.value = false
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

const submitBooking = async () => {
  if (!selectedDate.value || !selectedSchedule.value || !selectedGym.value) {
    openModal(
      'Incomplete Information',
      'Please select Place / Date / Time before continuing.',
      'warning',
    )
    return
  }

  if (!participants.value || participants.value < 1 || participants.value > 5) {
    openModal('Incomplete Information', 'Please enter 1 - 5 participants.', 'warning')
    return
  }

  const payload = {
    gym_enum: selectedGym.value,
    client_name: clientName.value,
    client_phone: mobile.value,
    client_email: email.value,
    participants: participants.value,
    is_private: selectPrivate.value,
    classes_schedule_id: selectedSchedule.value.id,
    date_booking: formatDateToLocal(selectedDate.value),
    capacity: participants.value,
    trainer: selectedTrainerName.value || null,
  }

  try {
    isSubmitting.value = true
    await api.bookings.create(payload)

    openModal('Booking completed!', 'Your booking has been successfully created.', 'success')
    resetForm()
  } catch (err) {
    console.error('❌ Booking failed:', err)
    openModal(
      'Booking Failed',
      'There was an error creating your booking. Please try again later.',
      'error',
    )
  } finally {
    isSubmitting.value = false
  }
}

/* ✅ เมื่อเปลี่ยนวัน → reset เวลา */
watch([selectedSchedule, selectPrivate, selectedGym], () => {
  // ถ้าค่ายังไม่ครบ → ไม่ต้องยิง API
  if (!selectedDate.value || !selectedGym.value || selectPrivate.value === null) {
    return
  }

  fetchSchedules({
    date: selectedDate.value,
    gym_enum: selectedGym.value,
    is_private_class: selectPrivate.value,
  })
})
</script>
<style>
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
