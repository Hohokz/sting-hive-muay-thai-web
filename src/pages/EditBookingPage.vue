<template>
  <div class="w-full min-h-screen p-6 pb-20">
    <!-- Language Switcher -->
    <div class="max-w-6xl mx-auto mb-6 flex justify-end">
      <LanguageSwitcher />
    </div>

    <div
      v-if="isInitialLoading"
      class="max-w-4xl mx-auto bg-white rounded-xl shadow p-12 text-center"
    >
      <div
        class="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-gray-500 font-medium">{{ t('edit.loading') }}</p>
    </div>

    <div v-else class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Read-only Alert -->
      <div
        v-if="isReadOnly"
        class="lg:col-span-3 bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3"
      >
        <span class="text-2xl">⚠️</span>
        <div>
          <h3 class="font-bold text-red-800">{{ t('edit.read_only_title', { status: bookingStatus }) }}</h3>
          <p class="text-red-600 text-sm">
            {{ t('edit.read_only_msg') }}
          </p>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-4">{{ t('booking.select_place') }}</h2>
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
              <span>{{ t('booking.sting_club') }}</span>
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
              <span>{{ t('booking.sting_hive') }}</span>
            </label>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-6 pb-8 space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-4">{{ t('booking.class_type') }}</h3>
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
              <span>{{ t('booking.group_class') }}</span>
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
              <span>{{ t('booking.private_class') }}</span>
            </label>
          </div>

          <h2 class="text-xl font-semibold mb-4">{{ t('booking.select_slot') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div class="calendar-wrapper">
              <p class="text-gray-600 text-sm mb-2">{{ t('booking.select_date') }}</p>
              <BookingCalender v-model="selectedDate" :disabled="isReadOnly" />
            </div>

            <div>
              <p class="text-gray-600 text-sm mb-5">{{ t('booking.select_time') }}</p>
              <BookingTimeSlots
                :date="selectedDate"
                :gym_enum="selectedGym"
                :is_private_class="selectPrivate"
                :filter-past-time="true"
                :disabled="isReadOnly"
                @select="onSelectSchedule"
                @loading="isSlotsLoading = $event"
              />
              <span v-if="!selectedGym" class="text-sm text-red-500">
                {{ t('booking.please_select_place') }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 class="text-xl font-semibold mb-4">{{ t('booking.contact_info') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">{{ t('booking.name') }}</p>
              </div>
              <input
                v-model="clientName"
                class="w-full p-3 border rounded-md"
                :placeholder="t('booking.enter_name')"
                :disabled="isReadOnly"
              />
            </div>
            <div>
              <p class="text-gray-600 text-sm mb-1">{{ t('booking.mobile') }}</p>
              <input
                v-model="mobile"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full p-3 border rounded-md"
                :placeholder="t('booking.enter_mobile')"
                maxlength="10"
                :disabled="isReadOnly"
                @input="mobile = mobile.replace(/\D/g, '')"
              />
            </div>
            <div>
              <div class="flex items-center gap-1">
                <span class="text-red-500">*</span>
                <p class="text-gray-600 text-sm mb-1">{{ t('booking.email') }}</p>
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
                <p class="text-gray-600 text-sm mb-1">{{ t('booking.participants') }}</p>
              </div>
              <input
                v-model.number="participants"
                type="number"
                class="w-full p-3 border rounded-md"
                :placeholder="t('booking.max_people')"
                min="1"
                max="5"
                :disabled="isReadOnly"
                @input="handleParticipantsInput"
                @blur="handleParticipantsBlur"
              />
            </div>

            <!-- ✅ MULTIPLE STUDENTS -->
            <div v-if="selectPrivate">
              <p class="text-gray-600 text-sm mb-1">{{ t('booking.multiple_students') }}</p>
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
                  <span>{{ t('edit.yes') }}</span>
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
                  <span>{{ t('edit.no') }}</span>
                </label>
              </div>
            </div>

            <!-- ✅ TRAINER (Optional) -->
            <div v-if="selectPrivate" class="md:col-span-2 relative trainer-select-container">
              <p class="text-gray-600 text-sm mb-1">{{ t('booking.request_trainer') }}</p>
              <div class="relative group">
                <input
                  v-model="trainerSearchQuery"
                  type="text"
                  class="w-full p-3 border rounded-md pr-10"
                  :placeholder="t('booking.search_trainer')"
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
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow p-6 h-fit">
          <h2 class="text-lg font-semibold mb-4">{{ t('edit.summary_title') }}</h2>

          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">{{ t('booking.place') }}</p>
            <p class="text-sm">{{ gymLabel }}</p>
          </div>

          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">{{ t('booking.date_time') }}</p>
            <p v-if="!selectedDate || !selectedSchedule" class="text-sm mt-1">-</p>
            <p v-else class="text-sm mt-1">{{ displayDate }} - {{ displayTime }}</p>
          </div>

          <div class="border-b pb-4 mb-6">
            <p class="text-gray-700 font-medium mb-2">{{ t('edit.booking_info') }}</p>
            <div class="text-sm space-y-1">
              <p>
                <span class="text-gray-500">{{ t('booking.name') }}:</span> <span class="ml-1">{{ clientName }}</span>
              </p>
              <p>
                <span class="text-gray-500">{{ t('booking.participants') }}:</span>
                <span class="ml-1">{{ participants }}</span>
              </p>
              <p>
                <span class="text-gray-500">{{ t('edit.type') }}:</span>
                <span class="ml-1">{{ selectPrivate ? t('edit.private') : t('edit.group') }}</span>
              </p>
              <p>
                <span class="text-gray-500">{{ t('edit.trainer') }}:</span>
                <span class="ml-1">{{
                  selectPrivate && selectedTrainerName ? selectedTrainerName : '-'
                }}</span>
              </p>
              <p v-if="selectPrivate">
                <span class="text-gray-500">{{ t('edit.type_students') }}:</span>
                <span class="ml-1">{{ multipleStudents ? '2v1' : '1v1' }}</span>
              </p>
              <p>
                <span class="text-gray-500">{{ t('edit.status') }}:</span>
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
              :disabled="isSubmitting || isReadOnly || isSlotsLoading"
              @click="updateBooking"
            >
              <span v-if="!isSubmitting">{{ t('edit.update_btn') }}</span>
              <span v-else>{{ t('edit.updating') }}</span>
            </button>
            <button
              class="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
              :disabled="isSubmitting || isReadOnly"
              @click="confirmCancel"
            >
              {{ t('edit.cancel_btn') }}
            </button>
            <button
              class="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold"
              @click="resetAll"
            >
              {{ t('edit.back_btn') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="isSubmitting"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[90]"
    style="-webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px)"
  >
    <div class="bg-white px-6 py-4 rounded-xl shadow text-lg font-semibold">
      {{ t('edit.updating') }}
    </div>
  </div>

  <div v-if="showStatusModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm"
      style="-webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px)"
      @click="handleModalClose"
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
        {{ t('booking.ok') }}
      </button>
    </div>
  </div>

  <div v-if="showCancelConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm"
      style="-webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px)"
      @click="showCancelConfirm = false"
    ></div>
    <div
      class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fadeIn"
    >
      <div class="text-3xl mb-4">🗑️</div>
      <h3 class="text-xl font-bold mb-2">{{ t('edit.cancel_confirm_title') }}</h3>
      <p class="text-gray-500 mb-6">
        {{ t('edit.cancel_confirm_msg') }}
      </p>

      <div class="flex gap-3">
        <button
          @click="showCancelConfirm = false"
          class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold"
        >
          {{ t('edit.keep_it') }}
        </button>
        <button
          @click="handleConfirmCancel"
          class="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold"
        >
          {{ t('edit.yes_cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/api/bookingApi'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import BookingCalender from '@/components/ฺbooking/BookingCalender.vue'
import BookingTimeSlots from '@/components/ฺbooking/BookingTimeSlots.vue'
import trainerGymApi from '@/api/trainerGymApi'
import { safeNewDate } from '@/utils/dateUtils'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const bookingId = route.params.id
const isSubmitting = ref(false)
const isSlotsLoading = ref(false)
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
  if (selectedTrainerName.value === trainerSearchQuery.value && q !== '') {
    return trainers.value
  }
  if (!q) return trainers.value
  return trainers.value.filter((t) => t.name.toLowerCase().includes(q))
})

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
    const gymId =
      selectedGym.value === 'STING_CLUB' ? 1 : selectedGym.value === 'STING_HIVE' ? 2 : null
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

const gymLabel = computed(() => {
  if (selectedGym.value === 'STING_CLUB') return t('booking.sting_club')
  if (selectedGym.value === 'STING_HIVE') return t('booking.sting_hive')
  return '-'
})

const displayDate = computed(() => {
  if (!selectedDate.value) return '-'
  const d = safeNewDate(selectedDate.value)
  if (!d) return '-'
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
      openStatusModal(t('edit.update_failed'), t('edit.update_failed_msg'), 'error')
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
    const tName = b.trainer_name || (typeof b.trainer === 'string' ? b.trainer : b.trainer?.name) || ''
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
        t('booking.incomplete_info'),
        t('edit.read_only_title', { status: bookingStatus.value }),
        'warning',
      )
    }
  } catch {
    openStatusModal(t('edit.update_failed'), t('edit.update_failed_msg'), 'error')
  } finally {
    isInitialLoading.value = false
  }
}

onMounted(() => {
  fetchBookingDetail()
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch([selectedGym, selectedDate, selectedSchedule, selectPrivate], () => {
  fetchTrainers()
})

watch(isSlotsLoading, (loading) => {
  if (loading) {
    selectedSchedule.value = null
    selectedTrainerName.value = ''
    trainerSearchQuery.value = ''
  }
})

const updateBooking = async () => {
  if (isSubmitting.value) return

  if (!selectedSchedule.value) {
    openStatusModal(t('booking.incomplete_info'), t('booking.select_time'), 'warning')
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
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    await api.bookings.update(bookingId, payload)
    isSubmitting.value = false
    openStatusModal(t('edit.update_success'), t('edit.update_success_msg'), 'success', true)
  } catch {
    isSubmitting.value = false
    openStatusModal(t('edit.update_failed'), t('edit.update_failed_msg'), 'error')
  }
}

const handleConfirmCancel = async () => {
  if (isSubmitting.value) return
  showCancelConfirm.value = false

  try {
    isSubmitting.value = true
    await api.bookings.cancel(bookingId)
    openStatusModal(t('edit.cancel_success'), t('edit.cancel_success_msg'), 'success', true)
  } catch (err) {
    console.error(err)
    openStatusModal(t('edit.cancel_failed'), t('edit.cancel_failed_msg'), 'error')
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
