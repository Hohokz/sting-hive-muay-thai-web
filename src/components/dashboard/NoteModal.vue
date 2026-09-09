<template>
  <div
    class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-8"
    @click.stop
  >
    <div class="absolute top-0 left-0 w-full h-2 bg-black"></div>
    <h3 class="text-xl font-black text-gray-900 mb-1">Quick Note</h3>
    <p class="text-xs text-gray-400 mb-4 font-medium uppercase tracking-widest">
      Add or Edit Record Note
    </p>

    <textarea
      v-model="note"
      rows="5"
      class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black outline-none resize-none mb-6"
      placeholder="Type your notes here..."
    ></textarea>

    <div class="flex gap-3">
      <button
        @click="$emit('close')"
        class="flex-1 py-3 bg-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-200"
      >
        Cancel
      </button>
      <button
        @click="handleSave"
        :disabled="isSaving"
        class="flex-1 py-3 bg-black text-white rounded-2xl text-sm font-bold shadow-lg shadow-black/20 disabled:opacity-50"
      >
        {{ isSaving ? 'Saving...' : 'Save Note' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '@/api/bookingApi'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'

const props = defineProps({
  bookingId: { type: String, required: true },
  initialNote: { type: String, default: '' },
  // Called with the saved note text after a successful save, so the caller
  // can update its local list without waiting on a refetch.
  onSaved: Function,
})

const emit = defineEmits(['close'])

const modalStore = useModalStore()
const note = ref(props.initialNote)
const isSaving = ref(false)

const handleSave = async () => {
  try {
    isSaving.value = true
    await api.bookings.updateNote(props.bookingId, { note: note.value })
    props.onSaved?.(note.value)
    emit('close')
  } catch (err) {
    console.error('❌ Save Note Error:', err)
    modalStore.open(StatusModal, {
      title: 'Save Failed',
      message: 'Failed to save note. Please check your connection or if the API route exists.',
      type: 'error',
    })
  } finally {
    isSaving.value = false
  }
}
</script>
