<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

      <div
        class="relative bg-gray-50 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-fadeIn"
      >
        <!-- Header -->
        <div class="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl"
            >
              ✎
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 leading-tight">Edit Booking</h3>
              <p class="text-sm text-gray-400 font-medium">Modify your reservation details</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-black transition-colors p-2"
          >
            <span class="text-2xl">✖</span>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          <div
            v-if="isInitialLoading"
            class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm"
          >
            <div
              class="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"
            ></div>
            <p class="text-gray-400 font-bold uppercase text-xs tracking-widest">
              Loading Booking Details...
            </p>
          </div>

          <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Side: Form (2/3) -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Select Place Card -->
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
                    <span
                      class="text-gray-700 font-medium group-hover:text-blue-600 transition-colors"
                      >Sting Club</span
                    >
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      value="STING_HIVE"
                      v-model="selectedGym"
                      class="w-5 h-5 accent-blue-600"
                    />
                    <span
                      class="text-gray-700 font-medium group-hover:text-blue-600 transition-colors"
                      >Sting Hive</span
                    >
                  </label>
                </div>
              </div>

              <!-- Class Type & Slot Card -->
              <div class="bg-white rounded-xl shadow-sm p-6 space-y-8">
                <div>
                  <h3 class="text-xl font-semibold mb-6">Private Class</h3>
                  <div class="flex justify-around items-center gap-6">
                    <label class="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        :value="false"
                        v-model="selectPrivate"
                        class="w-5 h-5 accent-blue-600"
                      />
                      <span
                        class="text-gray-700 font-medium group-hover:text-blue-600 transition-colors"
                        >Group Class</span
                      >
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        :value="true"
                        v-model="selectPrivate"
                        class="w-5 h-5 accent-blue-600"
                      />
                      <span
                        class="text-gray-700 font-medium group-hover:text-blue-600 transition-colors"
                        >Private Class</span
                      >
                    </label>
                  </div>
                </div>

                <div class="pt-6 border-t border-gray-50">
                  <h2 class="text-xl font-semibold mb-6">Select a Slot</h2>
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
                      <div
                        class="min-h-[250px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                      >
                        <BookingTimeSlots
                          :date="selectedDate"
                          :gym_enum="selectedGym"
                          :is_private_class="selectPrivate"
                          @select="onSelectSchedule"
                        />
                      </div>
                      <span v-if="!selectedGym" class="text-sm text-red-500 mt-4 block">
                        Please select a Place first.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contact Info Card -->
              <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h2 class="text-xl font-semibold">Contact Information</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                      Name
                    </p>
                    <input
                      v-model="clientName"
                      disabled
                      class="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div class="space-y-2">
                    <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                      Mobile Number
                    </p>
                    <input
                      v-model="mobile"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      placeholder="Enter mobile number"
                      maxlength="10"
                      @input="mobile = mobile.replace(/\D/g, '')"
                    />
                  </div>
                  <div class="space-y-2">
                    <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                      Email
                    </p>
                    <input
                      v-model="email"
                      disabled
                      class="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div class="space-y-2">
                    <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                      Participants
                    </p>
                    <input
                      v-model.number="participants"
                      type="number"
                      min="1"
                      class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Summary (1/3) -->
            <div class="space-y-6">
              <div class="bg-white rounded-xl shadow-sm p-6 sticky top-0 overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                  <span class="text-blue-600">ℹ️</span> Edit Summary
                </h2>

                <div class="space-y-6">
                  <div class="border-b border-gray-50 pb-4">
                    <p
                      class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1"
                    >
                      Place
                    </p>
                    <p class="text-gray-900 font-bold">{{ gymLabel }}</p>
                  </div>

                  <div class="border-b border-gray-50 pb-4">
                    <p
                      class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1"
                    >
                      Date & Time
                    </p>
                    <p v-if="!selectedDate || !selectedSchedule" class="text-gray-900 font-bold">
                      -
                    </p>
                    <p v-else class="text-gray-900 font-bold">{{ displayDate }}</p>
                    <p
                      v-if="selectedDate && selectedSchedule"
                      class="text-blue-600 text-sm font-black mt-1"
                    >
                      {{ displayTime }}
                    </p>
                  </div>

                  <div class="pb-6">
                    <p
                      class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-3"
                    >
                      Booking info
                    </p>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500 font-medium">Name:</span>
                        <span class="text-gray-900 font-bold">{{ clientName }}</span>
                      </div>
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500 font-medium">Participants:</span>
                        <span class="text-gray-900 font-bold">{{ participants }}</span>
                      </div>
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500 font-medium">Type:</span>
                        <span
                          class="px-2 py-0.5 rounded-full text-[10px] font-black"
                          :class="
                            selectPrivate
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          "
                        >
                          {{ selectPrivate ? 'PRIVATE' : 'GROUP' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-3 pt-4 border-t border-gray-50">
                    <button
                      class="w-full bg-blue-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      :disabled="isSubmitting || !selectedSchedule"
                      @click="handleUpdate"
                    >
                      <span
                        v-if="isSubmitting"
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      ></span>
                      {{ isSubmitting ? 'Updating...' : 'Update Booking' }}
                    </button>
                    <button
                      class="w-full bg-gray-100 text-gray-500 py-3 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
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
    </div>
  </Teleport>

  <!-- Status Modal -->
  <Teleport to="body">
    <div v-if="showStatus" class="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showStatus = false"></div>
      <div
        class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-fadeIn"
      >
        <div class="text-4xl mb-4">{{ statusType === 'success' ? '✅' : '⚠️' }}</div>
        <h3 class="text-xl font-black text-gray-900 mb-2">{{ statusTitle }}</h3>
        <p class="text-sm text-gray-500 font-medium mb-6">{{ statusMessage }}</p>
        <button
          @click="statusType === 'success' ? handleSuccessDone() : (showStatus = false)"
          class="w-full py-3 bg-black text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-black/10"
        >
          {{ statusType === 'success' ? 'DONE' : 'GOT IT' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '@/api/bookingApi'
import { useSchedules } from '@/composables/useSchedules'
import BookingCalender from '@/components/ฺbooking/BookingCalender.vue'
import BookingTimeSlots from '@/components/ฺbooking/BookingTimeSlots.vue'

const props = defineProps({
  show: Boolean,
  bookingId: [String, Number],
})

const emit = defineEmits(['close', 'updated'])

const { fetchSchedules } = useSchedules()

// Form State
const selectedGym = ref('')
const selectedDate = ref(null)
const selectedSchedule = ref(null)
const selectPrivate = ref(false)
const clientName = ref('')
const mobile = ref('')
const email = ref('')
const participants = ref(1)

const isInitialLoading = ref(false)
const isSubmitting = ref(false)

// Status Modal State
const showStatus = ref(false)
const statusTitle = ref('')
const statusMessage = ref('')
const statusType = ref('success')

const gymLabel = computed(() => {
  if (selectedGym.value === 'STING_CLUB') return 'Sting Club'
  if (selectedGym.value === 'STING_HIVE') return 'Sting Hive'
  return '-'
})

const displayDate = computed(() => {
  if (!selectedDate.value) return '-'
  return new Date(selectedDate.value).toLocaleDateString('en-EN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
})

const displayTime = computed(() => {
  if (!selectedSchedule.value) return '-'
  const start = selectedSchedule.value.start_time?.slice(0, 5)
  const end = selectedSchedule.value.end_time?.slice(0, 5)
  return `${start} - ${end}`
})

const onSelectSchedule = (payload) => {
  selectedSchedule.value = payload
}

const fetchBookingDetail = async (id) => {
  if (!id) return
  try {
    isInitialLoading.value = true
    const res = await api.bookings.get({ classes_booking_id: id })
    const b = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data

    if (!b) {
      openStatus('Error', 'Booking not found', 'error')
      return
    }

    selectedGym.value = b.schedule.gym_enum
    selectedDate.value = b.date_booking
    selectPrivate.value = b.is_private
    clientName.value = b.client_name
    mobile.value = b.client_phone
    email.value = b.client_email
    participants.value = b.capacity
    selectedSchedule.value = {
      id: b.classes_schedule_id,
      start_time: b.schedule.start_time,
      end_time: b.schedule.end_time,
    }
  } catch (err) {
    console.error('Fetch error:', err)
    openStatus('Error', 'Failed to load booking details', 'error')
  } finally {
    isInitialLoading.value = false
  }
}

const openStatus = (title, message, type = 'success') => {
  statusTitle.value = title
  statusMessage.value = message
  statusType.value = type
  showStatus.value = true
}

const handleSuccessDone = () => {
  showStatus.value = false
  emit('updated')
  emit('close')
}

const handleUpdate = async () => {
  if (!selectedSchedule.value) return

  const payload = {
    gym_enum: selectedGym.value,
    client_name: clientName.value,
    client_phone: mobile.value,
    client_email: email.value,
    capacity: participants.value,
    is_private: selectPrivate.value,
    classes_schedule_id: selectedSchedule.value.id,
    date_booking: selectedDate.value,
  }

  try {
    isSubmitting.value = true
    await api.bookings.update(props.bookingId, payload)
    openStatus('Success', 'Booking updated successfully!', 'success')
  } catch (err) {
    console.error('Update error:', err)
    openStatus('Error', err.response?.data?.message || 'Failed to update booking', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(
  () => props.bookingId,
  (newId) => {
    if (newId && props.show) {
      fetchBookingDetail(newId)
    }
  },
  { immediate: true },
)

watch([selectedDate, selectPrivate, selectedGym], () => {
  if (selectedDate.value && selectedGym.value && props.show) {
    fetchSchedules({
      date: selectedDate.value,
      gym_enum: selectedGym.value,
      is_private_class: selectPrivate.value,
    })
  }
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
}

.calendar-wrapper :deep(.vc-container) {
  border: none !important;
  background-color: transparent !important;
}
</style>
