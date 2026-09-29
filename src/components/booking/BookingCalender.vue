<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: String, default: null },
  // YYYY-MM-DD dates that can't be picked (e.g. the gym is closed)
  disabledDates: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const { locale, t } = useI18n()
const viewDate = ref(new Date())

// 1. ปรับการแสดงชื่อเดือนและปี
const currentMonthName = computed(() => {
  let langTag = 'en-US'
  if (locale.value === 'th') langTag = 'th-TH'
  if (locale.value === 'zh') langTag = 'zh-CN' // เพิ่มภาษาจีน

  const monthName = viewDate.value.toLocaleDateString(langTag, { month: 'long' })
  const year = viewDate.value.getFullYear()

  return `${monthName} ${year}`
})

// 2. ปรับชื่อวันในสัปดาห์ (Su, อา, 日)
const weekDays = computed(() => {
  if (locale.value === 'th') {
    return ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
  }
  if (locale.value === 'zh') {
    // ภาษาจีนมักเริ่มด้วย 日 (Sun) ถึง 六 (Sat)
    return ['日', '一', '二', '三', '四', '五', '六']
  }
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
})

const daysInMonth = computed(() => {
  return new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1).getDay()
})

const changeMonth = (step) => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + step, 1)
}

/** YYYY-MM-DD for a day of the month being viewed */
const dayKey = (day) => {
  const d = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), day)
  d.setHours(12, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

const disabledSet = computed(() => new Set(props.disabledDates))
const isClosed = (day) => disabledSet.value.has(dayKey(day))

const hasClosedDayInView = computed(() => {
  for (let day = 1; day <= daysInMonth.value; day++) {
    if (isClosed(day) && !isPast(day)) return true
  }
  return false
})

const selectDate = (day) => {
  if (isPast(day) || isClosed(day)) return
  emit('update:modelValue', dayKey(day))
}

const isDateSelected = (day) => {
  if (!props.modelValue) return false
  return dayKey(day) === props.modelValue
}

const isToday = (day) => {
  const now = new Date()
  return (
    now.getDate() === day &&
    now.getMonth() === viewDate.value.getMonth() &&
    now.getFullYear() === viewDate.value.getFullYear()
  )
}

const isPast = (day) => {
  const d = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), day)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return d < now
}
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm select-none w-full">
    <div class="flex justify-between items-center mb-6">
      <h3 class="font-bold text-gray-800 text-lg">{{ currentMonthName }}</h3>
      <div class="flex gap-2">
        <button
          @click="changeMonth(-1)"
          type="button"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          @click="changeMonth(1)"
          type="button"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-[11px] font-bold text-gray-400 text-center uppercase tracking-wider"
      >
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div v-for="blank in firstDayOfMonth" :key="'blank-' + blank" class="aspect-square"></div>
      <div
        v-for="day in daysInMonth"
        :key="day"
        @click="selectDate(day)"
        class="aspect-square flex flex-col items-center justify-center text-sm rounded-xl cursor-pointer transition-all relative"
        :class="[
          isDateSelected(day)
            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200'
            : isClosed(day) && !isPast(day)
              ? 'text-red-300 line-through bg-red-50/50 cursor-not-allowed'
              : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600',
          isPast(day) ? 'opacity-20 pointer-events-none' : '',
          isToday(day) && !isDateSelected(day) && !isClosed(day) ? 'text-blue-600 font-black' : '',
        ]"
        :title="isClosed(day) && !isPast(day) ? t('booking.gym_closed') : undefined"
        :aria-disabled="isPast(day) || isClosed(day)"
      >
        {{ day }}
        <div
          v-if="isToday(day)"
          class="w-1 h-1 rounded-full absolute bottom-1.5"
          :class="isDateSelected(day) ? 'bg-white' : 'bg-blue-600'"
        ></div>
      </div>
    </div>

    <p v-if="hasClosedDayInView" class="mt-3 text-xs text-red-400 flex items-center gap-1.5">
      <span class="line-through">15</span> = {{ t('booking.gym_closed') }}
    </p>
  </div>
</template>
