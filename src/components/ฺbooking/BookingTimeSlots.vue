<template>
  <div>
    <div v-if="isReady && schedules.length > 0" class="time-grid">
      <button
        v-for="s in schedules"
        :key="s.id"
        @click="selectSchedule(s)"
        class="slot"
        :class="{ active: selectedId === s.id, full: s.available_seats === 0 }"
        :disabled="s.available_seats === 0"
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

      <div v-else-if="!loading">
        <h3>No classes available today</h3>
        <p>Please try selecting a different date or branch.</p>
      </div>

      <div v-else>
        <p>Loading schedules...</p>
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
})

const emit = defineEmits(['select'])

const { schedules, loading, fetchSchedules } = useSchedules()
const selectedId = ref(null)

// ✅ Computed: เช็คว่าเลือก input ครบหรือยัง
const isReady = computed(() => {
  return !!props.date && !!props.gym_enum
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
    // ถ้าข้อมูลไม่ครบ ให้เคลียร์ schedules ทิ้ง เพื่อให้เข้าเงื่อนไข v-else (แสดง Empty State)
    if (!date || !gym) {
      schedules.value = []
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
  selectedId.value = s.id
  emit('select', s)
}

const formatTime = (time) => {
  if (!time) return '-'
  return time.slice(0, 5)
}
</script>

<style scoped>
/* CSS เดิม */
.slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 10px;
  color: #9ca3af;
  opacity: 0.8;
  border-radius: 12px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s ease;
}

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

.time-text {
  font-size: 16px;
  font-weight: 500;
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
  color: white;
}

.active .seat-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.full {
  opacity: 0.6;
  cursor: not-allowed;
  background: #eee;
  border-color: #ddd;
}

/* --- Empty State --- */
.empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* กรอบเส้นประสีเข้มขึ้น ตามที่แก้เมื่อกี้ */
  border: 2px dashed #cbd5e1;
  background-color: #f8fafc;

  border-radius: 16px;
  padding: 48px 20px;
  color: #6b7280;
  text-align: center;
  margin-top: 10px;
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  color: #9ca3af;
  opacity: 0.8;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* เพิ่ม class สีแดงสำหรับ Error message */
.text-error {
  color: #ef4444 !important; /* สีแดง (Red-500) */
}
</style>
