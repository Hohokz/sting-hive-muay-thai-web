<template>
  <div class="bg-white rounded-xl shadow p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-800">Bookings Management</h2>
        <span
          v-if="totalPax > 0"
          class="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-lg border border-gray-200"
        >
          Total Pax: <span class="text-black font-bold">{{ totalPax }}</span>
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="auth.isAdmin"
          @click="openAddModal"
          class="text-sm px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>➕</span> Add Booking
        </button>
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
            <th class="px-2 cursor-pointer hover:text-black" @click="setSort('time')">
              Time {{ sortIcon('time') }}
            </th>
            <th class="px-2 cursor-pointer hover:text-black" @click="setSort('gym')">
              Gym {{ sortIcon('gym') }}
            </th>
            <th class="px-2 cursor-pointer hover:text-black" @click="setSort('classType')">
              ClassType {{ sortIcon('classType') }}
            </th>
            <th class="px-2 cursor-pointer hover:text-black" @click="setSort('client_name')">
              Name {{ sortIcon('client_name') }}
            </th>
            <th
              class="px-2 text-center font-bold cursor-pointer hover:text-black"
              @click="setSort('capacity')"
            >
              Pax {{ sortIcon('capacity') }}
            </th>
            <th class="px-2 text-center">Trainer Name</th>
            <th
              class="px-2 text-center cursor-pointer hover:text-black"
              @click="setSort('booking_status')"
            >
              Status {{ sortIcon('booking_status') }}
            </th>
            <th
              class="px-2 text-center cursor-pointer hover:text-black"
              @click="setSort('payment')"
            >
              Payment {{ sortIcon('payment') }}
            </th>
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
            </td>
            <td class="px-2">
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
            <td class="px-2">
              <div class="flex justify-center items-center gap-2 group relative">
                <span class="text-gray-500">{{ item.trainer || '-' }}</span>
                <button
                  v-if="auth.isAdmin"
                  @click="openTrainerModal(item)"
                  class="opacity-0 group-hover:opacity-100 text-blue-500 text-[10px] font-bold hover:underline"
                >
                  ✎ Edit
                </button>
              </div>
            </td>
            <td class="px-2 text-center">
              <span
                class="text-[10px] font-bold px-2 py-1 rounded uppercase"
                :class="statusClass(item.booking_status)"
              >
                {{ item.booking_status }}
              </span>
            </td>
            <td class="px-2 text-center">
              <input
                type="checkbox"
                :checked="item.booking_status === 'PAYMENTED'"
                @change="handlePaymentChange(item, $event)"
                class="w-4 h-4 accent-black cursor-pointer"
              />
            </td>
            <td class="px-2 max-w-[180px]">
              <div class="flex items-center gap-2 group relative">
                <span class="truncate text-gray-500 italic text-xs" :title="item.admin_note">
                  {{ item.admin_note || '-' }}
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

    <!-- Mobile View -->
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
          <div class="text-gray-400 font-bold uppercase text-[9px]">Payment Status</div>
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :id="'pay-mob-' + item.id"
              :checked="item.booking_status === 'PAYMENTED'"
              @change="handlePaymentChange(item, $event)"
              class="w-4 h-4 accent-black"
            />
            <label :for="'pay-mob-' + item.id" class="text-[10px] font-bold text-gray-700">
              {{ item.booking_status === 'PAYMENTED' ? 'PAID' : 'PENDING' }}
            </label>
          </div>
          <div class="text-gray-400 font-bold uppercase text-[9px]">Pax / Trainer</div>
          <div class="text-gray-700 flex items-center gap-2">
            <span>{{ item.capacity }} pax / {{ item.trainer_name || '-' }}</span>
            <button
              v-if="auth.isAdmin"
              @click="openTrainerModal(item)"
              class="text-blue-500 font-black text-[9px]"
            >
              EDIT
            </button>
          </div>
          <div class="text-gray-400 font-bold uppercase text-[9px]">Note</div>
          <div class="flex items-center gap-2 italic text-gray-500">
            <span class="flex-1 truncate">{{ item.admin_note || '-' }}</span>
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
      <!-- NOTE MODAL -->
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

      <!-- TRAINER MODAL -->
      <div
        v-if="showTrainerModal"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showTrainerModal = false"
        ></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          <h3 class="text-xl font-black text-gray-900 mb-1">Assign Trainer</h3>
          <p class="text-xs text-gray-400 mb-6 font-medium uppercase tracking-widest">
            Select trainer from system
          </p>

          <div class="mb-6 relative">
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2"
              >Trainer Lookup</label
            >

            <div class="relative group">
              <input
                v-model="userSearchQuery"
                type="text"
                class="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                placeholder="Search name or phone..."
                @focus="isDropdownOpen = true"
              />
              <button
                @click="isDropdownOpen = !isDropdownOpen"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-transform"
                :class="{ 'rotate-180': isDropdownOpen }"
              >
                ▼
              </button>
            </div>

            <div
              v-if="isDropdownOpen"
              class="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden"
            >
              <div
                v-for="user in searchedUsers"
                :key="user.id"
                @click="selectTrainer(user)"
                class="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center transition-colors"
              >
                <div>
                  <div class="font-bold text-sm text-gray-800">{{ user.name }}</div>
                  <div class="text-[10px] text-gray-500 font-mono">{{ user.phone }}</div>
                </div>
                <span class="text-blue-500 text-xs font-bold">Select</span>
              </div>

              <div
                v-if="searchedUsers.length === 0"
                class="p-4 text-center text-xs text-gray-400 italic"
              >
                No matches found.
              </div>
            </div>
          </div>

          <div
            class="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between"
          >
            <div>
              <span class="text-[9px] font-black text-blue-400 uppercase block"
                >Selected Trainer</span
              >
              <div class="font-bold text-blue-800">
                {{ trainerForm.trainer_name || 'None Selected' }}
              </div>
            </div>
            <button
              v-if="trainerForm.trainer_name"
              @click="trainerForm.trainer_name = ''"
              class="text-blue-400 hover:text-red-500 text-xs"
            >
              Clear
            </button>
          </div>

          <div class="flex gap-3">
            <button
              @click="showTrainerModal = false"
              class="flex-1 py-3 bg-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              @click="handleSaveTrainer"
              :disabled="isSavingTrainer || !trainerForm.trainer_name"
              class="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {{ isSavingTrainer ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from '@/api/bookingApi'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'
