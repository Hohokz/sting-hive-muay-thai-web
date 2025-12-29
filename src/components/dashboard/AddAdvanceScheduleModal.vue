<template>
  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
    <div
      class="relative bg-gray-50 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-fadeIn"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl"
          >
            🗓️
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 leading-tight">
              {{ isEditMode ? 'Edit Advance Schedule' : 'Add Schedule In Advance' }}
            </h3>
            <p class="text-sm text-gray-400 font-medium">
              {{ isEditMode ? 'Update existing rule' : 'Manage future gym availability' }}
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

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Side: Form (2/3) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Place Selection Card -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-6">Select Place</h2>
              <div class="flex justify-around items-center gap-6">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    value="STING_CLUB"
                    v-model="form.gym_enum"
                    class="w-5 h-5 accent-purple-600"
                  />
                  <span
                    class="text-gray-700 font-medium group-hover:text-purple-600 transition-colors"
                    >Sting Club</span
                  >
                </label>
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    value="STING_HIVE"
                    v-model="form.gym_enum"
                    class="w-5 h-5 accent-purple-600"
                  />
                  <span
                    class="text-gray-700 font-medium group-hover:text-purple-600 transition-colors"
                    >Sting Hive</span
                  >
                </label>
              </div>
            </div>

            <!-- Schedule Details Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 space-y-8">
              <div>
                <h3 class="text-xl font-semibold mb-6">Date Range</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                      Start Date
                    </p>
                    <input
                      v-model="form.start_date"
                      type="date"
                      class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                    />
                  </div>
                  <div class="space-y-2">
                    <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                      End Date
                    </p>
                    <input
                      v-model="form.end_date"
                      type="date"
                      class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div class="pt-6 border-t border-gray-50">
                <h2 class="text-xl font-semibold mb-6">Availability</h2>
                <div class="space-y-6">
                  <!-- Close Gym Checkbox -->
                  <div
                    class="flex items-center gap-4 p-4 border-2 border-dashed rounded-2xl transition-colors"
                    :class="
                      form.is_close_gym
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200 hover:border-purple-200'
                    "
                  >
                    <input
                      type="checkbox"
                      v-model="form.is_close_gym"
                      id="close_gym_check"
                      class="w-6 h-6 accent-red-500 rounded"
                    />
                    <label for="close_gym_check" class="flex-1 cursor-pointer select-none">
                      <span
                        class="block text-lg font-bold"
                        :class="form.is_close_gym ? 'text-red-700' : 'text-gray-700'"
                      >
                        Close Gym
                      </span>
                      <span
                        class="text-sm"
                        :class="form.is_close_gym ? 'text-red-500' : 'text-gray-400'"
                      >
                        Suspend all bookings for selected dates
                      </span>
                    </label>
                  </div>

                  <!-- Schedule Slot Selection (Only if not closing gym) -->
                  <div
                    class="space-y-2"
                    :class="{ 'opacity-50 pointer-events-none': form.is_close_gym }"
                  >
                    <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                      Select Time Slot
                    </p>
                    <select
                      v-model="form.classes_schedule_id"
                      class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all bg-white"
                    >
                      <option value="" disabled>Select a class time...</option>
                      <option v-for="slot in filteredSchedules" :key="slot.id" :value="slot.id">
                        {{ slot.start_time.slice(0, 5) }} - {{ slot.end_time.slice(0, 5) }} ({{
                          slot.is_private_class ? 'Private' : 'Group'
                        }})
                      </option>
                    </select>
                    <p
                      class="text-xs text-red-400 ml-1"
                      v-if="!form.is_close_gym && !form.classes_schedule_id"
                    >
                      * Required for capacity updates
                    </p>
                  </div>

                  <!-- Capacity Information -->
                  <div
                    class="space-y-2"
                    :class="{ 'opacity-50 pointer-events-none': form.is_close_gym }"
                  >
                    <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">
                      Capacity Override
                    </p>
                    <input
                      v-model.number="form.capacity"
                      type="number"
                      min="1"
                      placeholder="Leave empty to use default"
                      class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                    />
                    <p class="text-xs text-gray-400 ml-1">* Only applicable if not closing gym</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side: Summary (1/3) -->
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-0 overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
              <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <span class="text-purple-600">ℹ️</span> Configuration Summary
              </h2>

              <div class="space-y-6">
                <div class="border-b border-gray-50 pb-4">
                  <p class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">
                    Place
                  </p>
                  <p class="text-gray-900 font-bold">{{ formatGym(form.gym_enum) }}</p>
                </div>

                <div class="border-b border-gray-50 pb-4">
                  <p class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">
                    Status
                  </p>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-black"
                    :class="
                      form.is_close_gym ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    "
                  >
                    {{ form.is_close_gym ? 'GYM CLOSED' : 'OPEN / CAPACITY UPDATE' }}
                  </span>
                </div>

                <div class="border-b border-gray-50 pb-4">
                  <p class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">
                    Date Range
                  </p>
                  <p v-if="!form.start_date || !form.end_date" class="text-gray-900 font-bold">-</p>
                  <p v-else class="text-gray-900 font-bold">
                    {{ formatDate(form.start_date) }} <br />
                    ↓ <br />
                    {{ formatDate(form.end_date) }}
                    {{ formatDate(form.end_date) }}
                  </p>
                </div>

                <div
                  class="border-b border-gray-50 pb-4"
                  v-if="!form.is_close_gym && form.classes_schedule_id"
                >
                  <p class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">
                    Selected Slot
                  </p>
                  <p class="text-gray-900 font-bold">
                    {{
                      filteredSchedules
                        .find((s) => s.id === form.classes_schedule_id)
                        ?.start_time?.slice(0, 5)
                    }}
                    -
                    {{
                      filteredSchedules
                        .find((s) => s.id === form.classes_schedule_id)
                        ?.end_time?.slice(0, 5)
                    }}
                  </p>
                </div>

                <div
                  class="flex justify-between items-center text-sm pb-4"
                  v-if="!form.is_close_gym"
                >
                  <span class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em]"
                    >New Capacity</span
                  >
                  <span class="text-gray-900 font-black"
                    >{{ form.capacity || 'Default' }} Slots</span
                  >
                </div>

                <div class="flex flex-col gap-3 pt-4 border-t border-gray-50">
                  <button
                    class="w-full bg-purple-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    :disabled="isSubmitting"
                    @click="submitAdvanceSchedule"
                  >
                    <span
                      v-if="isSubmitting"
                      class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                    {{ isSubmitting ? 'Saving...' : 'Confirm Advance Rule' }}
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api/bookingApi'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'

