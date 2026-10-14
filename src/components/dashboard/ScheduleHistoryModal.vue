<template>
  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
    <div
      class="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-xl"
          >
            🕘
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 leading-tight">Class History</h3>
            <p class="text-sm text-gray-400 font-medium">{{ scheduleLabel(schedule) }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-black transition-colors p-2">
          <span class="text-2xl">✖</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
        <div v-if="loading" class="flex justify-center items-center h-40">
          <div class="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        </div>

        <p v-else-if="error" class="text-center text-red-500 py-12">{{ error }}</p>

        <template v-else>
          <ol class="relative border-l-2 border-gray-200 ml-3 space-y-5">
            <li v-for="entry in entries" :key="entry.key" class="ml-6">
              <span
                class="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full border-2 border-white"
                :class="entry.dotClass"
              ></span>
              <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                    :class="entry.badgeClass"
                  >
                    {{ entry.title }}
                  </span>
                  <span class="text-xs text-gray-400 font-mono">{{ formatDateTime(entry.at) }}</span>
                </div>
                <p class="mt-2 text-sm text-gray-800">{{ entry.description }}</p>
                <p class="mt-1 text-xs">
                  <span class="text-gray-400">by </span>
                  <span v-if="entry.by" class="font-bold text-gray-900">{{ entry.by }}</span>
                  <span v-else class="italic text-gray-400" title="This change was saved without the admin's name">
                    admin (name not recorded)
                  </span>
                </p>
              </div>
            </li>
          </ol>

          <p class="mt-6 text-xs text-gray-400 leading-relaxed">
            Shows changes made from the admin screens. Automatic changes made by the old advance-rule
            system (before the Sep 2026 fix) and Active/Inactive toggles were not recorded in detail.
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/bookingApi'
import { useScheduleStore } from '@/stores/schedule'
import { diffValues, formatDateTime, formatFieldValue } from '@/utils/activityLogDisplay'

const props = defineProps({
  scheduleId: { type: String, required: true },
})
defineEmits(['close'])

const scheduleStore = useScheduleStore()
const loading = ref(true)
const error = ref('')
const schedule = ref(null)
const logs = ref([])

const formatGym = (g) => (g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : g)

const scheduleLabel = (s) => {
  if (!s) return ''
  const type = s.is_private_class ? 'Private' : 'Group'
  return `${formatGym(s.gym_enum)} · ${s.start_time?.slice(0, 5)}–${s.end_time?.slice(0, 5)} · ${type}`
}

/** Another class, by id — for rules moved between classes */
const otherClassLabel = (id) => {
  const found = scheduleStore.schedules.find((s) => s.id === id)
  return found ? scheduleLabel(found) : 'another class (deleted)'
}

// Old logs record "API_CALL" when the admin's name wasn't passed through
const byName = (log) => (log.user_name && log.user_name !== 'API_CALL' ? log.user_name : null)

const dateRange = (d) => {
  if (!d.start_date && !d.end_date) return ''
  const start = formatFieldValue('start_date', d.start_date)
  const end = formatFieldValue('end_date', d.end_date)
  return start === end ? ` on ${start}` : ` for ${start} – ${end}`
}

/** "Class closed" / "Gym closed" / "Seats → 4" for an advance rule's values */
const describeRule = (d) => {
  if (d.is_close_gym) {
    const scheduleId = d.schedule_id ?? d.classes_schedule_id
    return scheduleId ? 'Class closed' : 'Whole gym closed'
  }
  return `Seats → ${d.capacity ?? '?'}`
}

const STYLE = {
  create: { badgeClass: 'bg-blue-100 text-blue-700', dotClass: 'bg-blue-500' },
  update: { badgeClass: 'bg-yellow-100 text-yellow-700', dotClass: 'bg-yellow-500' },
  delete: { badgeClass: 'bg-red-100 text-red-700', dotClass: 'bg-red-500' },
  rule: { badgeClass: 'bg-purple-100 text-purple-700', dotClass: 'bg-purple-500' },
}

const describeLog = (log) => {
  const d = log.details || {}
  switch (log.action) {
    case 'CREATE':
      return { ...STYLE.create, title: 'Class created', description: `Seats: ${d.capacity ?? '?'}` }
    case 'UPDATE': {
      const changes = diffValues(d.old_values, d.new_values)
      return {
        ...STYLE.update,
        title: 'Class edited',
        description: changes.length
          ? changes.map((c) => `${c.label}: ${c.from} → ${c.to}`).join(', ')
          : 'Saved with no change to time or seats (e.g. Active/Inactive)',
      }
    }
    case 'DELETE':
      return { ...STYLE.delete, title: 'Class deleted', description: '' }
    case 'CREATE_ADVANCED':
      return { ...STYLE.rule, title: 'Advance rule added', description: `${describeRule(d)}${dateRange(d)}` }
    case 'DELETE_ADVANCED':
      return { ...STYLE.rule, title: 'Advance rule removed', description: `${describeRule(d)}${dateRange(d)}` }
    case 'UPDATE_ADVANCED': {
      const oldV = d.old_values || {}
      const newV = d.new_values || {}
      if (oldV.classes_schedule_id === props.scheduleId && newV.classes_schedule_id !== props.scheduleId) {
        return {
          ...STYLE.rule,
          title: 'Advance rule moved away',
          description: `${describeRule(oldV)}${dateRange(oldV)} — moved to ${otherClassLabel(newV.classes_schedule_id)}`,
        }
      }
      if (newV.classes_schedule_id === props.scheduleId && oldV.classes_schedule_id !== props.scheduleId) {
        return {
          ...STYLE.rule,
          title: 'Advance rule moved here',
          description: `${describeRule(newV)}${dateRange(newV)} — from ${otherClassLabel(oldV.classes_schedule_id)}`,
        }
      }
      return {
        ...STYLE.rule,
        title: 'Advance rule edited',
        description: `${describeRule(oldV)}${dateRange(oldV)} → ${describeRule(newV)}${dateRange(newV)}`,
      }
    }
    default:
      return { ...STYLE.update, title: log.action, description: '' }
  }
}

const entries = computed(() => {
  const list = logs.value.map((log) => ({
    key: log.id,
    at: log.created_at,
    by: byName(log),
    ...describeLog(log),
  }))
  // The oldest classes predate activity logging — fall back to the row itself
  const hasCreateLog = logs.value.some((l) => l.action === 'CREATE')
  if (schedule.value && !hasCreateLog) {
    list.push({
      key: 'created',
      at: schedule.value.created_date,
      by: schedule.value.created_by !== 'API_CALL' ? schedule.value.created_by : null,
      title: 'Class created',
      description: '',
      ...STYLE.create,
    })
  }
  return list
})

onMounted(async () => {
  try {
    const res = await api.schedules.getHistory(props.scheduleId)
    schedule.value = res.data?.data?.schedule || null
    logs.value = res.data?.data?.logs || []
  } catch (err) {
    console.error('Failed to load class history', err)
    error.value = err.friendlyMessage || 'Could not load the history of this class'
  } finally {
    loading.value = false
  }
})
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
