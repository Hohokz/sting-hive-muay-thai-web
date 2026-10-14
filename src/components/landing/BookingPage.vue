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
              <BookingCalender v-model="selectedDate" :disabled-dates="closedDates" />
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
            <div v-if="!selectPrivate">
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
                :max="maxStudents"
                @input="handleParticipantsInput"
                @blur="handleParticipantsBlur"
              />
            </div>

            <!-- ✅ PRIVATE: TRAINERS & STUDENTS (popup) -->
            <div v-else>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">{{ t('booking.private_setup') }}</p>
              </div>
              <button
                type="button"
                :disabled="!selectedSchedule"
                @click="openPrivateSetup"
                class="w-full p-3 border rounded-md flex justify-between items-center text-left transition-colors enabled:hover:border-blue-600 enabled:hover:bg-blue-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <span>{{
                  t('booking.private_setup_summary', {
                    trainers: trainerCount,
                    students: participants,
                  })
                }}</span>
                <span class="text-blue-600 text-sm font-semibold">{{
                  t('booking.edit_private_setup')
                }}</span>
              </button>
              <p v-if="!selectedSchedule" class="text-red-500 text-xs mt-1">
                {{ t('booking.select_time_first') }}
              </p>
              <p
                v-else-if="selectedTrainerNames.length"
                class="text-[10px] text-blue-600 mt-1 font-semibold"
              >
                ✓ {{ t('booking.currently_selected') }}: {{ selectedTrainerNames.join(', ') }}
              </p>
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
                  selectPrivate && selectedTrainerNames.length
                    ? selectedTrainerNames.join(', ')
                    : '-'
                }}</span>
              </p>
              <p v-if="selectPrivate">
                <span class="text-gray-500">{{ t('booking.trainer_count') }}:</span>
                <span class="ml-1">{{ trainerCount }}</span>
              </p>
            </div>
          </div>

          <button
            class="w-full bg-[#E84545] text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
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
            class="w-full bg-[#E84545] text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
            @click="goToFindBooking"
          >
            <span>{{ t('booking.find_btn') }}</span>
          </button>
        </div>
      </div>
    </div>
    <PrivateClassSetupDialog
      :open="showPrivateSetup"
      :students="participants"
      :trainer-count="trainerCount"
      :selected-trainers="selectedTrainers"
      :trainer-options="trainers"
      :max-students="maxStudents"
      :seats-left="selectedSchedule ? maxStudents : null"
      :can-pick-trainers="!!selectedSchedule"
      @close="showPrivateSetup = false"
      @confirm="confirmPrivateSetup"
    />

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
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import BookingCalender from '@/components/booking/BookingCalender.vue'
import BookingTimeSlots from '@/components/booking/BookingTimeSlots.vue'
import { api } from '@/api/bookingApi'
import trainerGymApi from '@/api/trainerGymApi'
import { safeNewDate } from '@/utils/dateUtils'
import { useGymClosedDates } from '@/composables/useGymClosedDates'
import PrivateClassSetupDialog from '@/components/booking/PrivateClassSetupDialog.vue'
import {
  clampTrainers,
  maxStudentsForSeats,
  normalizeStudents,
  normalizeTrainers,
  privateBookingFields,
  pruneTrainerSlots,
  resizeTrainerSlots,
} from '@/utils/privateClassSetup'

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
const { closedDates } = useGymClosedDates(selectedGym)

// Switching gym (or closures loading) can land the picked date on a closed day
watch(closedDates, (dates) => {
  if (selectedDate.value && dates.includes(selectedDate.value)) selectedDate.value = null
})
const selectPrivate = ref(false)
const mobile = ref('')
const email = ref('')
const clientName = ref('')
const participants = ref(1)

// Students can't exceed the seats left in the chosen slot
const maxStudents = computed(() => maxStudentsForSeats(selectedSchedule.value?.available_seats))

const trainers = ref([])
const trainerCount = ref(1)
const selectedTrainers = ref([''])
const selectedTrainerNames = computed(() => selectedTrainers.value.filter(Boolean))

const showPrivateSetup = ref(false)

// Seats and trainers depend on the class time, so it must be picked first
const openPrivateSetup = () => {
  if (!selectedSchedule.value) return
  showPrivateSetup.value = true
}

const confirmPrivateSetup = ({ students, trainerCount: count, trainers: picked }) => {
  participants.value = students
  trainerCount.value = count
  selectedTrainers.value = picked
  showPrivateSetup.value = false
}

const resetSelectedTrainers = () => {
  selectedTrainers.value = resizeTrainerSlots([], trainerCount.value)
}

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

    const response = await trainerGymApi.getPublicGymTrainers(gymId, params)
    const responseData = response.data
    const actualData = Array.isArray(responseData) ? responseData : responseData.data || []

    trainers.value = normalizeTrainers(
      actualData.map((item) => {
        const raw = item.dataValues || item
        return {
          id: raw.id,
          name: raw.name || raw.username || (typeof raw === 'string' ? raw : ''),
        }
      }),
    )
  } catch (err) {
    console.error('❌ Fetch Trainers Error:', err)
    trainers.value = []
  }
}

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
  trainerCount.value = 1
  resetSelectedTrainers()
  selectedSchedule.value = null
  selectedDate.value = null
  selectedGym.value = null
  selectPrivate.value = false
}

const handleParticipantsInput = () => {
  // Leave an emptied field alone while typing; blur fills it back in
  if (participants.value === '') return
  participants.value = normalizeStudents(participants.value, maxStudents.value)
}

const handleParticipantsBlur = () => {
  participants.value = normalizeStudents(participants.value, maxStudents.value)
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

  if (
    !Number.isInteger(participants.value) ||
    participants.value < 1 ||
    participants.value > maxStudents.value
  ) {
    openModal(
      t('booking.incomplete_info'),
      t('booking.please_enter_participants', { max: maxStudents.value }),
      'warning',
    )
    return
  }

  if (!clientName.value || !clientName.value.trim()) {
    openModal(t('booking.incomplete_info'), t('booking.please_enter_name'), 'warning')
    return
  }

  if (!email.value || !email.value.trim()) {
    openModal(t('booking.incomplete_info'), t('booking.please_enter_email'), 'warning')
    return
  }

  if (!email.value.includes('@')) {
    openModal(t('booking.incomplete_info'), t('booking.invalid_email'), 'warning')
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
    ...(selectPrivate.value
      ? privateBookingFields(participants.value, trainerCount.value, selectedTrainers.value)
      : { trainer: null, multiple_students: false }),
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
    resetSelectedTrainers()
  }
})

// Keep students within the slot's seats and the trainer count valid for them
watch([selectPrivate, maxStudents], ([isPrivate]) => {
  participants.value = normalizeStudents(participants.value, maxStudents.value)
  if (!isPrivate) return
  trainerCount.value = clampTrainers(trainerCount.value, participants.value)
  selectedTrainers.value = resizeTrainerSlots(selectedTrainers.value, trainerCount.value)
})

// A refetched list may no longer offer a trainer picked earlier
watch(trainers, (list) => {
  selectedTrainers.value = pruneTrainerSlots(selectedTrainers.value, list)
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
