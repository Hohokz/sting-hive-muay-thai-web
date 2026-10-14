<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
    @click.self="emit('close')"
  >
    <div
      class="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl animate-fadeIn max-h-[90vh] overflow-auto"
    >
      <h3 class="text-lg font-semibold mb-1">{{ tr('booking.private_setup') }}</h3>
      <p class="text-gray-500 text-sm">{{ tr('booking.private_setup_desc') }}</p>
      <p v-if="seatsLeft !== null" class="text-blue-600 text-sm font-semibold">
        {{ tr('booking.seats_left', { n: seatsLeft }) }}
      </p>
      <div class="mb-5"></div>

      <div class="space-y-4">
        <div v-for="field in fields" :key="field.key" class="flex items-center justify-between">
          <span class="text-gray-700 font-medium">{{ field.label }}</span>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-9 h-9 rounded-full border text-lg disabled:opacity-30"
              :disabled="field.value <= field.min"
              @click="field.set(field.value - 1)"
            >
              −
            </button>
            <span class="w-6 text-center text-lg font-semibold">{{ field.value }}</span>
            <button
              type="button"
              class="w-9 h-9 rounded-full border text-lg disabled:opacity-30"
              :disabled="field.value >= field.max"
              @click="field.set(field.value + 1)"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div class="border-t mt-5 pt-4 space-y-3">
        <p class="text-gray-600 text-sm">{{ tr('booking.request_trainer') }}</p>
        <p v-if="!canPickTrainers" class="text-gray-400 italic text-sm">
          {{ tr('booking.select_time_for_trainer') }}
        </p>
        <template v-else>
          <div v-for="(_, i) in draftTrainers" :key="i">
            <p class="text-gray-500 text-xs mb-1">{{ tr('booking.trainer_n', { n: i + 1 }) }}</p>
            <select v-model="draftTrainers[i]" class="w-full p-3 border rounded-md bg-white">
              <option value="">{{ tr('booking.no_preference') }}</option>
              <option
                v-for="trainer in trainerOptionsFor(trainerOptions, draftTrainers, i)"
                :key="trainer.id"
                :value="trainer.name"
              >
                {{ trainer.name }}
              </option>
            </select>
          </div>
        </template>
      </div>

      <div class="flex gap-3 mt-6">
        <button type="button" class="flex-1 py-2 rounded-lg border" @click="emit('close')">
          {{ tr('booking.cancel') }}
        </button>
        <button
          type="button"
          class="flex-1 py-2 rounded-lg bg-[#E84545] text-white font-semibold"
          @click="confirm"
        >
          {{ tr('booking.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  clampTrainers,
  resizeTrainerSlots,
  trainerOptionsFor,
  trainerRange,
} from '@/utils/privateClassSetup'

const props = defineProps({
  open: Boolean,
  students: { type: Number, default: 1 },
  trainerCount: { type: Number, default: 1 },
  selectedTrainers: { type: Array, default: () => [''] },
  trainerOptions: { type: Array, default: () => [] },
  maxStudents: { type: Number, default: 5 },
  // Shown as "N seats left"; null hides it
  seatsLeft: { type: Number, default: null },
  canPickTrainers: Boolean,
  // Forces a language regardless of the app locale (the admin UI is English-only)
  locale: { type: String, default: null },
})

const emit = defineEmits(['close', 'confirm'])

const { t } = useI18n()
const tr = (key, named = {}) =>
  props.locale ? t(key, named, { locale: props.locale }) : t(key, named)

// Draft, committed only on confirm
const draftStudents = ref(1)
const draftTrainerCount = ref(1)
const draftTrainers = ref([''])

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    draftStudents.value = Math.min(Math.max(props.students || 1, 1), props.maxStudents)
    draftTrainerCount.value = clampTrainers(props.trainerCount || 1, draftStudents.value)
    draftTrainers.value = resizeTrainerSlots(props.selectedTrainers, draftTrainerCount.value)
  },
  { immediate: true },
)

const setStudents = (n) => {
  draftStudents.value = n
  draftTrainerCount.value = clampTrainers(draftTrainerCount.value, n)
  draftTrainers.value = resizeTrainerSlots(draftTrainers.value, draftTrainerCount.value)
}

const setTrainerCount = (n) => {
  draftTrainerCount.value = n
  draftTrainers.value = resizeTrainerSlots(draftTrainers.value, n)
}

// Students are picked first; the trainer range follows from them
const fields = computed(() => [
  {
    key: 'students',
    label: tr('booking.student_count'),
    value: draftStudents.value,
    min: 1,
    max: props.maxStudents,
    set: setStudents,
  },
  {
    key: 'trainers',
    label: tr('booking.trainer_count'),
    value: draftTrainerCount.value,
    ...trainerRange(draftStudents.value),
    set: setTrainerCount,
  },
])

const confirm = () => {
  emit('confirm', {
    students: draftStudents.value,
    trainerCount: draftTrainerCount.value,
    trainers: [...draftTrainers.value],
  })
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
