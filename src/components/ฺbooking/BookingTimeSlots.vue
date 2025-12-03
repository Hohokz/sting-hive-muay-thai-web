<template>
  <div>
    <!-- ✅ ปุ่มเลือกช่วงเวลา -->
    <button v-for="s in schedules" :key="s.id" @click="selectSchedule(s)" class="slot"
      :class="{ active: selectedId === s.id }">
      {{ formatTime(s.start_time) }} - {{ formatTime(s.end_time) }}
    </button>

    <!-- ✅ แสดงค่าที่เลือก -->
    <p v-if="loading">Loading...</p>
    <p v-if="!loading && schedules.length === 0 && props == null">Not found class</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useSchedules } from "@/composables/useSchedules";

const props = defineProps({
  date: [String, Date, null],
  gym_enum: String,
  is_private_class: Boolean
});

const emit = defineEmits(["select"]);

const { schedules, loading, fetchSchedules } = useSchedules();
const selectedId = ref(null);

onMounted(() => {
  fetchSchedules({
    date: props.date,
    gym_enum: props.gym_enum,
    is_private_class: props.is_private_class
  });
});

watch(
  () => [props.date, props.gym_enum, props.is_private_class],
  ([date, gym, isPrivate]) => {

    // ถ้าค่ายังไม่ครบ → หยุดเลย ไม่ fetch
    if (!date || !gym || isPrivate === null) {
      schedules.value = [];  // เคลียร์เก่า
      return;
    }

    fetchSchedules({
      date,
      gym_enum: gym,
      is_private_class: isPrivate
    });
  },
  { immediate: true }
);

const selectSchedule = (s) => {
  selectedId.value = s.id;
  emit("select", s);
};

const formatTime = (time) => {
  if (!time) return "-";
  return time.slice(0, 5);
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
