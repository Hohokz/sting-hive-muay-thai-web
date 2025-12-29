<template>
  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
    <!-- Overlay/Backdrop managed by GlobalModalLoader or local -->
    <!-- Since GlobalModalLoader has its own backdrop, we might not need this inner backdrop if we want to rely on the global one.
         However, GlobalModalLoader renders component inside a div.
         If we want this component to LOOK like a modal, it should probably be just the modal CONTENT, and GlobalModalLoader handles the centering and overlay.
         BUT, existing GlobalModalLoader implementation loops components and renders them. It puts a SINGLE backdrop behind ALL of them?
         No, GlobalModalLoader code:
         <div v-if="modalStore.stack.length > 0" ...>
           <div class="absolute inset-0 bg-black/60 ..." @click="handleBackdropClick"></div>
           <div v-for="..."> <component ... /> </div>
         </div>
         So GlobalModalLoader provides the backdrop and centering container?
         Actually GlobalModalLoader has `flex items-center justify-center`.
         So the component should just be the card itself.
    -->
    <div
      class="relative bg-gray-50 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-fadeIn"
      @click.stop
    >
      <div class="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center text-white text-xl',
              isEditMode ? 'bg-blue-600' : 'bg-green-600',
            ]"
          >
            {{ isEditMode ? '✎' : '➕' }}
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 leading-tight">
              {{ isEditMode ? 'Edit Booking' : 'Add New Booking' }}
            </h3>
            <p class="text-sm text-gray-400 font-medium">
              {{ isEditMode ? 'Modify reservation details' : 'Create a new client reservation' }}
            </p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-black transition-colors p-2"
        >
          <span class="text-2xl">✖</span>
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
                  <span class="text-gray-700 font-medium group-hover:text-blue-600"
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
                  <span class="text-gray-700 font-medium group-hover:text-blue-600"
                    >Sting Hive</span
                  >
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
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Name
                  </p>
                  <input
                    v-model="clientName"
                    :disabled="isEditMode"
                    :class="[
                      'w-full p-4 border rounded-xl font-medium outline-none',
                      isEditMode
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-600',
                    ]"
                    placeholder="Full Name"
                  />
                </div>
                <div class="space-y-2">
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Mobile
                  </p>
                  <input
                    v-model="mobile"
                    maxlength="10"
                    class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="0XXXXXXXXX"
                    @input="mobile = mobile.replace(/\D/g, '')"
                  />
                </div>
                <div class="space-y-2">
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Email
                  </p>
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
                  <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Participants
                  </p>
                  <input
                    v-model.number="participants"
                    type="number"
                    min="1"
                    class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-600"
                  />
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '@/api/bookingApi'
import { useSchedules } from '@/composables/useSchedules'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'
import BookingCalender from '@/components/ฺbooking/BookingCalender.vue'
import BookingTimeSlots from '@/components/ฺbooking/BookingTimeSlots.vue'

const props = defineProps({
  show: Boolean,
  bookingId: [String, Number], // null = Add Mode, has ID = Edit Mode
})

const emit = defineEmits(['close', 'updated'])
const { fetchSchedules } = useSchedules()

// Form State
const selectedGym = ref('STING_HIVE')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedSchedule = ref(null)
const selectPrivate = ref(false)
const clientName = ref('')
const mobile = ref('')
const email = ref('')
const participants = ref(1)

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
    date_booking: selectedDate.value,
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
const openStatus = (title, message, type = 'success') => {
  modalStore.open(StatusModal, {
    title,
    message,
    type,
    onSuccess: type === 'success' ? handleSuccessDone : undefined,
  })
}

const handleSuccessDone = () => {
  emit('updated')
  emit('close')
}

// Watchers
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) fetchBookingDetail(props.bookingId)
      else resetForm()
    }
  },
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
.calendar-wrapper :deep(.vc-container) {
  border: none !important;
  background-color: transparent !important;
}
</style>
