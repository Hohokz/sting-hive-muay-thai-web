<template>
  <div class="bg-white rounded-xl shadow p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-lg font-semibold text-gray-800">Bookings Management</h2>
      <div class="flex items-center gap-2">
        <BookingFilter v-model="filters" />
        <button
          @click="handleRefresh"
          :disabled="loading"
          class="text-sm px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 whitespace-nowrap hover:bg-gray-800 transition-colors"
        >
          <span v-if="loading" class="inline-block animate-spin mr-1">⟳</span>
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div v-if="loading || isFiltering" class="text-center py-20">
      <div
        class="inline-block w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"
      ></div>
      <p class="mt-2 text-gray-400 font-medium">Processing bookings...</p>
    </div>

    <div
      v-else-if="sortedBookings.length === 0"
      class="text-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl"
    >
      No bookings found matching current filters.
    </div>

    <div v-else class="hidden md:block overflow-x-auto relative">
      <table class="w-full text-sm">
        <thead class="border-b bg-gray-50">
          <tr class="text-left text-gray-600 select-none">
            <th class="py-3 px-2 cursor-pointer hover:text-black" @click="setSort('date_booking')">
              Date {{ sortIcon('date_booking') }}
            </th>
            <th class="px-2 cursor-pointer hover:text-black" @click="setSort('gym')">
              Gym {{ sortIcon('gym') }}
            </th>
            <th class="px-2">Class</th>
            <th class="px-2">Name</th>
            <th class="px-2 text-center font-bold">Pax</th>
            <th class="px-2">Trainer</th>
            <th class="px-2 text-center">Status</th>
            <th class="px-2">Note</th>
            <th v-if="auth.isAdmin" class="px-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in sortedBookings"
            :key="item.id"
            class="border-b hover:bg-gray-50 transition-colors"
          >
            <td class="py-4 px-2">
              <div class="font-bold text-gray-900">{{ formatDate(item.date_booking) }}</div>
              <div class="text-xs text-gray-500 font-mono">
                {{ formatTime(item.schedule?.start_time) }} -
                {{ formatTime(item.schedule?.end_time) }}
              </div>
            </td>
            <td class="px-2">{{ formatGym(item.schedule?.gym_enum) }}</td>
            <td class="px-2">
              <span
                class="px-2 py-1 rounded text-[10px] font-bold uppercase"
                :class="
                  item.is_private ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                "
              >
                {{ item.is_private ? 'Private' : 'Group' }}
              </span>
            </td>
            <td class="px-2 font-semibold text-gray-800">{{ item.client_name }}</td>
            <td class="px-2 text-center font-bold">{{ item.capacity }}</td>
            <td class="px-2 text-gray-500">{{ item.trainer_name || '-' }}</td>
            <td class="px-2 text-center">
              <span
                class="text-[10px] font-bold px-2 py-1 rounded uppercase"
                :class="statusClass(item.booking_status)"
              >
                {{ item.booking_status }}
              </span>
            </td>
            <td class="px-2 max-w-[180px]">
              <div class="flex items-center gap-2 group relative">
                <span class="truncate text-gray-500 italic text-xs" :title="item.note">
                  {{ item.note || '-' }}
                </span>
                <button
                  @click="openNoteModal(item)"
                  class="opacity-0 group-hover:opacity-100 text-blue-500 text-[10px] font-bold hover:underline"
                >
                  ✎ Edit
                </button>
              </div>
            </td>
            <td v-if="auth.isAdmin" class="px-2 text-center">
              <div class="flex items-center justify-center gap-4">
                <button
                  v-if="item.booking_status !== 'CANCELED'"
                  @click="openEditModal(item.id)"
                  class="text-blue-500 hover:text-blue-700 text-lg transition-transform hover:scale-125"
                >
                  ✎
                </button>
                <button
                  v-if="item.booking_status !== 'CANCELED'"
                  @click="confirmCancel(item)"
                  class="text-red-400 hover:text-red-600 text-lg transition-transform hover:scale-125"
                >
                  ✖
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="md:hidden space-y-4">
      <div
        v-for="item in sortedBookings"
        :key="item.id"
        class="bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="font-black text-gray-900 leading-tight">
              {{ formatDate(item.date_booking) }}
            </div>
            <div class="text-xs text-gray-500 font-mono">
              {{ formatTime(item.schedule?.start_time) }} -
              {{ formatTime(item.schedule?.end_time) }}
            </div>
          </div>
          <span
            class="text-[10px] px-2 py-1 rounded font-black uppercase"
            :class="statusClass(item.booking_status)"
          >
            {{ item.booking_status }}
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs mb-3">
          <span class="font-bold text-gray-700 uppercase">{{
            formatGym(item.schedule?.gym_enum)
          }}</span>
          <span class="text-gray-300">|</span>
          <span
            class="px-2 py-0.5 rounded font-black text-[9px] uppercase"
            :class="item.is_private ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
          >
            {{ item.is_private ? 'Private' : 'Group' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-y-2 text-xs border-t border-gray-200 pt-3">
          <div class="text-gray-400 font-bold uppercase text-[9px]">Name</div>
          <div class="font-bold text-gray-800">{{ item.client_name }}</div>
          <div class="text-gray-400 font-bold uppercase text-[9px]">Pax / Trainer</div>
          <div class="text-gray-700">{{ item.capacity }} pax / {{ item.trainer_name || '-' }}</div>
          <div class="text-gray-400 font-bold uppercase text-[9px]">Note</div>
          <div class="flex items-center gap-2 italic text-gray-500">
            <span class="flex-1 truncate">{{ item.note || '-' }}</span>
            <button @click="openNoteModal(item)" class="text-blue-500 font-black text-[9px]">
              EDIT
            </button>
          </div>
        </div>

        <div v-if="auth.isAdmin" class="flex gap-2 pt-3 mt-3 border-t border-dashed">
          <button
            @click="openEditModal(item.id)"
            class="flex-1 text-center py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase"
          >
            Edit Info
          </button>
          <button
            v-if="item.booking_status !== 'CANCELLED'"
            @click="confirmCancel(item)"
            class="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showNoteModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showNoteModal = false"
        ></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2 bg-black"></div>
          <h3 class="text-xl font-black text-gray-900 mb-1">Quick Note</h3>
          <p class="text-xs text-gray-400 mb-4 font-medium uppercase tracking-widest">
            Add or Edit Record Note
          </p>

          <textarea
            v-model="noteForm.note"
            rows="5"
            class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black outline-none resize-none mb-6"
            placeholder="Type your notes here..."
          ></textarea>

          <div class="flex gap-3">
            <button
              @click="showNoteModal = false"
              class="flex-1 py-3 bg-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              @click="handleSaveNote"
              :disabled="isSavingNote"
              class="flex-1 py-3 bg-black text-white rounded-2xl text-sm font-bold shadow-lg shadow-black/20 disabled:opacity-50"
            >
              {{ isSavingNote ? 'Saving...' : 'Save Note' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- EDIT BOOKING MODAL -->
    <EditBookingModal
      :show="showEditModal"
      :bookingId="editingBookingId"
      @close="showEditModal = false"
      @updated="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import BookingFilter from './BookingFilter.vue'
import EditBookingModal from './EditBookingModal.vue'

const auth = useAuthStore()
const emit = defineEmits(['refresh', 'cancel'])
const props = defineProps({
  bookings: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'http://localhost:3000'
const filters = defineModel('filters')
const isFiltering = ref(false)

/* ================= EDIT MODAL LOGIC ================= */
const showEditModal = ref(false)
const editingBookingId = ref(null)

const openEditModal = (id) => {
  editingBookingId.value = id
  showEditModal.value = true
}

const handleEditSuccess = () => {
  emit('refresh')
}

/* ================= QUICK NOTE LOGIC ================= */
const showNoteModal = ref(false)
const isSavingNote = ref(false)
const noteForm = ref({ id: '', note: '' })

const openNoteModal = (item) => {
  noteForm.value = { id: item.id, note: item.note || '' }
  showNoteModal.value = true
}

const handleSaveNote = async () => {
  if (!noteForm.value.id) return
  try {
    isSavingNote.value = true
    const token = localStorage.getItem('token')

    // 1. ส่งข้อมูลไปเซฟใน Database
    await axios.patch(
      `${STING_HIVE_API_URL}/api/v1/bookings/${noteForm.value.id}/note`,
      { note: noteForm.value.note },
      { headers: { Authorization: `Bearer ${token}` } },
    )

    // 2. ✅ สำคัญมาก: สั่งให้ Component แม่ไปดึงข้อมูลใหม่จาก DB
    // เพื่อให้มั่นใจว่า Note ที่เพิ่งเซฟไป ถูกดึงมาแสดงผลจริงๆ
    emit('refresh')

    // 3. ปิด Modal
    showNoteModal.value = false

    // (ทางเลือก) แจ้งเตือนว่าเซฟแล้ว
    // alert('Note saved successfully!')
  } catch (err) {
    console.error('❌ Save Note Error:', err)
    alert('Failed to save note. Please check if the API route /note exists.')
  } finally {
    isSavingNote.value = false
  }
}

/* ================= FILTER & REFRESH ================= */
const handleRefresh = () => {
  const gym = filters.value.gym
  // ✅ สร้างวันที่ปัจจุบันแบบปลอดภัย (YYYY-MM-DD)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const today = `${year}-${month}-${day}`

  filters.value = {
    date: today, // ✅ ได้ YYYY-MM-DD แน่นอน
    scheduleId: '',
    classType: 'ALL',
    gym: gym,
  }
  emit('refresh')
}

watch(
  filters,
  () => {
    isFiltering.value = true
    setTimeout(() => (isFiltering.value = false), 300)
  },
  { deep: true },
)

const filteredBookings = computed(() => {
  if (!props.bookings) return []
  return props.bookings.filter((item) => {
    // 1. Gym
    if (filters.value.gym && filters.value.gym !== 'ALL') {
      if (item.schedule?.gym_enum !== filters.value.gym) return false
    }
    // 2. Date
    if (filters.value.date) {
      const itemDate = item.date_booking?.slice(0, 10)
      if (itemDate !== filters.value.date) return false
    }
    // 3. Schedule ID (Strict Filter)
    if (filters.value.scheduleId && filters.value.scheduleId !== '') {
      const b_scheduleId = item.schedule_id || item.schedule?.id
      if (b_scheduleId != filters.value.scheduleId) return false
    }
    // 4. Class Type
    if (filters.value.classType !== 'ALL') {
      const isPrivateTarget = filters.value.classType === 'PRIVATE'
      if (item.is_private !== isPrivateTarget) return false
    }
    return true
  })
})

/* ================= SORTING ================= */
const sortKey = ref('date_booking')
const sortOrder = ref('asc')

const setSort = (key) => {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortedBookings = computed(() => {
  const data = [...filteredBookings.value]
  if (!sortKey.value) return data
  return data.sort((a, b) => {
    let valA = a[sortKey.value],
      valB = b[sortKey.value]
    if (sortKey.value === 'gym') {
      valA = a.schedule?.gym_enum
      valB = b.schedule?.gym_enum
    }
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

/* ================= UTILS ================= */
const sortIcon = (key) => (sortKey.value !== key ? '↕' : sortOrder.value === 'asc' ? '↑' : '↓')
const formatTime = (t) => t?.slice(0, 5) || '--:--'
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-')
const formatGym = (g) =>
  g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : '-'

const statusClass = (s) => {
  if (s === 'SUCCEED') return 'bg-green-100 text-green-700'
  if (s === 'CANCELLED' || s === 'CANCELED') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}

const confirmCancel = (i) => emit('cancel', i.id)
</script>
