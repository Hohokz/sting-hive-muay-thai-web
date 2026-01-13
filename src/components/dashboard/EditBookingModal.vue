<template>
  <div
    class="relative bg-gray-50 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-fadeIn"
    @click.stop
  >
    <div class="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div>
          <h3 class="text-xl font-bold text-gray-900 leading-tight">
            {{ isEditMode ? 'Edit Booking' : 'Add New Booking' }}
          </h3>
          <p class="text-sm text-gray-400 font-medium">
            {{ isEditMode ? 'Modify reservation details' : 'Create a new client reservation' }}
          </p>
        </div>
      </div>
      <button @click="handleCancel" class="text-gray-400 hover:text-black transition-colors p-2">
        <img src="/dashboard/cancel1-svgrepo-com.svg" alt="Close" class="w-7 h-7" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
      <div
        v-if="isInitialLoading"
        class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm"
      >
        <div
          class="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"
        ></div>
        <p class="text-gray-400 font-bold uppercase text-xs tracking-widest">Processing...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold mb-6">Select Place</h2>
            <div class="flex justify-around items-center gap-6">
              <label class="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  value="STING_CLUB"
                  v-model="selectedGym"
                  class="w-5 h-5 accent-blue-600"
                />
                <span class="text-gray-700 font-medium group-hover:text-blue-600">Sting Club</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  value="STING_HIVE"
                  v-model="selectedGym"
                  class="w-5 h-5 accent-blue-600"
                />
                <span class="text-gray-700 font-medium group-hover:text-blue-600">Sting Hive</span>
              </label>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 space-y-8">
            <div>
              <h3 class="text-xl font-semibold mb-6">Class Type</h3>
              <div class="flex justify-around items-center gap-6">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    :value="false"
                    v-model="selectPrivate"
                    class="w-5 h-5 accent-blue-600"
                  />
                  <span class="text-gray-700 font-medium">Group Class</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    :value="true"
                    v-model="selectPrivate"
                    class="w-5 h-5 accent-blue-600"
                  />
                  <span class="text-gray-700 font-medium">Private Class</span>
                </label>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div class="calendar-wrapper">
                  <p class="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4 ml-1">
                    Select Date
                  </p>
                  <div class="border rounded-2xl p-2 bg-gray-50/50">
                    <BookingCalender v-model="selectedDate" />
                  </div>
                </div>
                <div>
                  <p class="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4 ml-1">
                    Select Time
                  </p>
                  <div class="min-h-[250px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <BookingTimeSlots
                      :date="selectedDate"
                      :gym_enum="selectedGym"
                      :is_private_class="selectPrivate"
                      :filter-past-time="false"
                      :allow-full-selection="true"
                      :is-admin-mode="true"
                      @select="onSelectSchedule"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 class="text-xl font-semibold">Contact Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <div class="flex items-center gap-1">
                  <span class="text-red-500">*</span>
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Name
                  </p>
                </div>
                <input
                  v-model="clientName"
                  class="w-full p-4 border rounded-xl font-medium outline-none bg-white border-gray-200 focus:ring-2 focus:ring-blue-600"
                  placeholder="Full Name"
                />
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-1">
                  <span class="text-red-500 opacity-0">*</span>
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Mobile
                  </p>
                </div>

                <input
                  v-model="mobile"
                  maxlength="10"
                  type="number"
                  class="w-full p-4 border rounded-xl font-medium outline-none bg-white border-gray-200 focus:ring-2 focus:ring-blue-600"
                  placeholder="0XXXXXXXXX"
                  @input="mobile = mobile.replace(/\D/g, '')"
                />
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-1">
                  <span class="text-red-500">*</span>
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Email
                  </p>
                </div>
                <input
                  v-model="email"
                  :disabled="isEditMode"
                  :class="[
                    'w-full p-4 border rounded-xl font-medium outline-none',
                    isEditMode
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-600',
                  ]"
                  placeholder="example@email.com"
                />
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-1">
                  <span class="text-red-500">*</span>
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Participants
                  </p>
                </div>
                <input
                  v-model.number="participants"
                  type="number"
                  min="1"
                  max="5"
                  class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <!-- ✅ MULTIPLE STUDENTS -->
              <div v-if="selectPrivate" class="space-y-2">
                <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                  Multiple Students
                </p>
                <div class="flex items-center gap-6 p-4 border border-gray-200 rounded-xl">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      :value="true"
                      v-model="multipleStudents"
                      class="w-5 h-5 accent-blue-600"
                    />
                    <span class="text-gray-700 font-medium">Yes</span>
                  </label>

                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      :value="false"
                      v-model="multipleStudents"
                      class="w-5 h-5 accent-blue-600"
                    />
                    <span class="text-gray-700 font-medium">No</span>
                  </label>
                </div>
              </div>

              <!-- ✅ TRAINER SELECTION -->
              <div v-if="selectPrivate" class="md:col-span-2 relative space-y-2" ref="trainerContainerRef">
                <div class="flex items-center gap-1">
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Request Trainer (Optional)
                  </p>
                </div>
                <div class="relative group">
                  <input
                    v-model="trainerSearchQuery"
                    type="text"
                    class="w-full p-4 border rounded-xl font-medium outline-none bg-white border-gray-200 focus:ring-2 focus:ring-blue-600 pr-12"
                    placeholder="Search and select trainer..."
                    @focus="showTrainerDropdown = true"
                  />
                  <button
                    @click="showTrainerDropdown = !showTrainerDropdown"
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-transform"
                    :class="{ 'rotate-180': showTrainerDropdown }"
                  >
                    ▼
                  </button>
                </div>

                <!-- Dropdown -->
                <div
                  v-if="showTrainerDropdown"
                  class="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto"
                >
                  <div
                    v-for="trainer in filteredTrainers"
                    :key="trainer.id"
                    @click="selectTrainer(trainer)"
                    class="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center transition-colors"
                  >
                    <span class="font-bold text-sm text-gray-800">{{ trainer.name }}</span>
                    <span v-if="selectedTrainerName === trainer.name" class="text-blue-500 text-xs font-bold">✓ Selected</span>
                  </div>
                  <div
                    v-if="filteredTrainers.length === 0"
                    class="p-4 text-center text-xs text-gray-400 italic"
                  >
                    No matches found.
                  </div>
                </div>

                <!-- Helper Text -->
                <p
                  v-if="selectedTrainerName && !showTrainerDropdown"
                  class="text-[10px] text-blue-600 mt-1 font-semibold flex items-center gap-1"
                >
                  <span>✓</span> Currently selected: {{ selectedTrainerName }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-0 overflow-hidden">
            <div
              :class="[
                'absolute top-0 left-0 w-full h-1',
                isEditMode ? 'bg-blue-600' : 'bg-green-600',
              ]"
            ></div>
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
              <span>ℹ️</span> {{ isEditMode ? 'Edit Summary' : 'New Summary' }}
            </h2>

            <div class="space-y-6">
              <div class="border-b border-gray-50 pb-4">
                <p class="text-gray-400 text-[10px] font-black uppercase mb-1">Place</p>
                <p class="text-gray-900 font-bold">{{ gymLabel }}</p>
              </div>
              <div class="border-b border-gray-50 pb-4">
                <p class="text-gray-400 text-[10px] font-black uppercase mb-1">Date & Time</p>
                <p class="text-gray-900 font-bold">{{ displayDate }}</p>
                <p v-if="selectedSchedule" class="text-blue-600 text-sm font-black mt-1">
                  {{ displayTime }}
                </p>
              </div>

              <div class="flex flex-col gap-3 pt-4 border-t border-gray-50">
                <button
                  class="w-full text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  :class="
                    isEditMode
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                      : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                  "
                  :disabled="isSubmitting || !selectedSchedule"
                  @click="handleSubmit"
                >
                  <span
                    v-if="isSubmitting"
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  ></span>
                  {{
                    isSubmitting
                      ? 'Processing...'
                      : isEditMode
                        ? 'Update Booking'
                        : 'Create Booking'
                  }}
                </button>
                <button
                  class="w-full bg-gray-100 text-gray-500 py-3 rounded-xl text-xs font-bold hover:bg-gray-200"
                  @click="$emit('close')"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { api } from '@/api/bookingApi'
