<template>
  <div>
    <div v-if="loading" class="empty-state">
      <div class="loader"></div>
      <p>Loading schedules...</p>
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
        <span class="seat-badge"> (Available : {{ s.available_seats }}) </span>
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
        <h3>Waiting for Selection</h3>
        <p class="text-error">Please select a Place and Date first.</p>
      </div>

      <div v-else-if="!gym_enum">
        <h3>Select Place</h3>
        <p class="text-error">Please select a Place first.</p>
      </div>

      <div v-else-if="!date">
        <h3>Select Date</h3>
        <p class="text-error">Please select a Date first.</p>
      </div>

      <div v-else>
        <h3>No classes available</h3>
        <p>Please try selecting a different date or branch.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useSchedules } from '@/composables/useSchedules'

const props = defineProps({
  date: [String, Date, null],
  gym_enum: String,
  is_private_class: Boolean,
  // ✅ เพิ่ม Prop นี้เข้ามา (Default เป็น false คือโชว์หมด)
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

// ✅ Emit loading state to parent
watch(loading, (val) => {
  emit('loading', val)
  if (val) {
    selectedId.value = null
  }
})

const selectedId = ref(null)

// ✅ Check if inputs are ready
const isReady = computed(() => !!props.date && !!props.gym_enum)

// ✅ Filter upcoming schedules
// ✅ Filter upcoming schedules (แก้ใหม่ Logic แข็งโป๊ก)
const upcomingSchedules = computed(() => {
  // 1. ถ้าไม่มี Data กลับไปเลย
  if (!schedules.value) return []

  let results = schedules.value

  // ✅ 1.5 Filter Full Slots (unless Admin)
  if (!props.isAdminMode) {
    results = results.filter((s) => s.available_seats > 0)
  }

  // 🔴 DEBUG MODE: เช็คค่ากันชัดๆ (กด F12 ดูได้เลย)
  // 2. เช็คแบบหักดิบ: ถ้าค่าเป็น false ให้ Return ทั้งก้อนทันที!
  if (props.filterPastTime === false) {
    return results
  }

  // --- โซนกรอง (ทำงานเมื่อเป็น true เท่านั้น) ---
  if (!props.date) return results // กันเหนียว ถ้าไม่มีวันที่ก็โชว์หมด

  const now = new Date()
  const targetDate = new Date(props.date)

  // แปลงเป็น YYYY-MM-DD เพื่อเทียบว่าเป็น "วันนี้" หรือไม่ (ตัดเรื่องเวลา/Timezone ทิ้ง)
  const isSameDay = targetDate.toDateString() === now.toDateString()

  return results.filter((s) => {
    // ถ้าไม่ใช่วันนี้ -> เอาหมด
    if (!isSameDay) return true

    // ถ้าเป็นวันนี้ -> เช็คเวลา
    const [hours, minutes] = s.start_time.split(':')

    // สร้างเวลาของคลาส โดยอิงจากวันที่ปัจจุบันของเครื่อง User (เพื่อความชัวร์)
    const classTime = new Date()
    classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // ถ้าเวลาคลาส < เวลาปัจจุบัน -> ซ่อน
    if (classTime < now) {
      return false
    }

    return true
  })
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
    schedules.value = [] // Clear data
    if (!date || !gym) return

    fetchSchedules({
      date,
      gym_enum: gym,
      is_private_class: isPrivate,
    })
  },
  { immediate: true },
)

const selectSchedule = (s) => {
  // ✅ Prevent selection if full (and not Admin)
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

/* ✅ เพิ่ม CSS นี้เพื่อให้ Admin เห็นว่าเลือกช่องที่เต็มอยู่ */
.full.active {
  background: #2563eb !important; /* สีน้ำเงินเดียวกับปุ่มปกติ */
  border-color: #2563eb !important;
  opacity: 1; /* ดึงความชัดกลับมาตอนเลือก */
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

/* 🌀 Spinner Loader */
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
