<template>
  <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-fadeIn">
    <div class="text-4xl mb-4">{{ icon }}</div>
    <h3 class="text-xl font-black text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-sm text-gray-500 font-medium mb-6">{{ message }}</p>
    <button
      @click="handleButtonClick"
      class="w-full py-3 bg-black text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-black/10 hover:bg-gray-800 transition-colors"
    >
      {{ type === 'success' ? 'DONE' : 'GOT IT' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  message: String,
  type: {
    type: String,
    default: 'success', // success, error, warning
  },
})

const emit = defineEmits(['close', 'success'])

const handleButtonClick = () => {
  if (props.type === 'success') {
    emit('success')
  } else {
    emit('close')
  }
}

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return '✅'
    case 'error':
      return '⚠️'
    case 'warning':
      return '⚠️'
    default:
      return 'ℹ️'
  }
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
