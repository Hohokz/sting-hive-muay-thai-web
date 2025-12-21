<template>
  <div class="grid md:grid-cols-4 gap-6">

    <div class="bg-white p-6 rounded-xl shadow">
      <p class="text-sm text-gray-500">Today Bookings</p>
      <p class="text-2xl font-bold">{{ summary.todayBooking }}</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow">
      <p class="text-sm text-gray-500">All Class</p>
      <p class="text-2xl font-bold">{{ summary.totalCapacityToday }}</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow">
      <p class="text-sm text-gray-500">Group Class</p>
      <p class="text-2xl font-bold">{{ summary.isNotPrivateCapacity }}</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow">
      <p class="text-sm text-gray-500">Private Class</p>
      <p class="text-2xl font-bold">{{ summary.isPrivateCapacity }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'localhost:3000';

const summary = ref({
  todayBooking: null,
  totalCapacityToday: null,
  isNotPrivateCapacity: null,
  isPrivateCapacity: null
});

const fetchSummary = async () => {
  try {
    const res = await axios.get(
      `${STING_HIVE_API_URL}/api/v1/dashboard/summary`
    );

    summary.value = res.data.data;
    console.log("✅ dashboard summary:", res.data.data);

  } catch (err) {
    console.error("❌ โหลด dashboard summary ไม่สำเร็จ:", err);
  }
};

onMounted(fetchSummary);
</script>
