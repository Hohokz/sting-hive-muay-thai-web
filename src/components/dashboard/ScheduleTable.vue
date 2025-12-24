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

    <!-- MODALS -->
    <Teleport to="body">
      <!-- Add/Edit Modal (Exactly like EditBookingModal) -->
      <div v-if="showModal" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showModal = false"></div>

        <div
          class="relative bg-gray-50 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-fadeIn"
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
              @click="showModal = false"
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
                          >Private Class</span
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
                      <p
                        class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1"
                      >
                        Place
                      </p>
                      <p class="text-gray-900 font-bold">{{ formatGym(form.gym_enum) }}</p>
                    </div>

                    <div class="border-b border-gray-50 pb-4">
                      <p
                        class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1"
                      >
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
                      <p
                        class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1"
                      >
                        Time Range
                      </p>
                      <p v-if="!form.start_time || !form.end_time" class="text-gray-900 font-bold">
                        -
                      </p>
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
                        @click="showModal = false"
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

      <!-- Delete Confirmation Modal (Consistent Style) -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-[1101] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showDeleteModal = false"
        ></div>
        <div
          class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-fadeIn"
        >
          <div class="text-5xl mb-6">🗑️</div>
          <h3 class="text-xl font-black text-gray-900 mb-2">Confirm Delete</h3>
          <p class="text-sm text-gray-500 font-medium mb-8">
            Are you sure you want to delete this schedule? This action cannot be undone.
          </p>
          <div class="flex gap-3">
            <button
              @click="showDeleteModal = false"
              class="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500 text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Status Modal (Consistent Style) -->
      <div
        v-if="showStatusModal"
        class="fixed inset-0 z-[1102] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="showStatusModal = false"
        ></div>
        <div
          class="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs p-8 text-center animate-fadeIn"
        >
          <div class="text-4xl mb-4">{{ modalType === 'success' ? '✅' : '❌' }}</div>
          <h3 class="text-xl font-black text-gray-900 mb-1">{{ modalTitle }}</h3>
          <p class="text-sm text-gray-500 font-medium mb-8 whitespace-pre-wrap">
            {{ modalMessage }}
          </p>
          <button
            @click="showStatusModal = false"
            class="w-full py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-black/10 transition-colors"
          >
            DONE
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api/bookingApi'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// State
const schedules = ref([])
const loading = ref(false)
const sortKey = ref('start_time')
const sortOrder = ref('asc')

// Modal/Form State
const showModal = ref(false)
const isEditMode = ref(false)
const editingId = ref(null)
const isSubmitting = ref(false)
const showDeleteModal = ref(false)
const deletingId = ref(null)

const form = ref({
  gym_enum: 'STING_HIVE',
  start_time: '',
  end_time: '',
  is_private_class: false,
  capacity: 10,
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
  isEditMode.value = false
  editingId.value = null
  form.value = {
    gym_enum: 'STING_HIVE',
    start_time: '',
    end_time: '',
    is_private_class: false,
    capacity: 10,
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
    start_time: item.start_time?.slice(0, 5) || '',
    end_time: item.end_time?.slice(0, 5) || '',
    is_private_class: item.is_private_class,
    capacity: item.capacity_data?.capacity || 10,
    is_active: item.is_active,
  }
  showModal.value = true
}

const submitSchedule = async () => {
  if (!auth.isAdmin) return

  if (!form.value.start_time || !form.value.end_time) {
    openStatusModal('Error', 'Please enter both start and end times', 'error')
    return
  }

  try {
    isSubmitting.value = true

    // Construct clean payload
    const payload = {
      gym_enum: form.value.gym_enum,
      start_time: form.value.start_time.slice(0, 5),
      end_time: form.value.end_time.slice(0, 5),
      is_private_class: !!form.value.is_private_class,
      capacity: Number(form.value.capacity),
      is_active: !!form.value.is_active,
    }

    if (isEditMode.value) {
      await api.schedules.update(editingId.value, payload)
      openStatusModal('Success', 'Schedule updated successfully!')
    } else {
      await api.schedules.create(payload)
      openStatusModal('Success', 'Schedule created successfully!')
    }

    showModal.value = false
    fetchSchedules()
  } catch (err) {
    console.error('Submit error:', err)
    // Extract error message from backend
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

const handleDeleteClick = (id) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingId.value) return
  try {
    await api.schedules.delete(deletingId.value)
    openStatusModal('Success', 'Schedule deleted successfully!')
    showDeleteModal.value = false
    fetchSchedules()
  } catch (err) {
    console.error('Delete error:', err)
    openStatusModal('Error', 'Failed to delete schedule', 'error')
  } finally {
    deletingId.value = null
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
