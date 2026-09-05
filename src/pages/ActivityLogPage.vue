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

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDetailModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fadeIn">
          <div class="p-6 bg-white border-b border-gray-100 flex items-start justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ getModalTitle(selectedLog) }}</h3>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                {{ selectedLog?.service }}
                <span v-if="selectedLogRecordId"> · #{{ String(selectedLogRecordId).slice(0, 8) }}</span>
              </p>
            </div>
            <button @click="showDetailModal = false" class="text-gray-400 hover:text-black p-2">
              <span class="text-2xl">×</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
            <!-- Who / when -->
            <div class="bg-white rounded-xl border border-gray-100 p-4 text-sm">
              <div class="flex justify-between text-gray-500">
                <span>{{ formatDateTime(selectedLog?.created_at) }}</span>
                <span class="font-bold text-gray-900">{{ selectedLog?.user_name || 'System' }}</span>
              </div>
            </div>

            <!-- Changes table, for update-style actions -->
            <div v-if="selectedLogChanges.length" class="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th class="px-4 py-2 text-left">Field</th>
                    <th class="px-4 py-2 text-left">Before</th>
                    <th class="px-4 py-2 text-left">After</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="change in selectedLogChanges" :key="change.key">
                    <td class="px-4 py-2 font-semibold text-gray-700">{{ change.label }}</td>
                    <td class="px-4 py-2 text-gray-500">{{ change.from }}</td>
                    <td class="px-4 py-2 text-gray-900 font-medium">{{ change.to }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Plain fields, for create/single-value actions -->
            <div
              v-else-if="plainDetailFields.length"
              class="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100"
            >
              <div
                v-for="field in plainDetailFields"
                :key="field.key"
                class="px-4 py-2 flex justify-between text-sm"
              >
                <span class="text-gray-500">{{ field.label }}</span>
                <span class="font-medium text-gray-900">{{ field.value }}</span>
              </div>
            </div>

            <div v-else class="text-center text-gray-400 italic text-sm py-6">
              No further details available.
            </div>

            <!-- Raw JSON, collapsed by default -->
            <div>
              <button
                @click="showRawJson = !showRawJson"
                class="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1"
              >
                {{ showRawJson ? '▾' : '▸' }} Raw JSON
              </button>
              <pre
                v-if="showRawJson"
                class="mt-2 bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto font-mono shadow-inner"
              >{{ JSON.stringify(selectedLog?.details, null, 2) }}</pre>
            </div>
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
import {
  formatDateTime,
  getLogDescription,
  getModalTitle,
  getPlainDetailFields,
  getSelectedLogChanges,
  getSelectedLogRecordId,
  serviceClass,
  getDisplayAction,
  getDisplayRole,
  roleClass,
  actionClass,
} from '@/utils/activityLogDisplay'

const logStore = useActivityLogStore()
const showDetailModal = ref(false)
const selectedLog = ref(null)
const showRawJson = ref(false)

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
  selectedLog.value = log
  showRawJson.value = false
  showDetailModal.value = true
}

const plainDetailFields = computed(() => getPlainDetailFields(selectedLog.value?.details))
const selectedLogChanges = computed(() => getSelectedLogChanges(selectedLog.value?.details))
const selectedLogRecordId = computed(() => getSelectedLogRecordId(selectedLog.value?.details))

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
