<template>
  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
    <div
      class="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white text-xl"
          >
            📋
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 leading-tight">Advance Schedule Rules</h3>
            <p class="text-sm text-gray-400 font-medium">View detailed gym availability rules</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-black transition-colors p-2"
        >
          <span class="text-2xl">✖</span>
        </button>
      </div>

      <!-- Filters & Content -->
      <div class="flex-1 overflow-hidden flex flex-col bg-gray-50">
        <!-- Toolbar -->
        <div class="p-4 sm:p-6 pb-2 flex flex-wrap gap-4 items-center justify-between">
          <div class="flex gap-2">
            <button
              v-for="f in filters"
              :key="f.value"
              @click="activeFilter = f.value"
              class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              :class="
                activeFilter === f.value
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              "
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 pt-2">
          <div v-if="loading" class="flex justify-center items-center h-40">
            <div
              class="w-8 h-8 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"
            ></div>
          </div>

          <div v-else-if="filteredItems.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4 opacity-20">📭</div>
            <p class="text-gray-400 font-medium">No rules found for this filter.</p>
          </div>

          <div v-else class="grid grid-cols-1 gap-4">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center gap-6"
            >
              <!-- Icon/Status -->
              <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                :class="item.is_close_gym ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'"
              >
                {{ item.is_close_gym ? '🔒' : '📶' }}
              </div>

              <!-- Main Info -->
              <div class="flex-1 text-center sm:text-left space-y-1">
                <div class="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                    :class="
                      item.is_close_gym ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    "
                  >
                    {{ item.is_close_gym ? 'Gym Closed' : 'Capacity Update' }}
                  </span>
                  <span class="text-gray-300 text-xs">•</span>
                  <span class="text-xs font-bold text-gray-500">{{
                    formatGym(item.gyms_id || item.gym_id || item.gym_enum)
                  }}</span>
                </div>

                <h4 class="text-gray-900 font-bold text-lg">
                  {{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}
                </h4>

                <p class="text-sm text-gray-500" v-if="!item.is_close_gym">
                  New Capacity: <b class="text-gray-800">{{ item.capacity }}</b> slots
                  <span v-if="getScheduleInfo(item)" class="text-xs text-gray-400 ml-1">
                    ({{ getScheduleInfo(item) }})
                  </span>
                </p>
                <p class="text-sm text-gray-500" v-else>Bookings suspended for entire duration</p>
              </div>

              <!-- Metadata & Actions -->
              <div class="flex flex-col items-end gap-2">
                <div class="text-right text-xs text-gray-400 space-y-1 hidden sm:block">
                  <p>Created: {{ formatDate(item.created_date) }}</p>
                  <p v-if="item.created_by">By: {{ item.created_by }}</p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="handleEdit(item)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    @click="handleDelete(item.id)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    🗑️
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
import AddAdvanceScheduleModal from './AddAdvanceScheduleModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import StatusModal from '@/components/common/StatusModal.vue'

// const emit = defineEmits(['close']) // emit not used in script, only template
const modalStore = useModalStore()
const loading = ref(false)
const items = ref([])
const allSchedules = ref([]) // For lookup
const activeFilter = ref('ALL')

const filters = [
  { label: 'All Rules', value: 'ALL' },
  { label: 'Gym Closures', value: 'CLOSED' },
  { label: 'Capacity Changes', value: 'CAPACITY' },
]

const fetchItems = async () => {
  try {
    loading.value = true

    // Fetch parallel: config rules + all schedules
    const [rulesRes, schedulesRes] = await Promise.all([
      api.schedules.getAdvanced(),
      api.schedules.get(),
    ])

    // Process Schedules
    allSchedules.value = schedulesRes.data.data || []

    // Process Rules
    const data = rulesRes.data.data || {}
    const closures = data.gym_closures || []
    const adjustments = data.capacity_adjustments || []

    items.value = [...closures, ...adjustments].sort((a, b) => {
      return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0)
    })
  } catch (err) {
    console.error('Failed to load data', err)
  } finally {
    loading.value = false
  }
}

const getScheduleInfo = (item) => {
  // If schedule object exists from generic include
  if (item.schedule) {
    return `${formatTime(item.schedule.start_time)} - ${formatTime(item.schedule.end_time)}`
  }

  // Look up by ID
  const scheduleId = item.schedule_id || item.classes_schedule_id
  if (!scheduleId) return ''

  const found = allSchedules.value.find((s) => s.id === scheduleId)
  if (found) {
    return `${formatTime(found.start_time)} - ${formatTime(found.end_time)}`
  }

  return ''
}

const handleEdit = (item) => {
  modalStore.open(AddAdvanceScheduleModal, {
    itemToEdit: item,
    onSuccess: fetchItems,
    onClose: () => {
      // If the store supports stacking, we are good.
      // If not, we might need to re-open this modal.
      // For now, assume standard behavior.
      modalStore.close()
    },
  })
}

const handleDelete = (id) => {
  modalStore.open(ConfirmModal, {
    title: 'Delete Rule',
    message: 'Are you sure you want to delete this schedule rule?',
    confirmText: 'Delete',
    type: 'danger',
    onConfirm: async () => {
      try {
        await api.schedules.deleteAdvanced(id)
        modalStore.open(StatusModal, { title: 'Success', message: 'Rule deleted successfully' })
        fetchItems()
      } catch (err) {
        console.error('Delete failed', err)
        modalStore.open(StatusModal, {
          title: 'Error',
          message: 'Failed to delete rule',
          type: 'error',
        })
      }
    },
    onClose: () => modalStore.close(),
  })
}

const filteredItems = computed(() => {
  if (activeFilter.value === 'ALL') return items.value
  if (activeFilter.value === 'CLOSED') return items.value.filter((i) => i.is_close_gym)
  if (activeFilter.value === 'CAPACITY') return items.value.filter((i) => !i.is_close_gym)
  return items.value
})

const formatGym = (idOrEnum) => {
  if (idOrEnum === 1 || idOrEnum === 'STING_CLUB') return 'Sting Club'
  if (idOrEnum === 2 || idOrEnum === 'STING_HIVE') return 'Sting Hive'
  return idOrEnum
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (t) => t?.slice(0, 5) || ''

onMounted(fetchItems)
</script>
