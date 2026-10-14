<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <h2 class="text-lg font-semibold whitespace-nowrap">Schedules Management</h2>

      <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <button
          v-if="auth.isAdmin"
          @click="openViewAdvanceModal"
          class="w-full sm:w-auto justify-center text-sm px-4 py-2 bg-white border border-gray-500 text-black rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex items-center"
        >
          View Schedule In Advance
        </button>

        <button
          v-if="auth.isAdmin"
          @click="openAddAvanceModel"
          class="w-full sm:w-auto justify-center text-sm px-4 py-2 bg-white border border-gray-500 text-black rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex items-center"
        >
          Add Schedule In Advance
        </button>

        <button
          v-if="auth.isAdmin"
          @click="openAddModal"
          class="group w-full sm:w-auto justify-center text-sm px-4 py-2 bg-white border border-gray-500 text-black rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex items-center gap-2"
        >
          <img
            src="/dashboard/add-circle-svgrepo-com.svg"
            class="w-5 h-5 shrink-0 transition-all group-hover:brightness-0 group-hover:invert"
            alt="Add Schedule"
          />
          Add Schedule
        </button>

        <button
          v-if="auth.isAdmin"
          @click="openActiveScheduleModal"
          class="w-full sm:w-auto justify-center text-sm px-4 py-2 bg-white border border-gray-500 text-black rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex items-center"
        >
          Active Schedule
        </button>
      </div>
    </div>

    <!-- Advance rules in effect on the chosen date -->
    <div
      v-if="auth.isAdmin"
      class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-3 rounded-xl border"
      :class="rulesOnDate.length ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'"
    >
      <label class="flex items-center gap-2 text-sm font-medium text-gray-700 shrink-0">
        Rules on
        <input
          v-model="viewDate"
          type="date"
          class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
        />
        <button
          v-if="viewDate !== todayKey()"
          type="button"
          class="text-xs font-semibold text-blue-600 hover:underline"
          @click="viewDate = todayKey()"
        >
          Today
        </button>
      </label>
      <p v-if="rulesError" class="text-sm text-red-500">{{ rulesError }}</p>
      <p v-else-if="rulesOnDate.length" class="text-sm text-amber-800">
        <b>{{ rulesOnDate.length }}</b> advance rule(s) in effect
        {{ viewDate === todayKey() ? 'today' : `on ${formatDateKey(viewDate)}` }} — the capacity
        and status below show what customers get on this date.
        <button
          type="button"
          class="ml-1 font-semibold underline hover:text-amber-950"
          @click="openViewAdvanceModal"
        >
          View rules
        </button>
      </p>
      <p v-else class="text-sm text-gray-500">
        No advance rules {{ viewDate === todayKey() ? 'today' : `on ${formatDateKey(viewDate)}` }}
        — normal schedule applies.
      </p>
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
              <template v-if="ruleFor(item)?.type === 'CAPACITY'">
                <span class="text-gray-400 line-through mr-1">{{
                  item.capacity_data?.capacity ?? '-'
                }}</span>
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 cursor-help"
                  :title="ruleTooltip(ruleFor(item))"
                >
                  {{ ruleFor(item).capacity }}
                  <span class="text-[10px] font-semibold">{{ dateLabel }}</span>
                </span>
              </template>
              <template v-else>{{ item.capacity_data?.capacity ?? '-' }}</template>
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
              <button
                v-if="ruleFor(item)?.type === 'GYM_CLOSED' || ruleFor(item)?.type === 'CLASS_CLOSED'"
                type="button"
                class="ml-1 text-[10px] font-bold px-2 py-1 rounded uppercase"
                :class="
                  ruleFor(item).type === 'GYM_CLOSED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                "
                :title="ruleTooltip(ruleFor(item))"
                @click="openViewAdvanceModal"
              >
                {{ ruleFor(item).type === 'GYM_CLOSED' ? 'Gym closed' : 'Class closed' }}
                {{ dateLabel }}
              </button>
            </td>

            <td v-if="auth.isAdmin" class="px-2 text-center">
              <div class="flex justify-center gap-4">
                <button
                  @click="openEditModal(item)"
                  class="text-blue-500 hover:text-blue-700 text-lg transition-transform hover:scale-125"
                  title="Edit"
                >
                  <img src="/dashboard/edit-3-svgrepo-com.svg" alt="Edit" class="w-5 h-5" />
                </button>
                <button
                  @click="openHistoryModal(item)"
                  class="text-gray-500 hover:text-black transition-transform hover:scale-125"
                  title="History"
                  aria-label="History"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.8"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                <button
                  @click="handleDeleteClick(item.id)"
                  class="text-red-400 hover:text-red-600 text-lg transition-transform hover:scale-125"
                  title="Delete"
                >
                  <img src="/dashboard/delete-1-svgrepo-com.svg" alt="Delete" class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="scheduleStore.isLoading">
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
import { useScheduleStore } from '@/stores/schedule'
import EditScheduleModal from './EditScheduleModal.vue'
import AddAdvanceScheduleModal from './AddAdvanceScheduleModal.vue'
import ActiveScheduleModel from './ActiveScheduleModel.vue'
import ViewAdvanceScheduleModal from './ViewAdvanceScheduleModal.vue'
import ScheduleHistoryModal from './ScheduleHistoryModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import StatusModal from '@/components/common/StatusModal.vue'

