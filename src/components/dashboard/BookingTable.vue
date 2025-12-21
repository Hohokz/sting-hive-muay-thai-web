<template>
  <div class="bg-white rounded-xl shadow p-6">
    <!-- ✅ HEADER -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Bookings</h2>

      <!-- ✅ REFRESH BUTTON -->
      <button @click="$emit('refresh')" class="text-sm px-4 py-2 bg-black text-white rounded-lg hover:opacity-80">
        Refresh
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b bg-gray-50">
          <tr class="text-left text-gray-600 select-none">
            <th class="py-2 px-2 cursor-pointer" @click="setSort('client_name')">
              Name {{ sortIcon('client_name') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('client_email')">
              Email {{ sortIcon('client_email') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('gym')">
              Gym {{ sortIcon('gym') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('time')">
              Time {{ sortIcon('time') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('is_private')">
              Type {{ sortIcon('is_private') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('capacity')">
              Capacity {{ sortIcon('capacity') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('booking_status')">
              Status {{ sortIcon('booking_status') }}
            </th>
            <th class="px-2 cursor-pointer" @click="setSort('date_booking')">
              Date {{ sortIcon('date_booking') }}
            </th>
            <th v-if="auth.isAdmin" class="px-2"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in sortedBookings" :key="item.id" class="border-b hover:bg-gray-50">
            <td class="py-2 px-2 font-medium">{{ item.client_name }}</td>
            <td class="px-2">{{ item.client_email }}</td>
            <td class="px-2">{{ formatGym(item.schedule?.gym_enum) }}</td>

            <td class="px-2">
              {{ formatTime(item.schedule?.start_time) }} -
              {{ formatTime(item.schedule?.end_time) }}
            </td>

            <td class="px-2">
              <span class="px-2 py-1 rounded text-xs font-semibold" :class="item.is_private
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-600'">
                {{ item.is_private ? 'Private' : 'Group' }}
              </span>
            </td>

            <td class="px-2">{{ item.capacity }}</td>

            <td class="px-2">
              <span class="text-xs px-2 py-1 rounded font-semibold" :class="item.booking_status === 'SUCCEED'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-600'">
                {{ item.booking_status }}
              </span>
            </td>

            <td class="px-2 text-gray-500">
              {{ formatDate(item.date_booking) }}
            </td>

            <td v-if="auth.isAdmin" class="px-2">
              <RouterLink :to="`/edit-booking/${item.id}`" class="text-blue-600 hover:underline">
                Edit
              </RouterLink>
            </td>
          </tr>

          <tr v-if="sortedBookings.length === 0">
            <td colspan="9" class="text-center text-gray-400 py-6">
              No bookings found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const props = defineProps({
  bookings: {
    type: Array,
    required: true
  }
});

/* ================= SORT SYSTEM ================= */

const sortKey = ref("");
const sortOrder = ref("asc");

const setSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};

const sortedBookings = computed(() => {
  const data = [...props.bookings];

  if (!sortKey.value) return data;

  return data.sort((a, b) => {
    let valA, valB;

    switch (sortKey.value) {
      case "gym":
        valA = a.schedule?.gym_enum;
        valB = b.schedule?.gym_enum;
        break;

      case "time":
        valA = a.schedule?.start_time;
        valB = b.schedule?.start_time;
        break;

      default:
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

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

const formatGym = (gym) => {
  if (gym === "STING_HIVE") return "Sting Hive";
  if (gym === "STING_CLUB") return "Sting Club";
  return gym;
};
</script>
