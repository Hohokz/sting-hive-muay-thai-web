<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p class="text-sm text-gray-500 font-medium">Monitor system activity and changes</p>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="filters.service"
            class="text-sm px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
          >
            <option value="ALL">All Services</option>
            <option value="BOOKING">Bookings</option>
            <option value="SCHEDULE">Schedules</option>
            <option value="USER">Authentication</option>
          </select>

          <button
            @click="fetchLogs"
            :disabled="loading"
            class="text-sm px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <span v-if="loading" class="inline-block animate-spin mr-1">⟳</span>
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
              <tr v-if="logs.length === 0 && !loading">
                <td colspan="6" class="px-6 py-10 text-center text-gray-400 italic">
                  No activity logs found.
                </td>
              </tr>
              <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                  {{ formatDateTime(log.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-gray-900">{{ log.user_name || log.admin_name || log.user?.name || log.details?.userName || 'System' }}</div>
                  <div class="text-[10px] text-gray-400 uppercase font-bold">{{ log.user_role || log.role || 'ADMIN' }}</div>
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
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} entries
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 text-xs font-bold"
            >
              Previous
            </button>
            <span class="text-xs font-bold px-2">Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
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
import { ref, onMounted, watch } from 'vue'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import { api } from '@/api/bookingApi'

const logs = ref([])
const loading = ref(false)
const showDetailModal = ref(false)
const selectedLogDetails = ref(null)

const filters = ref({
  service: 'ALL'
})

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

const fetchLogs = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      offset: (pagination.value.page - 1) * pagination.value.limit,
      service: filters.value.service !== 'ALL' ? filters.value.service : undefined,
    }

    console.log('🔍 Fetching logs with params:', params)
    const response = await api.logs.get(params)
    console.log('✅ Logs Response:', response.data)

    // Handle many possible structures: response.data.data, response.data.rows, response.data.items, or just response.data
    const data = response.data.data || response.data

    // If data is an array directly
    if (Array.isArray(data)) {
      logs.value = data
      pagination.value.total = response.data.total || response.data.count || data.length || 0
    } else {
      // If data is an object containing the array
      // Added data.logs based on console observation
      logs.value = data.logs || data.rows || data.items || data.data || []
      pagination.value.total = data.total || data.count || response.data.total || logs.value.length || 0
    }

    pagination.value.totalPages = Math.ceil(pagination.value.total / pagination.value.limit) || 1
    console.log('📊 Processed logs:', logs.value.length, 'Total:', pagination.value.total)
  } catch (err) {
    console.error('❌ Fetch Logs Error:', err)
  } finally {
    loading.value = false
  }
}

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.value.totalPages) {
    pagination.value.page = newPage
    fetchLogs()
  }
}

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

watch(() => filters.value.service, () => {
  pagination.value.page = 1
  fetchLogs()
})

onMounted(() => {
  fetchLogs()
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
