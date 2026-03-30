<template>
  <div>
    <div v-if="loading" class="empty-state">
      <div class="loader"></div>
      <p>{{ t('booking.loading_schedules') }}</p>
    </div>

    <div v-else-if="isReady && upcomingSchedules.length > 0" class="time-grid">
      <button
        v-for="s in upcomingSchedules"
        :key="s.id"
        @click="selectSchedule(s)"
        class="slot"
        :class="{
          active: selectedId === s.id,
          full: s.available_seats <= 0,
        }"
        :disabled="disabled || (!props.isAdminMode && s.available_seats <= 0)"
      >
        <span class="time-text">
          {{ formatTime(s.start_time) }} - {{ formatTime(s.end_time) }}
        </span>
        <span class="seat-badge"> ({{ t('booking.available') }} : {{ s.available_seats }}) </span>
      </button>
    </div>

    <div v-else class="empty-state">
      <svg
        class="empty-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.75 14.25l4.5-4.5m0 4.5l-4.5-4.5"
        />
      </svg>

      <div v-if="!gym_enum && !date">
        <h3>{{ waitingSelectionText }}</h3>
        <p class="text-error">{{ pleaseSelectPlaceDateText }}</p>
      </div>

      <div v-else-if="!gym_enum">
        <h3>{{ selectPlaceText }}</h3>
        <p class="text-error">{{ pleaseSelectPlaceText }}</p>
      </div>

      <div v-else-if="!date">
        <h3>{{ selectDateText }}</h3>
        <p class="text-error">{{ selectDateText }}</p>
      </div>

      <div v-else>
        <h3>{{ t('booking.no_classes') }}</h3>
        <p>{{ t('booking.try_different') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useSchedules } from '@/composables/useSchedules'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Computed translations to ensure reactivity
const waitingSelectionText = computed(() => t('booking.waiting_selection'))
const pleaseSelectPlaceDateText = computed(() => t('booking.please_select_place_date'))
const selectPlaceText = computed(() => t('booking.select_place'))
const pleaseSelectPlaceText = computed(() => t('booking.please_select_place'))
const selectDateText = computed(() => t('booking.select_date'))

const props = defineProps({
  date: [String, Date, null],
  gym_enum: String,
  is_private_class: Boolean,
  filterPastTime: {
    type: Boolean,
    default: false,
  },
  allowFullSelection: {
    type: Boolean,
    default: false,
  },
  isAdminMode: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'loading'])
const { schedules, loading, fetchSchedules } = useSchedules()

watch(loading, (val) => {
  emit('loading', val)
  if (val) {
    selectedId.value = null
  }
})

const selectedId = ref(null)
const isReady = computed(() => !!props.date && !!props.gym_enum)

const upcomingSchedules = computed(() => {
  if (!schedules.value || !Array.isArray(schedules.value)) return []
  let results = [...schedules.value]

  if (!props.isAdminMode) {
    results = results.filter((s) => s.available_seats > 0)
  }

  if (props.filterPastTime === false || !props.date) {
    return results
  }

  try {
    const now = new Date()
    const targetDate = new Date(props.date)
    const isSameDay = targetDate.toDateString() === now.toDateString()

    if (!isSameDay) return results

    return results.filter((s) => {
      if (!s.start_time) return true
      const parts = s.start_time.split(':')
      if (parts.length < 2) return true

      const [hours, minutes] = parts
      const classTime = new Date()
      classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      return classTime >= now
    })
  } catch (e) {
    console.error('Error filtering schedules:', e)
    return results
  }
})

onMounted(() => {
  if (isReady.value) {
    fetchSchedules({
      date: props.date,
      gym_enum: props.gym_enum,
      is_private_class: props.is_private_class,
    })
  }
})

watch(
  () => [props.date, props.gym_enum, props.is_private_class],
  ([date, gym, isPrivate]) => {
    console.log('BookingTimeSlots Props changed:', { date, gym, isPrivate })
    schedules.value = []
    if (!date || !gym) {
      console.warn('BookingTimeSlots: Ready check failed.', { date, gym })
      return
    }
    fetchSchedules({
      date,
      gym_enum: gym,
      is_private_class: isPrivate,
    })
  },
  { immediate: true },
)

const selectSchedule = (s) => {
  if (!props.isAdminMode && s.available_seats <= 0) {
    return
  }
  selectedId.value = s.id
  emit('select', s)
}

const formatTime = (time) => {
  if (!time) return '-'
  return time.slice(0, 5)
}
</script>

<style scoped>
.time-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 480px) {
  .time-grid {
    grid-template-columns: 1fr;
  }
}

.slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s ease;
}

.time-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}
.seat-badge {
  font-size: 13px;
  background-color: #f3f4f6;
  color: #666;
  padding: 4px 12px;
  border-radius: 20px;
}

.slot:hover {
  border-color: #2563eb;
  background-color: #f8faff;
}
.active {
  background: #2563eb;
  border-color: #2563eb;
}
.active .time-text,
.active .seat-badge {
  color: white;
}
.active .seat-badge {
  background-color: rgba(255, 255, 255, 0.2);
}

.full {
  opacity: 0.6;
  background: #eee;
}

.full.active {
  background: #2563eb !important;
  border-color: #2563eb !important;
  opacity: 1;
}

.full.active .time-text,
.full.active .seat-badge {
  color: white !important;
}

.empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e1;
  background-color: #f8fafc;
  border-radius: 16px;
  padding: 48px 20px;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  color: #9ca3af;
}
.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}
.text-error {
  color: #ef4444 !important;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
