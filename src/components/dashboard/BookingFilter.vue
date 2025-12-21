<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
    >
      <span>🔍</span> Filter
      <span v-if="hasActiveFilters" class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4"
    >
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h3 class="font-bold text-gray-700">Filter Bookings</h3>
        <button @click="isOpen = false" class="text-gray-400 hover:text-gray-600 text-lg">
          &times;
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
          <input
            type="date"
            :value="filters.date"
            @input="update('date', $event.target.value)"
            class="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
              >From Hour</label
            >
            <select
              :value="filters.startTime"
              @change="update('startTime', $event.target.value)"
              class="w-full border rounded-md px-2 py-1.5 text-sm bg-white"
            >
              <option value="">Any</option>
              <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">To Hour</label>
            <select
              :value="filters.endTime"
              @change="update('endTime', $event.target.value)"
              class="w-full border rounded-md px-2 py-1.5 text-sm bg-white"
            >
              <option value="">Any</option>
              <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Class Type</label>
          <select
            :value="filters.classType"
            @change="update('classType', $event.target.value)"
            class="w-full border rounded-md px-3 py-1.5 text-sm bg-white"
          >
            <option value="ALL">All Classes</option>
            <option value="PRIVATE">Private Only</option>
            <option value="GROUP">Group Only</option>
          </select>
        </div>

        <button
          @click="isOpen = false"
          class="w-full bg-black text-white text-sm py-2.5 rounded-lg mt-2 font-medium hover:bg-gray-800"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ✅ ใช้ defineModel เพื่อเชื่อมกับ v-model ของตัวลูก (BookingTable)
const filters = defineModel({
  default: () => ({
    date: '',
    startTime: '',
    endTime: '',
    classType: 'ALL',
    gym: 'ALL',
  }),
})

const isOpen = ref(false)

const hasActiveFilters = computed(() => {
  if (!filters.value) return false
  const f = filters.value
  return f.date !== '' || f.startTime !== '' || f.endTime !== '' || f.classType !== 'ALL'
})

const update = (key, value) => {
  filters.value = { ...filters.value, [key]: value }
}

const hours = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return `${h}:00`
})
</script>
