<template>
  <div class="booking-list-container">
    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"
      ></div>
      <p class="mt-2 text-gray-400 font-medium">Processing bookings...</p>
    </div>

    <div
      v-else-if="sortedBookings.length === 0"
      class="text-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl"
    >
      No bookings found.
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
            <th class="px-2 text-center">Trainer</th>
            <th class="px-2 text-center">Multi Pax</th>
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
            <th class="px-2 text-center">Updated By</th>
            <th class="px-2 text-center whitespace-nowrap">Updated Date</th>
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
                <span class="text-gray-500">{{
                  item.trainer_name ||
                  (typeof item.trainer === 'string' ? item.trainer : item.trainer?.name) ||
                  '-'
                }}</span>
                <button
                  v-if="auth.isAdmin"
                  @click="openTrainerModal(item)"
                  class="opacity-0 group-hover:opacity-100 text-blue-500 text-[10px] font-bold hover:underline"
                >
                  Edit
                </button>
              </div>
            </td>
            <td class="px-2 text-center">
              <span
                v-if="item.is_private"
                class="text-xs font-medium px-2 py-1 rounded"
                :class="
                  item.multipleStudents || item.multiple_students
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                {{ item.multipleStudents || item.multiple_students ? '2v1' : '1v1' }}
              </span>
              <span v-else class="text-gray-400 text-xs">-</span>
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
              <div class="flex flex-col items-center gap-1 group relative">
                <input
                  type="checkbox"
                  :checked="item.booking_status === 'PAYMENTED'"
                  @change="handlePaymentChange(item, $event)"
                  class="w-4 h-4 accent-black cursor-pointer"
                />
                <button
                  v-if="item.booking_status === 'PAYMENTED'"
                  @click="openPaymentModal(item, null)"
                  class="opacity-0 group-hover:opacity-100 text-blue-500 text-[10px] font-bold hover:underline"
                >
                  + เพิ่ม
                </button>
              </div>
            </td>
            <td class="px-2 max-w-[180px]">
              <div class="flex items-center gap-2 group relative">
                <span
                  class="truncate text-gray-500 italic text-xs"
                  :title="item.admin_note || item.note"
                >
                  {{ item.admin_note || item.note || '-' }}
                </span>
                <button
                  @click="openNoteModal(item)"
                  class="opacity-0 group-hover:opacity-100 text-blue-500 text-[10px] font-bold hover:underline"
                >
                  Edit
                </button>
              </div>
            </td>
            <td class="px-2 text-center">
              <div class="font-bold text-gray-700 whitespace-nowrap">
                {{ item.updated_by || item.admin_name || '-' }}
              </div>
            </td>
            <td class="px-2 text-center">
              <div class="text-[10px] text-gray-400 font-mono">
                {{ formatDateTime(item.updated_at || item.updated_date) }}
              </div>
            </td>
            <td v-if="auth.isAdmin" class="px-2 text-center">
              <div class="flex items-center justify-center gap-4">
                <button
                  v-if="item.booking_status !== 'CANCELED'"
                  @click="openEditModal(item.id)"
                  class="text-blue-500 hover:text-blue-700 text-lg transition-transform hover:scale-125"
                >
                  <img src="/dashboard/edit-3-svgrepo-com.svg" alt="Edit" class="w-5 h-5" />
                </button>
                <button
                  v-if="item.booking_status !== 'CANCELED'"
                  @click="confirmCancel(item)"
                  class="text-red-400 hover:text-red-600 text-lg transition-transform hover:scale-125"
                >
                  <img src="/dashboard/delete-1-svgrepo-com.svg" alt="Edit" class="w-5 h-5" />
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

        <div
          class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4 text-xs border-t border-gray-200 pt-3"
        >
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
            <button
              v-if="item.booking_status === 'PAYMENTED'"
              @click="openPaymentModal(item, null)"
              class="text-blue-500 font-black text-[11px] px-2 py-1 bg-blue-50 rounded"
            >
              + เพิ่ม
            </button>
          </div>
          <div class="text-gray-400 font-bold uppercase text-[9px]">Pax / Trainer</div>
          <div class="text-gray-700 flex items-center gap-2">
            <span
              >{{ item.capacity }} pax /
              {{
                item.trainer_name ||
                (typeof item.trainer === 'string' ? item.trainer : item.trainer?.name) ||
                '-'
              }}</span
            >
            <button
              v-if="auth.isAdmin"
              @click="openTrainerModal(item)"
              class="text-blue-500 font-black text-[11px] px-2 py-1 bg-blue-50 rounded"
            >
              EDIT
            </button>
          </div>
          <div v-if="item.is_private" class="text-gray-400 font-bold uppercase text-[9px]">
            Multiple Students
          </div>
          <div v-if="item.is_private" class="text-gray-700">
            <span
              class="text-xs font-medium px-2 py-1 rounded"
              :class="
                item.multipleStudents || item.multiple_students
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              "
            >
              {{ item.multipleStudents || item.multiple_students ? '2v1' : '1v1' }}
            </span>
          </div>
          <div class="text-gray-400 font-bold uppercase text-[9px]">Note</div>
          <div class="flex items-center gap-2 italic text-gray-500">
            <span class="flex-1 truncate">{{ item.admin_note || item.note || '-' }}</span>
            <button
              @click="openNoteModal(item)"
              class="text-blue-500 font-black text-[11px] px-2 py-1 bg-blue-50 rounded"
            >
              EDIT
            </button>
          </div>
          <div class="text-gray-400 font-bold uppercase text-[9px]">Last Update</div>
          <div class="text-[10px] text-gray-700 font-bold flex flex-col">
            <span>By: {{ item.updated_by || item.admin_name || '-' }}</span>
            <span class="text-gray-400 font-mono">{{
              formatDateTime(item.updated_at || item.updated_date)
            }}</span>
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

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from '@/api/bookingApi'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'
import EditBookingModal from './EditBookingModal.vue'
import PaymentModal from './PaymentModal.vue'
import NoteModal from './NoteModal.vue'
import TrainerModal from './TrainerModal.vue'

