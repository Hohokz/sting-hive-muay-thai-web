<template>
  <div
    class="bg-white rounded-3xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden animate-fadeIn"
    @click.stop
  >
    <!-- Header -->
    <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
      <div>
        <h3 class="text-xl font-black text-gray-900">Search Booking</h3>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-widest">
          Find bookings by client name
        </p>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-black transition-colors p-2"
      >
        <span class="text-2xl">×</span>
      </button>
    </div>

    <!-- Search Bar -->
    <div class="p-6 border-b border-gray-100 bg-white">
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          placeholder="Enter client name..."
          class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all"
          autofocus
        />
        <button
          @click="handleSearch"
          :disabled="loading"
          class="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-black/20"
        >
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>
    </div>

    <!-- Results List -->
    <div class="flex-1 overflow-y-auto bg-gray-50 p-4">
      <!-- Empty State when no search yet -->
      <div
        v-if="!hasSearched && !loading"
        class="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 py-12"
      >
        <div class="text-6xl mb-4">🔍</div>
        <p class="font-bold">Enter a name to search</p>
      </div>

      <BookingList
        v-else
        :bookings="results"
        :loading="loading"
        @refresh="handleSearch"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '@/api/bookingApi'
import BookingList from './BookingList.vue'

const emit = defineEmits(['close'])
const searchQuery = ref('')
const results = ref([])
const loading = ref(false)
const hasSearched = ref(false)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  loading.value = true
  hasSearched.value = true
  try {
    const res = await api.bookings.getByName(searchQuery.value)
    // Support multiple response structures
    const data = res.data.data || (Array.isArray(res.data) ? res.data : [])
    results.value = Array.isArray(data) ? data : [data]
  } catch (err) {
    console.error('Search Error', err)
    // Don't clear results immediately so user can retry, but maybe show error toast?
    // For now logging is enough, BookingList has empty state handling if results became empty
    if (results.value.length === 0) results.value = [] // reset if failed and empty?
  } finally {
    loading.value = false
  }
}

const handleCancel = async (id) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return
  try {
    await api.bookings.cancel(id)
    handleSearch() // Refresh list
  } catch (e) {
    console.error(e)
    alert('Failed to cancel')
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
