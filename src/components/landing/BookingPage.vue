<template>
  <div class="w-full min-h-screen p-6 pb-20">
    <!-- Language Switcher -->
    <div class="max-w-6xl mx-auto mb-6 flex justify-end">
      <LanguageSwitcher />
    </div>

    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT CONTENT -->
      <div class="lg:col-span-2 space-y-6">
        <!-- ✅ SELECT GYM -->
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-4">{{ t('booking.select_place') }}</h2>

          <div class="flex justify-around items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="STING_CLUB"
                v-model="selectedGym"
                class="accent-blue-600"
              />
              <span>{{ t('booking.sting_club') }}</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="STING_HIVE"
                v-model="selectedGym"
                class="accent-blue-600"
              />
              <span>{{ t('booking.sting_hive') }}</span>
            </label>
          </div>
        </div>

        <!-- ✅ SELECT A SLOT -->
        <div class="bg-white rounded-xl shadow p-6 pb-8 space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-4">{{ t('booking.class_type') }}</h3>
          </div>
          <div class="flex justify-around items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" :value="false" v-model="selectPrivate" class="accent-blue-600" />
              <span>{{ t('booking.group_class') }}</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" :value="true" v-model="selectPrivate" class="accent-blue-600" />
              <span>{{ t('booking.private_class') }}</span>
            </label>
          </div>
          <h2 class="text-xl font-semibold mb-4">{{ t('booking.select_slot') }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <!-- DATE -->
            <div class="calendar-wrapper">
              <p class="text-gray-600 text-sm mb-2">{{ t('booking.select_date') }}</p>
              <BookingCalender v-model="selectedDate" />
            </div>

            <!-- TIME -->
            <div>
              <p class="text-gray-600 text-sm mb-5">{{ t('booking.select_time') }}</p>

              <BookingTimeSlots
                :date="selectedDate"
                :gym_enum="selectedGym"
                :is_private_class="selectPrivate"
                :filter-past-time="true"
                @select="onSelectSchedule"
                @loading="isSlotsLoading = $event"
              />
            </div>
          </div>
        </div>
        <!-- ✅ CONTACT INFO -->
        <div class="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 class="text-xl font-semibold mb-4">{{ t('booking.contact_info') }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- NAME  -->
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">{{ t('booking.name') }}</p>
              </div>

              <input
                v-model="clientName"
                type="text"
                class="w-full p-3 border rounded-md"
                :placeholder="t('booking.enter_name')"
              />
            </div>
            <!-- ✅ MOBILE -->
            <div>
              <p class="text-gray-600 text-sm mb-1">{{ t('booking.mobile') }}</p>
              <input
                v-model="mobile"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full p-3 border rounded-md"
                :placeholder="t('booking.enter_mobile')"
                maxlength="10"
                @input="mobile = mobile.replace(/\D/g, '')"
              />
            </div>

            <!-- ✅ EMAIL -->
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">{{ t('booking.email') }}</p>
              </div>
              <input
                v-model="email"
                type="email"
                class="w-full p-3 border rounded-md"
                :placeholder="t('booking.enter_email')"
              />
              <p v-if="email && !email.includes('@')" class="text-red-500 text-xs mt-1">
                {{ t('booking.invalid_email') }}
              </p>
            </div>
            <!-- ✅ Person -->
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">{{ t('booking.participants') }}</p>
              </div>
              <input
                v-model.number="participants"
                type="number"
                class="w-full p-3 border rounded-md"
                :placeholder="t('booking.max_people')"
                min="1"
                max="5"
                @input="handleParticipantsInput"
                @blur="handleParticipantsBlur"
              />
            </div>

            <!-- ✅ TRAINER (Optional) -->
            <div v-if="selectPrivate" class="md:col-span-1 relative trainer-select-container">
              <p class="text-gray-600 text-sm mb-1">{{ t('booking.request_trainer') }}</p>
              <div class="relative group">
                <input
                  v-model="trainerSearchQuery"
                  type="text"
                  class="w-full p-3 border rounded-md pr-10"
                  :placeholder="t('booking.search_trainer')"
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
                  {{ t('booking.no_trainers') }}
                </div>
              </div>

              <!-- Selected Trainer Info (Helper Text) -->
              <p
                v-if="selectedTrainerName && !showTrainerDropdown"
                class="text-[10px] text-blue-600 mt-1 font-semibold"
              >
                ✓ {{ t('booking.currently_selected') }}: {{ selectedTrainerName }}
              </p>
            </div>

            <!-- ✅ MULTIPLE STUDENTS -->
            <div v-if="selectPrivate" class="md:col-span-1">
              <p class="text-gray-600 text-sm mb-1">{{ t('booking.multiple_students') }}</p>
              <div class="flex items-center gap-6 p-3 border rounded-md">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    :value="true"
                    v-model="multipleStudents"
                    class="accent-blue-600"
                  />
                  <span>2v1</span>
                </label>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    :value="false"
                    v-model="multipleStudents"
                    class="accent-blue-600"
                  />
                  <span>1v1</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ RIGHT SUMMARY -->
      <div>
        <div class="bg-white rounded-xl shadow p-6 h-fit">
          <h2 class="text-lg font-semibold mb-4">{{ t('booking.summary') }}</h2>

          <!-- ✅ PLACE -->
          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">{{ t('booking.place') }}</p>
            <p class="text-sm">{{ gymLabel }}</p>
          </div>

          <!-- ✅ DATE & TIME -->
          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">{{ t('booking.date_time') }}</p>
            <p v-if="!selectedDate || !selectedSchedule" class="text-sm mt-1">-</p>
            <p v-else class="text-sm mt-1">{{ displayDate }} - {{ displayTime }}</p>
          </div>

          <!-- ✅ CONTACT INFO SUMMARY -->
          <div class="border-b pb-4">
            <p class="text-gray-700 font-medium mb-2">{{ t('booking.contact_info') }}</p>

            <div class="text-sm space-y-1">
              <p>
                <span class="text-gray-500">{{ t('booking.name') }}:</span>
                <span class="ml-1">{{ clientName || '-' }}</span>
              </p>
              <p>
                <span class="text-gray-500">{{ t('booking.mobile') }}:</span>
                <span class="ml-1">{{ mobile || '-' }}</span>
              </p>

              <p>
                <span class="text-gray-500">{{ t('booking.email') }}:</span>
                <span class="ml-1">{{ email || '-' }}</span>
              </p>
              <p>
                <span class="text-gray-500">{{ t('booking.participants') }}:</span>
                <span class="ml-1">{{ participants || '-' }}</span>
              </p>
              <p>
                <span class="text-gray-500">{{ t('booking.trainer') }}:</span>
                <span class="ml-1">{{
                  selectPrivate && selectedTrainerName ? selectedTrainerName : '-'
                }}</span>
              </p>
              <p v-if="selectPrivate">
                <span class="text-gray-500">{{ t('booking.multiple_students') }}:</span>
                <span class="ml-1">{{ multipleStudents ? '2v1' : '1v1' }}</span>
              </p>
            </div>
          </div>

          <button
            class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
            :disabled="isSubmitting || isSlotsLoading"
            @click="submitBooking"
          >
            <span v-if="!isSubmitting">{{ t('booking.proceed') }}</span>
            <span v-else>{{ t('booking.loading') }}</span>
          </button>
        </div>

        <div
          v-if="isSubmitting"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[90]"
          style="-webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px)"
        >
          <div class="bg-white px-6 py-4 rounded-xl shadow text-lg font-semibold">
            {{ t('booking.creating') }}
          </div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 h-fit mt-6">
          <h2 class="text-lg font-semibold mb-4">{{ t('booking.find_booking') }}</h2>
          <button
            class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
            @click="goToFindBooking"
          >
            <span>{{ t('booking.find_btn') }}</span>
          </button>
        </div>
      </div>
    </div>
    <!-- WARNING MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
    >
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
          {{ t('booking.ok') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import BookingCalender from '@/components/ฺbooking/BookingCalender.vue'
import BookingTimeSlots from '@/components/ฺbooking/BookingTimeSlots.vue'
import { api } from '@/api/bookingApi'
import trainerGymApi from '@/api/trainerGymApi'
import { safeNewDate } from '@/utils/dateUtils'

const router = useRouter()
const { t } = useI18n()

const goToFindBooking = () => {
  router.push('/search-booking')
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

const gymLabel = computed(() => {
  if (selectedGym.value === 'STING_CLUB') return t('booking.sting_club')
  if (selectedGym.value === 'STING_HIVE') return t('booking.sting_hive')
  return '-'
})

const displayDate = computed(() => {
  if (!selectedDate.value) return '-'

  const d = new Date(selectedDate.value)
  return d.toLocaleDateString(t('booking.select_date').includes('เลือก') ? 'th-TH' : 'en-US', {
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

// Multiple Students
const multipleStudents = ref(false)

const filteredTrainers = computed(() => {
  const q = trainerSearchQuery.value.toLowerCase().trim()
  if (selectedTrainerName.value === trainerSearchQuery.value && q !== '') {
    return trainers.value
  }
  if (!q) return trainers.value
  return trainers.value.filter((t) => t.name.toLowerCase().includes(q))
})

const getGymIdFromEnum = (gymEnum) => {
  if (gymEnum === 'STING_CLUB') return 1
  if (gymEnum === 'STING_HIVE') return 2
  return null
}

const fetchTrainers = async () => {
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
    const gymId = getGymIdFromEnum(selectedGym.value)
    if (!gymId) {
      trainers.value = []
      return
    }

    const d = safeNewDate(selectedDate.value)
    if (!d) return

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

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const onSelectSchedule = (payload) => {
  selectedSchedule.value = payload
}

const isSubmitting = ref(false)
const isSlotsLoading = ref(false)

const resetForm = () => {
  clientName.value = ''
  mobile.value = ''
  email.value = ''
  participants.value = 1
  selectedTrainerName.value = ''
  trainerSearchQuery.value = ''
  multipleStudents.value = false
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
  if (isSubmitting.value) return

  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur()
  }

  if (!selectedDate.value || !selectedSchedule.value || !selectedGym.value) {
    openModal(t('booking.incomplete_info'), t('booking.please_select'), 'warning')
    return
  }

  if (!participants.value || participants.value < 1 || participants.value > 5) {
    openModal(t('booking.incomplete_info'), t('booking.please_enter_participants'), 'warning')
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
    trainer: selectPrivate.value ? selectedTrainerName.value || null : null,
    multiple_students: selectPrivate.value ? multipleStudents.value : false,
  }

  try {
    isSubmitting.value = true
    await api.bookings.create(payload)
    isSubmitting.value = false
    openModal(t('booking.completed'), t('booking.success_msg'), 'success')
    resetForm()
  } catch (err) {
    console.error('❌ Booking failed:', err)
    isSubmitting.value = false
    openModal(t('booking.failed'), t('booking.error_msg'), 'error')
  }
}

watch(isSlotsLoading, (loading) => {
  if (loading) {
    selectedSchedule.value = null
    selectedTrainerName.value = ''
    trainerSearchQuery.value = ''
  }
})

watch([selectedGym, selectedDate, selectedSchedule, selectPrivate], () => {
  fetchTrainers()
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