const auth = useAuthStore()
const modalStore = useModalStore()
const emit = defineEmits(['refresh', 'cancel'])
const props = defineProps({
  bookings: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

/* ================= ADD/EDIT MODAL LOGIC ================= */
// ฟังก์ชันสำหรับเปิดเพื่อแก้ไข
const openEditModal = (id) => {
  modalStore.open(EditBookingModal, {
    bookingId: id,
    onUpdated: handleEditSuccess,
  })
}

// ฟังก์ชันเมื่อบันทึกสำเร็จ
const handleEditSuccess = () => {
  emit('refresh') // รีเฟรชรายการ
}

const showError = (message, title = 'Error') => {
  modalStore.open(StatusModal, {
    title,
    message,
    type: 'error',
  })
}

/* ================= QUICK NOTE LOGIC ================= */
// Opened via modalStore (not a local Teleport) so it always stacks
// correctly via GlobalModalLoader's z-index, including when BookingList is
// itself nested inside another modalStore modal (e.g. SearchBookingModal's
// "search by name" view) — a fixed z-index here would render behind that
// outer modal instead.
const openNoteModal = (item) => {
  modalStore.open(NoteModal, {
    bookingId: item.id,
    initialNote: item.admin_note || item.note || '',
    onSaved: (note) => {
      // Update locally to override stale API cache in search modal
      const target = props.bookings.find((b) => b.id === item.id)
      if (target) {
        target.admin_note = note
        target.note = note
        target.updated_at = new Date().toISOString()
        target.updated_date = new Date().toISOString()
        target.updated_by = auth.user?.name || auth.user?.username || 'Me'
      }
      emit('refresh')
    },
  })
}

/* ================= TRAINER LOOKUP LOGIC ================= */
const openTrainerModal = (item) => {
  const tName =
    item.trainer_name ||
    (typeof item.trainer === 'string' ? item.trainer : item.trainer?.name) ||
    ''
  modalStore.open(TrainerModal, {
    bookingId: item.id,
    initialTrainerName: tName,
    onSaved: () => emit('refresh'),
  })
}

/* ================= PAYMENT LOGIC ================= */
// Opened via modalStore (not a local Teleport) so it always stacks
// correctly via GlobalModalLoader's z-index, including when BookingList is
// itself nested inside another modalStore modal (e.g. SearchBookingModal's
// "search by name" view) — a fixed z-index here would render behind that
// outer modal instead.
const openPaymentModal = (item, checkboxEl) => {
  modalStore.open(PaymentModal, {
    bookingId: item.id,
    onRefresh: () => emit('refresh'),
    onRevertCheckbox: checkboxEl ? () => { checkboxEl.checked = false } : null,
  })
}

const handlePaymentChange = async (item, event) => {
  const isChecked = event.target.checked
  if (!isChecked) {
    try {
      await api.bookings.updatePayment(item.id, { is_paid: false })
      emit('refresh')
    } catch (err) {
      console.error('❌ Update Payment Error:', err)
      event.target.checked = true
      showError('ไม่สามารถอัปเดตสถานะการชำระเงินได้', 'แก้ไขไม่สำเร็จ')
    }
    return
  }
  openPaymentModal(item, event.target)
}

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
  const data = [...props.bookings] // Use Props directly
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
const formatDateTime = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
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