import BookingFilter from './BookingFilter.vue'
import EditBookingModal from './EditBookingModal.vue'

const auth = useAuthStore()
const modalStore = useModalStore()
const emit = defineEmits(['refresh', 'cancel'])
const props = defineProps({
  bookings: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const filters = defineModel('filters')

/* ================= ADD/EDIT MODAL LOGIC ================= */
// ฟังก์ชันสำหรับเปิดเพื่อแก้ไข
const openEditModal = (id) => {
  modalStore.open(EditBookingModal, {
    bookingId: id,
    onUpdated: handleEditSuccess,
    onClose: () => modalStore.close(), // Or let loader handle it
  })
}

// ฟังก์ชันสำหรับเปิดเพื่อเพิ่มใหม่
const openAddModal = () => {
  if (!auth.isAdmin) return
  modalStore.open(EditBookingModal, {
    bookingId: null,
    onUpdated: handleEditSuccess,
    onClose: () => modalStore.close(),
  })
}

// ฟังก์ชันเมื่อบันทึกสำเร็จ
const handleEditSuccess = () => {
  emit('refresh') // รีเฟรชรายการ
}

/* ================= QUICK NOTE LOGIC ================= */
const showNoteModal = ref(false)
const isSavingNote = ref(false)
const noteForm = ref({ id: '', note: '' })

const openNoteModal = (item) => {
  noteForm.value = { id: item.id, note: item.admin_note || '' }
  showNoteModal.value = true
}

const showError = (message, title = 'Error') => {
  modalStore.open(StatusModal, {
    title,
    message,
    type: 'error',
  })
}

const handleSaveNote = async () => {
  if (!noteForm.value.id) return
  try {
    isSavingNote.value = true

    // 1. ส่งข้อมูลไปเซฟใน Database
    await api.bookings.updateNote(noteForm.value.id, { note: noteForm.value.note })

    // 2. ✅ สำคัญมาก: สั่งให้ Component แม่ไปดึงข้อมูลใหม่จาก DB
    // เพื่อให้มั่นใจว่า Note ที่เพิ่งเซฟไป ถูกดึงมาแสดงผลจริงๆ
    emit('refresh')

    // 3. ปิด Modal
    showNoteModal.value = false

    // (ทางเลือก) แจ้งเตือนว่าเซฟแล้ว
    // alert('Note saved successfully!')
  } catch (err) {
    console.error('❌ Save Note Error:', err)
    showError(
      'Failed to save note. Please check your connection or if the API route exists.',
      'Save Failed',
    )
  } finally {
    isSavingNote.value = false
  }
}

/* ================= TRAINER LOOKUP LOGIC ================= */
const showTrainerModal = ref(false)
const isSavingTrainer = ref(false)
const isDropdownOpen = ref(false) // สถานะเปิด/ปิด dropdown
const userSearchQuery = ref('')
const trainerForm = ref({ id: '', trainer_name: '' })

const userList = ref([]) // เก็บรายชื่อที่จะเอามาทำ Lookup

const searchedUsers = computed(() => {
  // มั่นใจว่าได้ Array เสมอ แม้ userList จะยังโหลดไม่เสร็จ
  const list = Array.isArray(userList.value) ? userList.value : []

  const q = (userSearchQuery.value || '').toLowerCase().trim()

  if (!q) return list

  return list.filter(
    (user) =>
      user.name?.toLowerCase().includes(q) ||
      user.phone?.includes(q) ||
      user.username?.toLowerCase().includes(q),
  )
})

const fetchUsers = async () => {
  try {
    const response = await api.auth.getUser()
    console.log('Raw Axios Response:', response.data)

    // 1. เจาะเข้าไปที่ก้อน data ภายใน response.data อีกที
    const actualData = response.data.data

    // 2. เช็คว่า actualData เป็น Array หรือไม่
    if (Array.isArray(actualData)) {
      userList.value = actualData.map((item) => {
        // เจาะเข้า dataValues (Sequelize object)
        const raw = item.dataValues || item
        return {
          id: raw.id,
          name: raw.name || raw.username, // กันเหนียวถ้าไม่มี name ให้ใช้ username
          phone: raw.phone || '-',
          username: raw.username,
        }
      })
    }

    console.log('Cleaned User List:', userList.value) // รอบนี้ต้องขึ้น Array(2) แล้วครับ
  } catch (err) {
    console.error('❌ Fetch Users Error:', err)
  }
}

const selectTrainer = (user) => {
  // 1. เอาชื่อไปใส่ใน Form
  trainerForm.value.trainer_name = user.name || user.username

  // 2. อัปเดตช่อง Search ให้เห็นชื่อที่เลือก (หรือจะล้างออกก็ได้ตามใจชอบ)
  userSearchQuery.value = user.name || user.username

  // 3. ปิด Dropdown ทันทีเมื่อเลือกเสร็จ
  isDropdownOpen.value = false

  console.log('✅ Selected Trainer:', user.name)
}

const openTrainerModal = async (item) => {
  trainerForm.value = { id: item.id, trainer_name: item.trainer_name || '' }
  userSearchQuery.value = ''
  isDropdownOpen.value = false

  await fetchUsers() // ดึงข้อมูลใหม่ทุกครั้งที่เปิด Modal
  showTrainerModal.value = true
}

const handleSaveTrainer = async () => {
  if (!trainerForm.value.id) return
  try {
    isSavingTrainer.value = true
    await api.bookings.updateTrainer(trainerForm.value.id, {
      trainer_name: trainerForm.value.trainer_name,
    })
    emit('refresh')
    showTrainerModal.value = false
  } catch (err) {
    console.error('❌ Save Trainer Error:', err)
    showError('Could not update trainer.', 'Update Failed')
  } finally {
    isSavingTrainer.value = false
  }
}

const handlePaymentChange = async (item, event) => {
  const isChecked = event.target.checked
  console.log(isChecked)

  try {
    // เรียก API ตามที่คุณระบุ (ส่ง Boolean true/false)
    await api.bookings.updatePayment(item.id, {
      is_paid: isChecked,
    })

    // ถ้าสำเร็จ ให้รีเฟรชข้อมูลเพื่อให้ UI สอดคล้องกับ DB
    emit('refresh')
  } catch (err) {
    console.error('❌ Update Payment Error:', err)
    // ถ้าพลาด ให้คืนค่า Checkbox กลับไปสถานะเดิม
    event.target.checked = !isChecked
    showError('Could not update payment status.', 'Update Failed')
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

const filteredBookings = computed(() => {
  if (!props.bookings) return []
  return props.bookings.filter((item) => {
    // 0. Canceled Booking
    if (item.booking_status === 'CANCELED') return false
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

const totalPax = computed(() => {
  return filteredBookings.value.reduce((sum, item) => {
    return sum + (Number(item.capacity) || 0)
  }, 0)
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
    } else if (sortKey.value === 'time') {
      valA = a.schedule?.start_time
      valB = b.schedule?.start_time
    } else if (sortKey.value === 'classType') {
      valA = a.is_private ? 1 : 0
      valB = b.is_private ? 1 : 0
    } else if (sortKey.value === 'payment') {
      valA = a.booking_status === 'PAYMENTED' ? 1 : 0
      valB = b.booking_status === 'PAYMENTED' ? 1 : 0
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
  if (s === 'PAYMENTED') return 'bg-blue-100 text-blue-700'
  if (s === 'SUCCEED') return 'bg-green-100 text-green-700'
  if (s === 'CANCELLED' || s === 'CANCELED') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}

const confirmCancel = (i) => emit('cancel', i.id)
</script>
