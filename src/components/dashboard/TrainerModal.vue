<template>
  <div
    class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-8"
    @click.stop
  >
    <div class="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
    <h3 class="text-xl font-black text-gray-900 mb-1">Assign Trainer</h3>
    <p class="text-xs text-gray-400 mb-6 font-medium uppercase tracking-widest">
      Select trainer from system
    </p>

    <div class="mb-6 relative" ref="trainerLookupRef">
      <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Trainer Lookup</label>

      <div class="relative group">
        <input
          v-model="userSearchQuery"
          type="text"
          class="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
          placeholder="Search name or phone..."
          @focus="isDropdownOpen = true"
        />
        <button
          @click="isDropdownOpen = !isDropdownOpen"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-transform"
          :class="{ 'rotate-180': isDropdownOpen }"
        >
          ▼
        </button>
      </div>

      <div
        v-if="isDropdownOpen"
        class="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden"
      >
        <div
          v-for="user in searchedUsers"
          :key="user.id"
          @click="selectTrainer(user)"
          class="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center transition-colors"
        >
          <div>
            <div class="font-bold text-sm text-gray-800">{{ user.name }}</div>
            <div class="text-[10px] text-gray-500 font-mono">{{ user.phone }}</div>
          </div>
          <span class="text-blue-500 text-xs font-bold">Select</span>
        </div>

        <div v-if="searchedUsers.length === 0" class="p-4 text-center text-xs text-gray-400 italic">
          No matches found.
        </div>
      </div>
    </div>

    <div
      class="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between"
    >
      <div>
        <span class="text-[9px] font-black text-blue-400 uppercase block">Selected Trainer</span>
        <div class="font-bold text-blue-800">
          {{ trainerName || 'None Selected' }}
        </div>
      </div>
      <button
        v-if="trainerName"
        @click="trainerName = ''"
        class="text-blue-400 hover:text-red-500 text-xs"
      >
        Clear
      </button>
    </div>

    <div class="flex gap-3">
      <button
        @click="$emit('close')"
        class="flex-1 py-3 bg-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-200"
      >
        Cancel
      </button>
      <button
        @click="handleSave"
        :disabled="isSaving || !trainerName"
        class="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50"
      >
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '@/api/bookingApi'
import { useModalStore } from '@/stores/modal'
import StatusModal from '@/components/common/StatusModal.vue'

const props = defineProps({
  bookingId: { type: String, required: true },
  initialTrainerName: { type: String, default: '' },
  // Called with the saved trainer name after a successful save, so the
  // caller can refresh its own list.
  onSaved: Function,
})

const emit = defineEmits(['close'])

const modalStore = useModalStore()
const isSaving = ref(false)
const isDropdownOpen = ref(false)
const userSearchQuery = ref('')
const trainerName = ref(props.initialTrainerName)
const trainerLookupRef = ref(null)
const userList = ref([])

const searchedUsers = computed(() => {
  const list = Array.isArray(userList.value) ? userList.value : []
  const q = (userSearchQuery.value || '').toLowerCase().trim()
  if (!q) return list
  return list.filter(
    (user) =>
      user.name?.toLowerCase().includes(q) ||
      user.phone?.includes(q) ||
      user.username?.toLowerCase().includes(q),
  )
})

const fetchUsers = async () => {
  try {
    const response = await api.bookings.getTrainers()
    const actualData = response.data.data || response.data
    if (Array.isArray(actualData)) {
      userList.value = actualData.map((item) => {
        const raw = item.dataValues || item
        return {
          id: raw.id,
          name: raw.name || raw.username || (typeof raw === 'string' ? raw : ''),
          phone: raw.phone || '-',
          username: raw.username,
        }
      })
    }
  } catch (err) {
    console.error('❌ Fetch Trainers Error:', err)
  }
}

const selectTrainer = (user) => {
  trainerName.value = user.name || user.username
  userSearchQuery.value = user.name || user.username
  isDropdownOpen.value = false
}

const handleSave = async () => {
  if (!trainerName.value) return
  try {
    isSaving.value = true
    await api.bookings.updateTrainer(props.bookingId, { trainer_name: trainerName.value })
    props.onSaved?.(trainerName.value)
    emit('close')
  } catch (err) {
    console.error('❌ Save Trainer Error:', err)
    modalStore.open(StatusModal, {
      title: 'Update Failed',
      message: err.friendlyMessage || 'Could not update trainer.',
      type: 'error',
    })
  } finally {
    isSaving.value = false
  }
}

const handleClickOutside = (e) => {
  if (trainerLookupRef.value && !trainerLookupRef.value.contains(e.target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  fetchUsers()
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('touchstart', handleClickOutside)
})
</script>
