<template>
  <div class="w-full max-w-sm mt-5">
    <VueDatePicker v-model="localDate" inline :auto-apply="true" :clearable="false" :min-date="new Date()"
      :time-config="{ enableTimePicker: false }" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  modelValue: {
    type: [Date, String, null],
    default: null,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const localDate = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<style scoped>
:deep(.dp__time_toggle),
:deep(.dp__time_input),
:deep(.dp__time_picker),
:deep(.dp__overlay),
:deep(.dp__action_row),
:deep(.dp__clock_wrap) {
  display: none !important;
}
</style>