const props = defineProps({
  itemToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'success'])
const modalStore = useModalStore()
const isEditMode = computed(() => !!props.itemToEdit)

const isSubmitting = ref(false)
// Store all schedules to filter locally
const allSchedules = ref([])

const form = ref({
  gym_enum: 'STING_HIVE',
  start_date: '',
  end_date: '',
  capacity: 10,
  is_close_gym: false,
  classes_schedule_id: '', // New field for selecting time slot
})

onMounted(async () => {
  // Load Schedules
  try {
    const res = await api.schedules.get()
    allSchedules.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load schedules', err)
  }

  // If Edit Mode, populate form
  if (isEditMode.value && props.itemToEdit) {
    const item = props.itemToEdit
    form.value = {
      gym_enum: item.gym_enum || (item.gyms_id === 1 ? 'STING_CLUB' : 'STING_HIVE'),
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
      capacity: item.capacity,
      is_close_gym: !!item.is_close_gym,
      classes_schedule_id: item.classes_schedule_id || item.schedule_id || '',
    }
  }
})

// Filter schedules when gym selection changes
const filteredSchedules = computed(() => {
  return allSchedules.value
    .filter((s) => s.gym_enum === form.value.gym_enum && s.is_active)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
})

const formatGym = (g) => (g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : g)
const formatDate = (d) => new Date(d).toLocaleDateString('en-GB')

const openStatusModal = (title, message, type = 'success') => {
  modalStore.open(StatusModal, { title, message, type })
}

const submitAdvanceSchedule = async () => {
  if (!form.value.start_date || !form.value.end_date) {
    openStatusModal('Error', 'Please select a date range', 'error')
    return
  }

  try {
    isSubmitting.value = true
    const payload = {
      gym_enum: form.value.gym_enum,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      capacity: form.value.is_close_gym ? null : Number(form.value.capacity),
      is_close_gym: form.value.is_close_gym,
      schedule_id: form.value.is_close_gym ? null : form.value.classes_schedule_id,
      gyms_id: form.value.gym_enum === 'STING_CLUB' ? 1 : 2,
    }

    if (isEditMode.value) {
      await api.schedules.updateAdvanced(props.itemToEdit.id, payload)
      openStatusModal('Success', 'Advance schedule rule updated successfully!')
    } else {
      await api.schedules.createAdvance(payload)
      openStatusModal('Success', 'Advance schedule rule created successfully!')
    }

    // Notify parent to refresh
    emit('success')
    emit('close')
  } catch (err) {
    console.error('Submit error:', err)
    const resp = err.response?.data
    let errorMsg = 'Action failed'
    if (resp) {
      errorMsg = resp.message || resp.error || JSON.stringify(resp, null, 2)
    }
    openStatusModal('Error', errorMsg, 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>
