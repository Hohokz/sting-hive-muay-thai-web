<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Schedules</h2>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b bg-gray-50">
          <tr class="text-left text-gray-600 select-none">
            <th class="py-2 px-2 cursor-pointer" @click="setSort('gym_enum')">
              Gym {{ sortIcon('gym_enum') }}
            </th>

            <th class="px-2 cursor-pointer" @click="setSort('start_time')">
              Time {{ sortIcon('start_time') }}
            </th>

            <th class="px-2 cursor-pointer" @click="setSort('is_private_class')">
              Type {{ sortIcon('is_private_class') }}
            </th>

            <th class="px-2 cursor-pointer" @click="setSort('capacity')">
              Capacity {{ sortIcon('capacity') }}
            </th>

            <th class="px-2 cursor-pointer" @click="setSort('is_active')">
              Status {{ sortIcon('is_active') }}
            </th>

            <th class="px-2 cursor-pointer" @click="setSort('created_date')">
              Created {{ sortIcon('created_date') }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in sortedSchedules" :key="item.id" class="border-b hover:bg-gray-50">
            <td class="py-2 px-2 font-medium">
              {{ formatGym(item.gym_enum) }}
            </td>

            <td class="px-2">
              {{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}
            </td>

            <td class="px-2">
              <span class="px-2 py-1 rounded text-xs font-semibold"
                :class="item.is_private_class ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'">
                {{ item.is_private_class ? 'Private' : 'Group' }}
              </span>
            </td>

            <td class="px-2">
              {{ item.capacity_data?.capacity || '-' }}
            </td>

            <td class="px-2">
              <span class="text-xs font-semibold px-2 py-1 rounded"
                :class="item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
                {{ item.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td class="px-2 text-gray-500">
              {{ formatDate(item.created_date) }}
            </td>
          </tr>

          <tr v-if="!loading && sortedSchedules.length === 0">
            <td colspan="6" class="text-center text-gray-400 py-6">
              No schedules found.
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="6" class="text-center py-6">
              Loading schedules...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const STING_HIVE_API_URL =
  import.meta.env.VITE_STING_HIVE_API_URL || "http://localhost:3000";

const schedules = ref([]);
const loading = ref(false);

const sortKey = ref("");
const sortOrder = ref("asc"); // asc | desc

const fetchSchedules = async () => {
  try {
    loading.value = true;
    const res = await axios.get(`${STING_HIVE_API_URL}/api/v1/schedules`);
    schedules.value = res.data.data;
  } catch (err) {
    console.error("❌ Fetch schedules failed:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSchedules);

/* ================= SORT SYSTEM ================= */

const setSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};

const sortedSchedules = computed(() => {
  const data = [...schedules.value];

  if (!sortKey.value) return data;

  return data.sort((a, b) => {
    let valA, valB;

    if (sortKey.value === "capacity") {
      valA = a.capacity_data?.capacity || 0;
      valB = b.capacity_data?.capacity || 0;
    } else {
      valA = a[sortKey.value];
      valB = b[sortKey.value];
    }

    if (valA < valB) return sortOrder.value === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder.value === "asc" ? 1 : -1;
    return 0;
  });
});

const sortIcon = (key) => {
  if (sortKey.value !== key) return "↕";
  return sortOrder.value === "asc" ? "↑" : "↓";
};

/* ================= UTIL ================= */

const formatTime = (time) => time?.slice(0, 5);

const formatGym = (gym) => {
  if (gym === "STING_HIVE") return "Sting Hive";
  if (gym === "STING_CLUB") return "Sting Club";
  return gym;
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};
</script>
