import { ref } from 'vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import StatusModal from '@/components/common/StatusModal.vue'
import { downloadBlobResponse } from '@/utils/downloadBlob'

/** "YYYY-MM" -> { start_date: "YYYY-MM-01", end_date: "YYYY-MM-<last day>" } */
const monthToRange = (month) => {
  const [year, mon] = month.split('-').map(Number)
  const lastDay = new Date(year, mon, 0).getDate()
  return {
    start_date: `${month}-01`,
    end_date: `${month}-${String(lastDay).padStart(2, '0')}`,
  }
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Wires up the "load available months / export CSV / preview+confirm+purge"
 * flow used by each card on the Data Management page. Bookings and activity
 * logs expose the identical getExportMonths/getExportedMonths/exportCsv/
 * getPurgePreview/purge shape, so this is parametrized by resource instead
 * of duplicated per resource. A month is only deletable once it has been
 * exported at least once (enforced by the backend; exportedMonths mirrors
 * that here just to grey out ineligible months in the picker).
 *
 * @param {object} options
 * @param {object} options.resourceApi - api.bookings or api.logs
 * @param {string} options.pluralLabel - e.g. "bookings" / "activity logs", used in titles and error copy
 * @param {string} options.recordNoun - e.g. "booking" / "log", used in the purge-preview count message
 * @param {string} options.filenamePrefix - e.g. "bookings" / "activity_logs", used in the exported CSV filename
 * @param {object} options.modalStore
 * @param {() => void} [options.onPurged] - called after a successful purge (e.g. to refresh the DB size banner)
 */
export function useMonthlyDataResource({ resourceApi, pluralLabel, recordNoun, filenamePrefix, modalStore, onPurged }) {
  const months = ref([])
  const exportedMonths = ref([])
  const loadingMonths = ref(true)
  const exporting = ref(false)
  const purging = ref(false)

  const openStatus = (title, message, type = 'success') => {
    modalStore.open(StatusModal, { title, message, type })
  }

  const loadMonths = async () => {
    try {
      const [monthsRes, exportedRes] = await Promise.all([
        resourceApi.getExportMonths(),
        resourceApi.getExportedMonths(),
      ])
      months.value = monthsRes.data.data || []
      exportedMonths.value = exportedRes.data.data || []
    } catch (err) {
      console.error(`Failed to load ${pluralLabel} export months:`, err)
    } finally {
      loadingMonths.value = false
    }
  }

  const exportMonth = async (month) => {
    if (!month || exporting.value) return
    exporting.value = true
    try {
      const response = await resourceApi.exportCsv(monthToRange(month))
      downloadBlobResponse(response, `${filenamePrefix}_${month}.csv`)
      // This month is now eligible for deletion — refresh without waiting on it.
      resourceApi
        .getExportedMonths()
        .then((res) => { exportedMonths.value = res.data.data || [] })
        .catch((err) => console.error(`Failed to refresh exported ${pluralLabel} months:`, err))
    } catch (err) {
      console.error(`Failed to export ${pluralLabel}:`, err)
      openStatus('Error', `Failed to export ${pluralLabel}. Please try again.`, 'error')
    } finally {
      exporting.value = false
    }
  }

  const runPurge = async (month) => {
    purging.value = true
    try {
      const res = await resourceApi.purge(month)
      openStatus('Deleted', res.data.message || `${capitalize(pluralLabel)} deleted successfully.`)
      await loadMonths()
      onPurged?.()
    } catch (err) {
      console.error(`Failed to purge ${pluralLabel}:`, err)
      openStatus('Error', err.response?.data?.message || `Failed to delete ${pluralLabel}.`, 'error')
    } finally {
      purging.value = false
    }
  }

  const confirmPurge = async (month) => {
    if (!month || purging.value) return
    try {
      const res = await resourceApi.getPurgePreview(month)
      const count = res.data.data.count
      modalStore.open(ConfirmModal, {
        title: `Delete ${pluralLabel} for ${month}?`,
        message: `This will permanently delete ${count} ${recordNoun} record(s) from ${month}. This cannot be undone.`,
        confirmText: 'Delete Permanently',
        type: 'danger',
        onConfirm: () => runPurge(month),
      })
    } catch (err) {
      console.error('Failed to preview purge:', err)
      openStatus('Error', err.response?.data?.message || 'Failed to check how many records would be deleted.', 'error')
    }
  }

  return { months, exportedMonths, loadingMonths, exporting, purging, loadMonths, exportMonth, confirmPurge }
}
