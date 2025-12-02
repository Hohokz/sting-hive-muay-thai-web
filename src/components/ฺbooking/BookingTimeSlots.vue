<template>
  <div>
    <!-- ✅ ปุ่มเลือกช่วงเวลา -->
    <button v-for="s in schedules" :key="s.id" @click="selectSchedule(s)" class="slot"
      :class="{ active: selectedId === s.id }">
      {{ formatTime(s.start_time) }} - {{ formatTime(s.end_time) }}
    </button>

    <!-- ✅ แสดงค่าที่เลือก -->
    <p v-if="loading">Loading...</p>
    <p v-if="!loading && schedules.length === 0 && props == null">ไม่มีรอบให้จอง</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

/* ✅ รับค่าจาก Parent */
const props = defineProps({
  date: {
    type: [Date, String, null],
    required: true,
    default: null
  },
  gym_enum: {
    type: String,
    default: null
  },
});

/* ✅ ส่งค่ากลับไปให้ Parent */
const emit = defineEmits(["select"]);

const schedules = ref([]);
const loading = ref(false);

const selectedId = ref(null);
const selectedSchedule = ref(null);

/* ✅ Call API */
const fetchSchedules = async () => {
  try {
    loading.value = true;

    const params = {
      date: props.date,
      gym_enum: props.gym_enum // ✅ ส่งไปตรง ๆ แม้จะเป็น null
    };
    if (!props.date || !props.gym_enum) return;

    const res = await axios.get(
      "http://localhost:3000/api/v1/schedules/available",
      { params }
    );
    schedules.value = res.data.data || [];

    // ✅ reset ค่าเมื่อเปลี่ยนวัน
    selectedId.value = null;
    selectedSchedule.value = null;


  } catch (err) {
    console.error("Failed to load schedules:", err);
  } finally {
    loading.value = false;
  }
};


/* ✅ เมื่อคลิกเลือก */
const selectSchedule = (schedule) => {
  selectedId.value = schedule.id;
  selectedSchedule.value = schedule;

  // ✅ ส่งข้อมูลกลับไปหา Parent
  emit("select", {
    id: schedule.id,
    start_time: schedule.start_time,
    end_time: schedule.end_time
  });
};

/* ✅ โหลดครั้งแรก */
onMounted(fetchSchedules);

/* ✅ เปลี่ยนวัน → โหลดใหม่ */
watch(() => props.date, fetchSchedules);

/* ✅ format เวลา */
const formatTime = (time) => {
  return time.slice(0, 5); // "07:00:00" → "07:00"
};
</script>

<style scoped>
.slot {
  padding: 10px 14px;
  margin: 6px;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: #fff;
  transition: 0.2s;
}

.slot:hover {
  background: #f2f2f2;
}

.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}
</style>