const auth = useAuthStore()
const modalStore = useModalStore()
const scheduleStore = useScheduleStore()

// State
const sortKey = ref('start_time')
const sortOrder = ref('asc')

/* ================= ADVANCE RULES ================= */

// Local calendar date as YYYY-MM-DD (en-CA formats that way)
const todayKey = () => new Date().toLocaleDateString('en-CA')

const viewDate = ref(todayKey())
const advanceRules = ref([])
const rulesError = ref('')

const fetchAdvanceRules = async () => {
  if (!auth.isAdmin) return
  try {
    const res = await api.schedules.getAdvanced()
    const data = res.data?.data || {}
    advanceRules.value = [...(data.gym_closures || []), ...(data.capacity_adjustments || [])]
    rulesError.value = ''
  } catch (err) {
    console.error('Failed to load advance rules', err)
    rulesError.value = err.friendlyMessage || 'Could not load advance rules'
  }
}

const refreshAll = () => {
  scheduleStore.fetchSchedules()
  fetchAdvanceRules()
}

const ruleTypeOf = (r) => {
  if (r.rule_type) return r.rule_type
  if (!r.is_close_gym) return 'CAPACITY'
  return r.schedule_id ? 'CLASS_CLOSED' : 'GYM_CLOSED'
}

// Rule dates are stored as midnight UTC of the calendar day the admin
// picked, so the first 10 chars are that day. Both ends are inclusive —
// the same comparison the API uses when taking bookings.
const dateKeyOf = (d) => (d ? String(d).slice(0, 10) : '')

const rulesOnDate = computed(() =>
  advanceRules.value.filter(
    (r) => dateKeyOf(r.start_date) <= viewDate.value && viewDate.value <= dateKeyOf(r.end_date),
  ),
)

/**
 * The rule that decides this class on the chosen date — mirrors the API: a
 * whole-gym closure wins; otherwise the class's newest rule.
 */
const ruleFor = (schedule) => {
  const gymClosure = rulesOnDate.value.find(
    (r) => ruleTypeOf(r) === 'GYM_CLOSED' && r.gyms_id === schedule.gyms_id,
  )
  if (gymClosure) return { type: 'GYM_CLOSED', rule: gymClosure }

  const classRule = rulesOnDate.value
    .filter((r) => r.schedule_id === schedule.id)
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))[0]
  if (!classRule) return null

  return {
    type: ruleTypeOf(classRule),
    rule: classRule,
    capacity: classRule.capacity ?? classRule.new_capacity,
  }
}

const formatDateKey = (key) => {
  const [y, m, d] = key.split('-')
  return `${d}/${m}/${y}`
}

const dateLabel = computed(() =>
  viewDate.value === todayKey() ? 'today' : formatDateKey(viewDate.value).slice(0, 5),
)

const ruleTooltip = ({ rule }) => {
  const start = formatDateKey(dateKeyOf(rule.start_date))
  const end = formatDateKey(dateKeyOf(rule.end_date))
  const by = rule.created_by ? ` · by ${rule.created_by}` : ''
  return `Advance rule: ${start === end ? start : `${start} – ${end}`}${by}`
}

/* ================= ACTIONS ================= */

const openStatusModal = (title, message, type = 'success') => {
  modalStore.open(StatusModal, { title, message, type })
}

const openAddModal = () => {
  if (!auth.isAdmin) return
  modalStore.open(EditScheduleModal, {
    schedule: null,
    onSuccess: scheduleStore.fetchSchedules,
    onClose: () => modalStore.close(),
  })
}

const openEditModal = (item) => {
  if (!auth.isAdmin) return
  modalStore.open(EditScheduleModal, {
    schedule: item,
    onSuccess: scheduleStore.fetchSchedules,
    onClose: () => modalStore.close(),
  })
}

const openActiveScheduleModal = () => {
  if (!auth.isAdmin) return
  modalStore.open(ActiveScheduleModel, {
    'onClose': () => { modalStore.close(); scheduleStore.fetchSchedules() }
  })
}

const openViewAdvanceModal = () => {
  if (!auth.isAdmin) return
  modalStore.open(ViewAdvanceScheduleModal, {
    // Rules may have been edited/deleted inside
    onClose: () => {
      modalStore.close()
      fetchAdvanceRules()
    },
  })
}

const openAddAvanceModel = () => {
  if (!auth.isAdmin) return
  modalStore.open(AddAdvanceScheduleModal, {
    onSuccess: refreshAll,
    onClose: () => modalStore.close(),
  })
}

const openHistoryModal = (item) => {
  if (!auth.isAdmin) return
  modalStore.open(ScheduleHistoryModal, {
    scheduleId: item.id,
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
  const result = await scheduleStore.deleteSchedule(id)
  if (result.ok) {
    openStatusModal('Success', 'Schedule deleted successfully!')
  } else {
    openStatusModal('Error', result.message, 'error')
  }
}

/* ================= SORT & UTILS ================= */

const sortedSchedules = computed(() => {
  const data = [...scheduleStore.schedules]
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

onMounted(refreshAll)
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