import { useSchedules } from '@/composables/useSchedules'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'
import BookingCalender from '@/components/ฺbooking/BookingCalender.vue'
import BookingTimeSlots from '@/components/ฺbooking/BookingTimeSlots.vue'

const props = defineProps({
  show: Boolean,
  bookingId: [String, Number], // null = Add Mode, has ID = Edit Mode
  onUpdated: Function,
})

const emit = defineEmits(['close', 'updated'])
const { fetchSchedules } = useSchedules()

// Form State
const selectedGym = ref('STING_HIVE')
const selectedDate = ref(new Date().toLocaleDateString('en-CA')) // YYYY-MM-DD in Local Time
const selectedSchedule = ref(null)
const selectPrivate = ref(false)
const clientName = ref('')
const mobile = ref('')
const email = ref('')
const participants = ref(1)
const trainerContainerRef = ref(null)

// Trainer selection
const trainers = ref([])
const trainerSearchQuery = ref('')
const selectedTrainerName = ref('')
const showTrainerDropdown = ref(false)

// Multiple Students
const multipleStudents = ref(false)

const filteredTrainers = computed(() => {
  const q = trainerSearchQuery.value.toLowerCase().trim()
  // Filter out users who already have a gym assigned
  const list = trainers.value.filter(trainer => {
    return !trainer.gym_id && !trainer.gym_enum
  })
  if (!q) return list
  return list.filter((t) => t.name.toLowerCase().includes(q))
})

