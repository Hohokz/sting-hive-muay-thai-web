<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p class="text-sm text-gray-500 font-medium">Monitor system activity and changes</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Date search input with clear button -->
          <div
            class="relative flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 h-[42px] min-w-[200px] hover:border-gray-400 transition-colors shadow-sm select-none cursor-pointer"
            @click="openDatePicker"
          >
            <span
              class="text-sm font-medium flex-grow mr-2 select-none pointer-events-none"
              :class="logStore.filters.date ? 'text-gray-900' : 'text-gray-400'"
            >
              {{ formattedDateDisplay }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <button
              v-if="logStore.filters.date"
              type="button"
              @click.stop="logStore.filters.date = ''"
              class="text-gray-400 hover:text-black font-semibold text-lg ml-1 px-1 transition-colors"
              title="Clear date filter"
            >
              ×
            </button>
            <!-- Hidden input: sr-only keeps it in the DOM so showPicker() works -->
            <input
              ref="dateInputRef"
              v-model="logStore.filters.date"
              type="date"
              class="sr-only"
              tabindex="-1"
              @click.stop
            />
          </div>

          <!-- Service dropdown selector -->
          <div class="relative flex items-center h-[42px] min-w-[160px]">
            <select
              v-model="logStore.filters.service"
              class="w-full h-full text-sm font-medium px-4 py-2 border-2 border-black rounded-xl outline-none bg-white text-gray-900 cursor-pointer appearance-none pr-10 transition-all focus:ring-2 focus:ring-black"
            >
              <option value="ALL">All Services</option>
              <option value="BOOKING">Bookings</option>
              <option value="SCHEDULE">Schedules</option>
              <option value="USER">Authentication</option>
            </select>
            <div class="absolute right-3.5 pointer-events-none text-black font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Refresh Button -->
          <button
            @click="logStore.fetchLogs"
            :disabled="logStore.loading"
            class="text-sm px-5 h-[42px] bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 font-semibold flex items-center justify-center"
          >
            <span v-if="logStore.loading" class="inline-block animate-spin mr-1.5">⟳</span>
            Refresh
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th class="px-6 py-4">Timestamp</th>
                <th class="px-6 py-4">User</th>
                <th class="px-6 py-4">Service</th>
                <th class="px-6 py-4">Action</th>
                <th class="px-6 py-4">Description</th>
                <th class="px-6 py-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="logStore.logs.length === 0 && !logStore.loading">
                <td colspan="6" class="px-6 py-10 text-center text-gray-400 italic">
                  No activity logs found.
                </td>
              </tr>
              <tr v-for="log in logStore.logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                  {{ formatDateTime(log.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-gray-900" :class="roleClass(getDisplayRole(log))">{{ log.user_name || log.admin_name || log.user?.name || log.details?.userName || 'System' }}</div>
                  <div class="text-[10px] uppercase font-bold" :class="roleClass(getDisplayRole(log))">{{ getDisplayRole(log) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 rounded-md text-[10px] font-bold uppercase"
                    :class="serviceClass(log.service || log.activity_logs_service || log.num_activity_logs_service)"
                  >
                    {{ log.service || log.activity_logs_service || log.num_activity_logs_service || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 rounded-md text-[10px] font-bold uppercase"
                    :class="actionClass(log.action, log)"
                  >
                    {{ getDisplayAction(log) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-500 max-w-xs truncate">
                  {{ getLogDescription(log) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    @click="viewDetails(log)"
                    class="text-blue-600 hover:text-blue-800 font-bold text-xs p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div class="text-xs text-gray-500 font-medium">
            Showing {{ (logStore.pagination.page - 1) * logStore.pagination.limit + 1 }} to {{ Math.min(logStore.pagination.page * logStore.pagination.limit, logStore.pagination.total) }} of {{ logStore.pagination.total }} entries
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="logStore.changePage(logStore.pagination.page - 1)"
              :disabled="logStore.pagination.page === 1"
              class="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 text-xs font-bold"
            >
              Previous
            </button>
            <span class="text-xs font-bold px-2">Page {{ logStore.pagination.page }} of {{ logStore.pagination.totalPages }}</span>
            <button
              @click="logStore.changePage(logStore.pagination.page + 1)"
              :disabled="logStore.pagination.page === logStore.pagination.totalPages"
              class="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 text-xs font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- JSON Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDetailModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fadeIn">
          <div class="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Log Details</h3>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Full response payload</p>
            </div>
            <button @click="showDetailModal = false" class="text-gray-400 hover:text-black p-2">
              <span class="text-2xl">×</span>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
            <pre class="bg-gray-900 text-green-400 p-6 rounded-2xl text-xs overflow-x-auto font-mono shadow-inner border-2 border-gray-800">
{{ JSON.stringify(selectedLogDetails, null, 2) }}
            </pre>
          </div>
          <div class="p-4 bg-white border-t border-gray-100 flex justify-end">
            <button
              @click="showDetailModal = false"
              class="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import { useActivityLogStore } from '@/stores/activityLog'

const logStore = useActivityLogStore()
const showDetailModal = ref(false)
const selectedLogDetails = ref(null)

/** Ref to the hidden date input — used to programmatically open the picker */
const dateInputRef = ref(null)

/** Open the native date picker via showPicker() for cross-browser reliability */
const openDatePicker = () => {
  dateInputRef.value?.showPicker?.()
}

/**
 * Format the stored YYYY-MM-DD value for display as MM / DD / YYYY,
 * matching the mockup. Shows a placeholder when no date is selected.
 */
const formattedDateDisplay = computed(() => {
  const d = logStore.filters.date
  if (!d) return 'DD / MM / YYYY'
  const [yyyy, mm, dd] = d.split('-')
  return `${mm} / ${dd} / ${yyyy}`
})

const viewDetails = (log) => {
  selectedLogDetails.value = log.details || log.metadata || log
  showDetailModal.value = true
}

const getLogDescription = (log) => {
  if (log.description) return log.description
  if (log.details?.description) return log.details.description

  // Custom mapping based on common actions
  const action = String(log.action).toUpperCase()
  if (action === 'LOGIN') return 'User logged into the system'
  if (action === 'LOGOUT') return 'User logged out'
  if (log.details?.booking_id) return `${action} Booking #${log.details.booking_id.slice(0, 8)}`
  if (log.details?.schedule_id) return `${action} Schedule #${log.details.schedule_id}`

  return '-'
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const serviceClass = (service) => {
  switch (String(service).toUpperCase()) {
    case 'BOOKING':
      return 'bg-blue-100 text-blue-700'
    case 'SCHEDULE':
      return 'bg-purple-100 text-purple-700'
    case 'AUTH':
    case 'USER':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getDisplayAction = (log) => {
  const action = String(log.action).toUpperCase()
  const details = log.details || {}

  // Extract all possible status fields
  const status = String(details.status || details.new_status || details.booking_status || '').toUpperCase()
  const paymentStatus = String(details.payment_status || details.new_payment_status || '').toUpperCase()

  // 1. PAYMENT detection
  if (
    action.includes('PAYMENT') ||
    action.includes('PAID') ||
    paymentStatus.includes('PAID') ||
    paymentStatus.includes('SUCCESS') ||
    status.includes('PAID')
  ) {
    return 'PAYMENT'
  }

  // 2. DELETE/CANCEL detection
  if (
    action === 'DELETE' ||
    action.includes('CANCEL') ||
    status.includes('CANCEL') ||
    status.includes('DELETE') ||
    status === 'VOID'
  ) {
    return 'DELETE'
  }

  // 3. General UPDATE
  if (action === 'UPDATE_STATUS' || action.includes('UPDATE')) return 'UPDATE'

  return log.action
}

const getDisplayRole = (log) => {
  if (log.user_role) return log.user_role
  if (log.role) return log.role
  if (log.user?.role) return log.user.role

  // Inference
  if (log.admin_name) return 'ADMIN'

  // Check if the name itself implies ADMIN
  const nameToCheck = (log.user_name || log.user?.name || log.details?.userName || '').toUpperCase()
  if (nameToCheck.includes('ADMIN')) return 'ADMIN'

  // If we have a user name but came here (no explicit role), it is likely a regular user
  if (log.user_name) return 'USER'

  // Default fallback
  return 'ADMIN'
}

const roleClass = (role) => {
  if (role === 'ADMIN') return 'text-red-600'
  return 'text-gray-400'
}

const actionClass = (action, log) => {
  const displayAction = getDisplayAction(log || { action }).toUpperCase()

  switch (displayAction) {
    case 'LOGIN':
      return 'bg-green-100 text-green-700'
    case 'LOGOUT':
      return 'bg-gray-100 text-gray-700'
    case 'CREATE':
      return 'bg-blue-100 text-blue-700'
    case 'UPDATE':
    case 'UPDATE_STATUS':
      return 'bg-yellow-100 text-yellow-700'
    case 'PAYMENT':
      return 'bg-indigo-100 text-indigo-700'
    case 'CANCEL':
    case 'DELETE':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

onMounted(() => {
  logStore.fetchLogs()
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.15s ease-out;
}
</style>
