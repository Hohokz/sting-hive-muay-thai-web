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
            :value="modelValue.date"
            @input="update('date', $event.target.value)"
            class="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
              >From Time</label
            >
            <input
              type="time"
              :value="modelValue.startTime"
              @input="update('startTime', $event.target.value)"
              class="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">To Time</label>
            <input
              type="time"
              :value="modelValue.endTime"
              @input="update('endTime', $event.target.value)"
              class="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Class Type</label>
          <select
            :value="modelValue.classType"
            @change="update('classType', $event.target.value)"
            class="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-black outline-none bg-white"
          >
            <option value="ALL">All Classes</option>
            <option value="PRIVATE">Private Only</option>
            <option value="GROUP">Group Only</option>
          </select>
        </div>

        <button
          @click="isOpen = false"
          class="w-full bg-black text-white text-sm py-2.5 rounded-lg mt-2 font-medium hover:bg-gray-800 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

const hasActiveFilters = computed(() => {
  const f = props.modelValue
  return f.date || f.startTime || f.endTime || f.classType !== 'ALL'
})

const update = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
