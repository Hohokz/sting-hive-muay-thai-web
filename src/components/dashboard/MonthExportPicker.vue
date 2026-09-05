<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
    <div>
      <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
      <p class="text-sm text-gray-500">{{ description }}</p>
    </div>

    <div v-if="loadingMonths" class="text-sm text-gray-400 italic py-4">Loading available months…</div>

    <div v-else-if="years.length === 0" class="text-sm text-gray-400 italic py-4">
      No data available yet.
    </div>

    <template v-else>
      <!-- Year selector -->
      <div class="flex items-center gap-2">
        <button
          v-for="year in years"
          :key="year"
          @click="selectedYear = year"
          class="px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
          :class="
            selectedYear === year
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          {{ year }}
        </button>
      </div>

      <!-- Month grid -->
      <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
        <button
          v-for="month in monthsOfSelectedYear"
          :key="month.value"
          :disabled="!month.selectable"
          :title="month.reason"
          @click="selectedMonth = month.value"
          class="px-2 py-2 rounded-lg text-xs font-bold border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :class="
            selectedMonth === month.value
              ? selectedClass
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
          "
        >
          {{ month.label }}
        </button>
      </div>

      <p v-if="deletableMonths !== null" class="text-xs text-gray-400">
        A month must be exported at least once before it can be deleted.
      </p>

      <button
        @click="$emit('action', selectedMonth)"
        :disabled="!selectedMonth || busy"
        class="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        :class="buttonClass"
      >
        {{ busy ? `${actionLabel}…` : selectedMonth ? `${actionLabel} ${selectedMonth}` : 'Select a month' }}
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  // Months that actually have data, as "YYYY-MM" strings.
  availableMonths: { type: Array, default: () => [] },
  // Months that are actually eligible for deletion, as "YYYY-MM" strings
  // (null = no restriction, used for the export pickers). When provided, a
  // month with data is only selectable if it's also in this list — used to
  // require "this month has been exported before" ahead of deleting it.
  deletableMonths: { type: Array, default: null },
  loadingMonths: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  actionLabel: { type: String, default: 'Export' },
  variant: { type: String, default: 'default' }, // 'default' | 'danger'
})

defineEmits(['action'])

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const buttonClass = computed(() =>
  props.variant === 'danger'
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-black text-white hover:bg-gray-800',
)
const selectedClass = computed(() =>
  props.variant === 'danger'
    ? 'bg-red-600 text-white border-red-600'
    : 'bg-blue-600 text-white border-blue-600',
)

const availableSet = computed(() => new Set(props.availableMonths))

// Years that actually have at least one available month, newest first.
const years = computed(() => {
  const set = new Set(props.availableMonths.map((m) => m.slice(0, 4)))
  return [...set].sort().reverse()
})

const selectedYear = ref(null)
const selectedMonth = ref(null)

// Default to the current calendar year if it has any data (e.g. bookings
// made in advance can push the "most recent year with data" into next year,
// which would otherwise open on a confusing future year on first load) —
// falling back to the newest year with data if the current year has none.
watch(
  years,
  (newYears) => {
    if (!selectedYear.value && newYears.length) {
      const currentYear = String(new Date().getFullYear())
      selectedYear.value = newYears.includes(currentYear) ? currentYear : newYears[0]
    }
  },
  { immediate: true },
)

const deletableSet = computed(() =>
  props.deletableMonths === null ? null : new Set(props.deletableMonths),
)

const monthsOfSelectedYear = computed(() => {
  if (!selectedYear.value) return []
  return MONTH_LABELS.map((label, i) => {
    const value = `${selectedYear.value}-${String(i + 1).padStart(2, '0')}`
    const hasData = availableSet.value.has(value)
    const isRestricted = deletableSet.value !== null && !deletableSet.value.has(value)
    return {
      value,
      label,
      selectable: hasData && !isRestricted,
      reason: !hasData ? 'No data' : isRestricted ? 'Not exported yet' : '',
    }
  })
})

// Selecting a different year clears any month choice that no longer applies.
watch(selectedYear, () => {
  selectedMonth.value = null
})
</script>
