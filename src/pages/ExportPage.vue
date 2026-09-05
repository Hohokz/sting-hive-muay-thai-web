<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Data Management</h1>
        <p class="text-sm text-gray-500 font-medium">
          Export bookings or activity logs as Excel, or permanently delete old data by month
        </p>
      </div>

      <!-- Database usage banner -->
      <div
        class="rounded-xl border p-5 space-y-2"
        :class="isOverLimit ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 shadow-sm'"
      >
        <div class="flex items-center justify-between text-sm font-bold">
          <span :class="isOverLimit ? 'text-red-700' : 'text-gray-700'">Database Usage</span>
          <span v-if="dbSizeBytes !== null" :class="isOverLimit ? 'text-red-700' : 'text-gray-500'">
            {{ formatBytes(dbSizeBytes) }} / {{ formatBytes(DB_SIZE_WARNING_BYTES) }}
          </span>
        </div>
        <div class="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            class="h-full transition-all"
            :class="isOverLimit ? 'bg-red-500' : 'bg-black'"
            :style="{ width: `${Math.min(100, usagePercent)}%` }"
          ></div>
        </div>
        <p v-if="isOverLimit" class="text-xs text-red-600 font-semibold">
          ⚠ Database usage is over the {{ formatBytes(DB_SIZE_WARNING_BYTES) }} warning threshold.
          Consider deleting old bookings/activity logs below (export a copy first if you need to keep a record).
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthExportPicker
          title="Export Bookings"
          description="Download all bookings for the selected month as Excel"
          :available-months="bookings.months"
          :loading-months="bookings.loadingMonths"
          :busy="bookings.exporting"
          @action="bookings.exportMonth"
        />

        <MonthExportPicker
          title="Export Activity Logs"
          description="Download all activity logs for the selected month as Excel"
          :available-months="logs.months"
          :loading-months="logs.loadingMonths"
          :busy="logs.exporting"
          @action="logs.exportMonth"
        />

        <MonthExportPicker
          title="Delete Bookings"
          description="Permanently remove all bookings for the selected month"
          :available-months="bookings.months"
          :deletable-months="bookings.exportedMonths"
          :loading-months="bookings.loadingMonths"
          :busy="bookings.purging"
          action-label="Delete"
          variant="danger"
          @action="bookings.confirmPurge"
        />

        <MonthExportPicker
          title="Delete Activity Logs"
          description="Permanently remove all activity logs for the selected month"
          :available-months="logs.months"
          :deletable-months="logs.exportedMonths"
          :loading-months="logs.loadingMonths"
          :busy="logs.purging"
          action-label="Delete"
          variant="danger"
          @action="logs.confirmPurge"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import MonthExportPicker from '@/components/dashboard/MonthExportPicker.vue'
import { useModalStore } from '@/stores/modal'
import { api } from '@/api/bookingApi'
import { useMonthlyDataResource } from '@/composables/useMonthlyDataResource'

const modalStore = useModalStore()

const DB_SIZE_WARNING_BYTES = 500 * 1024 * 1024 // 500 MB

const dbSizeBytes = ref(null)

const isOverLimit = computed(() => dbSizeBytes.value !== null && dbSizeBytes.value > DB_SIZE_WARNING_BYTES)
const usagePercent = computed(() =>
  dbSizeBytes.value === null ? 0 : (dbSizeBytes.value / DB_SIZE_WARNING_BYTES) * 100,
)

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const refreshDbSize = async () => {
  try {
    const res = await api.dashboard.getDbSize()
    dbSizeBytes.value = res.data.data.bytes
  } catch (err) {
    console.error('Failed to load database size:', err)
  }
}

const bookings = reactive(
  useMonthlyDataResource({
    resourceApi: api.bookings,
    pluralLabel: 'bookings',
    recordNoun: 'booking',
    filenamePrefix: 'bookings',
    modalStore,
    onPurged: refreshDbSize,
  }),
)

const logs = reactive(
  useMonthlyDataResource({
    resourceApi: api.logs,
    pluralLabel: 'activity logs',
    recordNoun: 'log',
    filenamePrefix: 'activity_logs',
    modalStore,
    onPurged: refreshDbSize,
  }),
)

onMounted(() => {
  refreshDbSize()
  bookings.loadMonths()
  logs.loadMonths()
})
</script>
