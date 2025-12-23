<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Schedules Management</h2>

      <button
        v-if="auth.isAdmin"
        @click="openAddModal"
        class="text-sm px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <span>➕</span> Add Schedule
      </button>
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
            <th class="px-2 text-center">Capacity</th>
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
            <td class="px-2 text-center">{{ item.capacity_data?.capacity || '-' }}</td>
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
                  @click="confirmDelete(item.id)"
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
import axios from 'axios'
import { api } from '@/api/bookingApi'
import { useAuthStore } from '@/stores/auth' // ✅ Import Store มาเช็คสิทธิ์

const auth = useAuthStore() // ✅ เรียกใช้ Store
const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'http://localhost:3000'

// State
const schedules = ref([])
const loading = ref(false)
const sortKey = ref('')
const sortOrder = ref('asc')

// Modal/Form State
const showModal = ref(false)
const isEditMode = ref(false)
const editingId = ref(null)
const isSubmitting = ref(false)
const showDeleteModal = ref(false)
const deletingId = ref(null)

const form = ref({
  gym_enum: '',
  start_time: '',
  end_time: '',
  is_private_class: false,
  capacity: 1,
  is_active: true,
})

// Status Modal State
const showStatusModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('success')

const openStatusModal = (title, message, type = 'success') => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = type
  showStatusModal.value = true
}

/* ================= ACTIONS ================= */

const fetchSchedules = async () => {
  try {
    loading.value = true
    const res = await axios.get(`${STING_HIVE_API_URL}/api/v1/schedules`)
    schedules.value = res.data.data
  } catch (err) {
    openStatusModal('Error', 'Failed to load schedules', 'error')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  if (!auth.isAdmin) return // กันเหนียวฝั่ง JS
  isEditMode.value = false
  editingId.value = null
  form.value = {
    gym_enum: 'STING_HIVE',
    start_time: '',
    end_time: '',
    is_private_class: false,
    capacity: 1,
    is_active: true,
  }
  showModal.value = true
}

const openEditModal = (item) => {
  if (!auth.isAdmin) return
  isEditMode.value = true
  editingId.value = item.id
  form.value = {
    gym_enum: item.gym_enum,
    start_time: item.start_time.slice(0, 5),
    end_time: item.end_time.slice(0, 5),
    is_private_class: item.is_private_class,
    capacity: item.capacity_data?.capacity || 1,
    is_active: item.is_active,
  }
  showModal.value = true
}

const submitSchedule = async () => {
  if (!auth.isAdmin) return
  try {
    isSubmitting.value = true
    const payload = {
      ...form.value,
      start_time:
        form.value.start_time.length === 5 ? `${form.value.start_time}:00` : form.value.start_time,
      end_time:
        form.value.end_time.length === 5 ? `${form.value.end_time}:00` : form.value.end_time,
    }

    if (isEditMode.value) {
      await axios.put(`${STING_HIVE_API_URL}/api/v1/schedules/${editingId.value}`, payload)
      openStatusModal('Success', 'Schedule updated successfully!')
    } else {
      await api.schedules.create(payload)
      openStatusModal('Success', 'Schedule created successfully!')
    }

    showModal.value = false
    fetchSchedules()
  } catch (err) {
    openStatusModal('Error', err.response?.data?.message || 'Action failed', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (id) => {
  if (!auth.isAdmin) return
  deletingId.value = id
  showDeleteModal.value = true
}

const handleDelete = async () => {
  try {
    await axios.delete(`${STING_HIVE_API_URL}/api/v1/schedules/${deletingId.value}`)
    openStatusModal('Success', 'Schedule deleted successfully!')
    showDeleteModal.value = false
    fetchSchedules()
  } catch (err) {
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
const formatTime = (t) => t?.slice(0, 5)
const formatGym = (g) => (g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : g)
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-')

onMounted(fetchSchedules)
</script>
