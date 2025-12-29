<template>
  <div class="fixed inset-0 z-[1101] flex items-center justify-center p-4">
    <div
      class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-fadeIn"
      @click.stop
    >
      <div class="text-5xl mb-6">{{ icon }}</div>
      <h3 class="text-xl font-black text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-500 font-medium mb-8">
        {{ message }}
      </p>
      <div class="flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500 text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          :class="[
            'flex-1 py-3 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-transform hover:scale-105',
            confirmClass,
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  message: String,
  icon: { type: String, default: '🗑️' },
  confirmText: { type: String, default: 'Delete' },
  type: { type: String, default: 'danger' }, // danger, primary
  onConfirm: Function,
})

const emit = defineEmits(['close'])

const handleConfirm = () => {
  if (props.onConfirm) props.onConfirm()
  emit('close')
}

const confirmClass = computed(() => {
  return props.type === 'danger' ? 'bg-red-500 shadow-red-500/20' : 'bg-blue-600 shadow-blue-600/20'
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out;
}
</style>
