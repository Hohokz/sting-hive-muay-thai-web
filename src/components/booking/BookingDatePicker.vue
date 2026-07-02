<template>
  <div class="space-y-4">

    <!-- Date Picker -->
    <input type="date" class="border px-3 py-2 rounded" :min="today" @change="$emit('select', $event.target.value)" />

    <!-- 7-day Quick Select -->
    <div class="date-list flex gap-2">
      <button v-for="d in days" :key="d" @click="$emit('select', d)"
        class="date-item px-3 py-2 border rounded hover:bg-gray-100">
        {{ d }}
      </button>
    </div>
  </div>
</template>

<script setup>
const today = new Date().toISOString().substring(0, 10);

const days = [...Array(7)].map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return date.toISOString().substring(0, 10);
});
</script>
