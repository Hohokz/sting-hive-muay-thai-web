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
            class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl"
          >
            {{ isEditMode ? '✎' : '🗓️' }}
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 leading-tight">
              {{ isEditMode ? 'Edit' : 'Add' }} Schedule
            </h3>
            <p class="text-sm text-gray-400 font-medium">Manage class timing and capacity</p>
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
                    v-model="form.gym_enum"
                    class="w-5 h-5 accent-blue-600"
                  />
                  <span
                    class="text-gray-700 font-medium group-hover:text-blue-600 transition-colors"
                    >Sting Hive</span
                  >
                </label>
              </div>
            </div>

            <!-- Class Details Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 space-y-8">
              <div>
                <h3 class="text-xl font-semibold mb-6">Class Type</h3>
                <div class="flex justify-around items-center gap-6">
                  <label class="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      :value="false"
                      v-model="form.is_private_class"
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
                      v-model="form.is_private_class"
                      class="w-5 h-5 accent-blue-600"
                    />
                    <span
                      class="text-gray-700 font-medium group-hover:text-blue-600 transition-colors"
                      >Class Type</span
                    >
                  </label>
                </div>
              </div>

              <div class="pt-6 border-t border-gray-50">
                <h2 class="text-xl font-semibold mb-6">Timing & Capacity</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div class="space-y-6">
                    <div class="space-y-2">
                      <p
                        class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1"
                      >
                        Start Time
                      </p>
                      <input
                        v-model="form.start_time"
                        type="time"
                        class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      />
                    </div>
                    <div class="space-y-2">
                      <p
                        class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1"
                      >
                        End Time
                      </p>
                      <input
                        v-model="form.end_time"
                        type="time"
                        class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div class="space-y-6">
                    <div class="space-y-2">
                      <p
                        class="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1"
                      >
                        Capacity
                      </p>
                      <input
                        v-model.number="form.capacity"
                        type="number"
                        min="1"
                        class="w-full p-4 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      />
                    </div>

                    <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <input
                        type="checkbox"
                        v-model="form.is_active"
                        id="is_active_check"
                        class="w-6 h-6 accent-blue-600 rounded"
                      />
                      <label
                        for="is_active_check"
                        class="text-sm font-bold text-gray-700 cursor-pointer"
                        >Active Schedule</label
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side: Summary (1/3) -->
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-0 overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
              <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <span class="text-blue-600">ℹ️</span> Schedule Summary
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
                    Type
                  </p>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-black"
                    :class="
                      form.is_private_class
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    "
                  >
                    {{ form.is_private_class ? 'PRIVATE CLASS' : 'GROUP CLASS' }}
                  </span>
                </div>

                <div class="border-b border-gray-50 pb-4">
                  <p class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">
                    Time Range
                  </p>
                  <p v-if="!form.start_time || !form.end_time" class="text-gray-900 font-bold">-</p>
                  <p v-else class="text-gray-900 font-bold">
                    {{ form.start_time }} - {{ form.end_time }}
                  </p>
                </div>

                <div class="flex justify-between items-center text-sm pb-4">
                  <span class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em]"
                    >Capacity</span
                  >
                  <span class="text-gray-900 font-black">{{ form.capacity }} Slots</span>
                </div>

                <div class="flex flex-col gap-3 pt-4 border-t border-gray-50">
                  <button
                    class="w-full bg-blue-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    :disabled="isSubmitting"
                    @click="submitSchedule"
                  >
                    <span
                      v-if="isSubmitting"
                      class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                    {{ isSubmitting ? 'Updating...' : 'Confirm Schedule' }}
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
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/bookingApi'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'

const props = defineProps({
  schedule: Object, // null = Add, Object = Edit
})

const emit = defineEmits(['close', 'success'])
const modalStore = useModalStore()

const isEditMode = computed(() => !!props.schedule)
const isSubmitting = ref(false)

const form = ref({
  gym_enum: 'STING_HIVE',
  start_time: '',
  end_time: '',
  is_private_class: false,
  capacity: 10,
  is_active: true,
})

onMounted(() => {
  if (props.schedule) {
    // Edit mode: populate form
    form.value = {
      gym_enum: props.schedule.gym_enum,
      start_time: props.schedule.start_time?.slice(0, 5) || '',
      end_time: props.schedule.end_time?.slice(0, 5) || '',
      is_private_class: props.schedule.is_private_class,
      capacity: props.schedule.capacity_data?.capacity || 10,
      is_active: props.schedule.is_active,
    }
  }
})

const formatGym = (g) => (g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : g)

const openStatusModal = (title, message, type = 'success') => {
  modalStore.open(StatusModal, { title, message, type })
}

const submitSchedule = async () => {
  if (!form.value.start_time || !form.value.end_time) {
    openStatusModal('Error', 'Please enter both start and end times', 'error')
    return
  }

  try {
    isSubmitting.value = true
    const payload = {
      gym_enum: form.value.gym_enum,
      start_time: form.value.start_time.slice(0, 5),
      end_time: form.value.end_time.slice(0, 5),
      is_private_class: !!form.value.is_private_class,
      capacity: Number(form.value.capacity),
      is_active: !!form.value.is_active,
    }

    if (isEditMode.value) {
      await api.schedules.update(props.schedule.id, payload)
      openStatusModal('Success', 'Schedule updated successfully!')
    } else {
      await api.schedules.create(payload)
      openStatusModal('Success', 'Schedule created successfully!')
    }

    // Notify parent to refresh
    if (props.onSuccess) props.onSuccess()
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