const fetchTrainers = async () => {
  try {
    const response = await api.bookings.getTrainers()
    const actualData = response.data.data || response.data
    if (Array.isArray(actualData)) {
      trainers.value = actualData.map((item) => {
        const raw = item.dataValues || item
        return {
          id: raw.id,
          name: raw.name || raw.username || (typeof raw === 'string' ? raw : ''),
          gym_id: raw.gym_id,
          gym_enum: raw.gym_enum,
        }
      })
    }
  } catch (err) {
    console.error('❌ Fetch Trainers Error:', err)
  }
}

const selectTrainer = (trainer) => {
  selectedTrainerName.value = trainer.name
  trainerSearchQuery.value = trainer.name
  showTrainerDropdown.value = false
}

const isInitialLoading = ref(false)
const isSubmitting = ref(false)

// Mode Indicator
const isEditMode = computed(() => !!props.bookingId)

const modalStore = useModalStore()

// Helper Computeds
const gymLabel = computed(() => (selectedGym.value === 'STING_CLUB' ? 'Sting Club' : 'Sting Hive'))
const displayDate = computed(() =>
  selectedDate.value
    ? new Date(selectedDate.value).toLocaleDateString('en-EN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '-',
)
const displayTime = computed(() => {
  if (!selectedSchedule.value) return '-'
  return `${selectedSchedule.value.start_time?.slice(0, 5)} - ${selectedSchedule.value.end_time?.slice(0, 5)}`
})

const resetForm = () => {
  selectedGym.value = 'STING_HIVE'
  selectedDate.value = new Date().toISOString().split('T')[0]
  selectedSchedule.value = null
  selectPrivate.value = false
  clientName.value = ''
  mobile.value = ''
  email.value = ''
  participants.value = 1
  trainerSearchQuery.value = ''
  selectedTrainerName.value = ''
  multipleStudents.value = false
}

const fetchBookingDetail = async (id) => {
  try {
    isInitialLoading.value = true
    const res = await api.bookings.get({ classes_booking_id: id })
    const b = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data
    if (!b) return openStatus('Error', 'Booking not found', 'error')

    selectedGym.value = b.schedule.gym_enum
    selectedDate.value = b.date_booking
    selectPrivate.value = b.is_private
    clientName.value = b.client_name
    mobile.value = b.client_phone
    email.value = b.client_email
    participants.value = b.capacity
    multipleStudents.value = b.multiple_students || false

    const tName = b.trainer_name || (typeof b.trainer === 'string' ? b.trainer : b.trainer?.name) || ''
    selectedTrainerName.value = tName
    trainerSearchQuery.value = tName

    selectedSchedule.value = {
      id: b.classes_schedule_id,
      start_time: b.schedule.start_time,
      end_time: b.schedule.end_time,
    }
  } catch (err) {
    console.error(err)
    openStatus('Error', 'Failed to load booking details', 'error')
  } finally {
    isInitialLoading.value = false
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

const handleSubmit = async () => {
  if (!selectedSchedule.value) return

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
    multiple_students: selectPrivate.value ? multipleStudents.value : false,
  }

  try {
    isSubmitting.value = true
    if (isEditMode.value) {
      await api.bookings.update(props.bookingId, payload)
      openStatus('Success', 'Booking updated successfully!', 'success')
    } else {
      await api.bookings.create(payload) // axios.post('/api/v1/bookings', payload)
      openStatus('Success', 'New booking created successfully!', 'success')
    }
  } catch (err) {
    openStatus('Error', err.response?.data?.message || 'Operation failed', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const onSelectSchedule = (payload) => {
  selectedSchedule.value = payload
}
const handleSuccessDone = () => {
  if (props.onUpdated) props.onUpdated()
  else emit('updated')

  // Close ALL modals safely
  modalStore.closeAll()
}

const handleCancel = () => {
  emit('close') // เมื่อเรียกตัวนี้ @close ใน GlobalModalLoader จะทำงานเอง
}

const openStatus = (title, message, type = 'success') => {
  modalStore.open(StatusModal, {
    title,
    message,
    type,
    onSuccess: type === 'success' ? handleSuccessDone : undefined,
  })
}

// Watchers
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      init()
    }
  },
)

watch([selectedDate, selectPrivate, selectedGym], () => {
  if (selectedDate.value && selectedGym.value) {
    fetchSchedules({
      date: selectedDate.value,
      gym_enum: selectedGym.value,
      is_private_class: selectPrivate.value,
    })
  }
})

const init = () => {
  fetchTrainers()
  if (isEditMode.value) fetchBookingDetail(props.bookingId)
  else resetForm()
}

const handleClickOutside = (e) => {
  if (trainerContainerRef.value && !trainerContainerRef.value.contains(e.target)) {
    showTrainerDropdown.value = false
  }
}

onMounted(() => {
  init()
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('touchstart', handleClickOutside)
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8f8f8;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}
.calendar-wrapper :deep(.vc-container) {
  border: none !important;
  background-color: transparent !important;
}
</style>
