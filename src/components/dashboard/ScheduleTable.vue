<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Schedules Management</h2>

      <div class="flex gap-2">
        <button
          v-if="auth.isAdmin"
          @click="openViewAdvanceModal"
          class="text-sm px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          View Schedule In Advance
        </button>

        <button
          v-if="auth.isAdmin"
          @click="openAddAvanceModel"
          class="text-sm px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>➕</span>Add Schedule In Advance
        </button>

        <button
          v-if="auth.isAdmin"
          @click="openAddModal"
          class="text-sm px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          Add Schedule
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b bg-gray-50">
          <tr class="text-left text-gray-600 select-none">
            <th class="py-2 px-2 cursor-pointer" @click="setSort('gym_enum')">
              Gym {{ sortIcon('gym_enum') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('start_time')">
              Time {{ sortIcon('start_time') }}
            </th>
            <th class="px-2">Type</th>
            <th class="px-2 text-center border-x">Capacity</th>
            <th class="px-2">Status</th>

            <th v-if="auth.isAdmin" class="px-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in sortedSchedules" :key="item.id" class="border-b hover:bg-gray-50">
            <td class="py-3 px-2 font-medium">{{ formatGym(item.gym_enum) }}</td>
            <td class="px-2 font-mono">
              {{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}
            </td>
            <td class="px-2">
              <span
                class="px-2 py-1 rounded text-[10px] font-bold uppercase"
                :class="
                  item.is_private_class
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-blue-100 text-blue-600'
                "
              >
                {{ item.is_private_class ? 'Private' : 'Group' }}
              </span>
            </td>
            <td class="px-2 text-center font-bold border-x text-gray-700">
              {{ item.capacity_data?.capacity || '-' }}
            </td>
            <td class="px-2">
              <span
                class="text-[10px] font-bold px-2 py-1 rounded uppercase"
                :class="
                  item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                "
              >
                {{ item.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td v-if="auth.isAdmin" class="px-2 text-center">
              <div class="flex justify-center gap-4">
                <button
                  @click="openEditModal(item)"
                  class="text-blue-500 hover:text-blue-700 text-lg transition-transform hover:scale-125"
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  @click="handleDeleteClick(item.id)"
                  class="text-red-400 hover:text-red-600 text-lg transition-transform hover:scale-125"
                  title="Delete"
                >
                  ✖
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="loading">
            <td :colspan="auth.isAdmin ? 6 : 5" class="py-12 text-center text-gray-400">
              Loading...
            </td>
          </tr>
          <tr v-else-if="sortedSchedules.length === 0">
            <td :colspan="auth.isAdmin ? 6 : 5" class="py-12 text-center text-gray-400">
              No schedules found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api/bookingApi'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import EditScheduleModal from './EditScheduleModal.vue'
import AddAdvanceScheduleModal from './AddAdvanceScheduleModal.vue'
import ViewAdvanceScheduleModal from './ViewAdvanceScheduleModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import StatusModal from '@/components/common/StatusModal.vue'

const auth = useAuthStore()
const modalStore = useModalStore()

// State
const schedules = ref([])
const loading = ref(false)
const sortKey = ref('start_time')
const sortOrder = ref('asc')

const openStatusModal = (title, message, type = 'success') => {
  modalStore.open(StatusModal, { title, message, type })
}

/* ================= ACTIONS ================= */

const fetchSchedules = async () => {
  try {
    loading.value = true
    const res = await api.schedules.get()
    schedules.value = res.data.data
  } catch (err) {
    console.error('Fetch error:', err)
    try {
      const res2 = await api.schedules.getAvailable()
      schedules.value = res2.data.data
    } catch (err2) {
      console.error('Fetch fallback error:', err2)
    }
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  if (!auth.isAdmin) return
  modalStore.open(EditScheduleModal, {
    schedule: null,
    onSuccess: fetchSchedules,
    onClose: () => modalStore.close(),
  })
}

const openEditModal = (item) => {
  if (!auth.isAdmin) return
  modalStore.open(EditScheduleModal, {
    schedule: item,
    onSuccess: fetchSchedules,
    onClose: () => modalStore.close(),
  })
}

const openViewAdvanceModal = () => {
  if (!auth.isAdmin) return
  modalStore.open(ViewAdvanceScheduleModal, {
    onClose: () => modalStore.close(),
  })
}

const openAddAvanceModel = () => {
  if (!auth.isAdmin) return
  modalStore.open(AddAdvanceScheduleModal, {
    onSuccess: fetchSchedules, // Or just let it be, but refresh is good
    onClose: () => modalStore.close(),
  })
}

const handleDeleteClick = (id) => {
  modalStore.open(ConfirmModal, {
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this schedule? This action cannot be undone.',
    confirmText: 'Delete',
    type: 'danger',
    onConfirm: () => confirmDelete(id),
    onClose: () => modalStore.close(),
  })
}

const confirmDelete = async (id) => {
  try {
    await api.schedules.delete(id)
    openStatusModal('Success', 'Schedule deleted successfully!')
    fetchSchedules()
  } catch (err) {
    console.error('Delete error:', err)
    openStatusModal('Error', 'Failed to delete schedule', 'error')
  }
}

/* ================= SORT & UTILS ================= */

const sortedSchedules = computed(() => {
  const data = [...schedules.value]
  if (!sortKey.value) return data
  return data.sort((a, b) => {
    let valA = a[sortKey.value],
      valB = b[sortKey.value]
    if (sortKey.value === 'capacity') {
      valA = a.capacity_data?.capacity || 0
      valB = b.capacity_data?.capacity || 0
    }
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const setSort = (k) => {
  if (sortKey.value === k) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = k
    sortOrder.value = 'asc'
  }
}

const sortIcon = (k) => (sortKey.value !== k ? '↕' : sortOrder.value === 'asc' ? '↑' : '↓')
const formatTime = (t) => t?.slice(0, 5) || '--:--'
const formatGym = (g) => (g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : g)

onMounted(fetchSchedules)
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
</style>
