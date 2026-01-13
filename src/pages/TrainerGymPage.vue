<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Trainer Gym Management</h2>
          <p class="text-gray-500 text-sm">Assign trainers to specific gym locations</p>
        </div>
      </div>

      <!-- Gym Selection Tabs -->
      <div class="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-fit">
        <button
          v-for="gym in gyms"
          :key="gym.id"
          @click="selectGym(gym.id)"
          class="px-6 py-2.5 rounded-xl font-bold transition-all text-sm"
          :class="
            selectedGymId === gym.id
              ? 'bg-black text-white shadow-md'
              : 'text-gray-500 hover:text-black hover:bg-gray-50'
          "
        >
          {{ gym.name }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Current Trainers List -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 class="font-bold text-gray-800 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                Current Trainers at {{ currentGymName }}
              </h3>
              <span class="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {{ trainers.length }} Trainers
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th class="px-6 py-4">Trainer Details</th>
                    <th class="px-6 py-4">Username</th>
                    <th class="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-if="isLoading" class="animate-pulse">
                    <td colspan="3" class="py-20 text-center">
                      <div class="inline-block w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
                      <p class="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Trainers...</p>
                    </td>
                  </tr>
                  <tr v-else-if="trainers.length === 0">
                    <td colspan="3" class="py-20 text-center">
                      <p class="text-gray-400 font-medium">No trainers assigned to this gym yet.</p>
                    </td>
                  </tr>
                  <tr v-for="trainer in trainers" :key="trainer.id" class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-bold text-gray-900">{{ trainer.name }}</div>
                      <div class="text-[10px] text-gray-400">{{ trainer.email || 'No email' }}</div>
                    </td>
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">
                      @{{ trainer.username }}
                    </td>
                    <td class="px-6 py-4 text-center">
                      <button
                        @click="confirmRemove(trainer)"
                        class="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Add Trainer Section -->
        <div class="space-y-4">
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
            <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="text-lg">➕</span> Add to {{ currentGymName }}
            </h3>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Select available trainer
                </label>
                <div class="relative group">
                  <select
                    v-model="selectedUserId"
                    class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-black transition-all appearance-none text-sm font-medium"
                    :disabled="filteredAvailableUsers.length === 0"
                  >
                    <option value="" disabled>Choose a user...</option>
                    <option v-for="user in filteredAvailableUsers" :key="user.id" :value="user.id">
                      {{ user.name }} (@{{ user.username }})
                    </option>
                  </select>
                  <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
                    ▼
                  </div>
                </div>
                <p v-if="filteredAvailableUsers.length === 0 && !isLoadingUsers" class="text-[10px] text-amber-600 mt-1 ml-1 font-bold">
                  All users already have a gym assigned.
                </p>
              </div>

              <button
                @click="assignTrainer"
                :disabled="!selectedUserId || isAssigning"
                class="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
              >
                <span v-if="!isAssigning">Add to Gym</span>
                <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </button>
            </div>

            <div class="mt-8 p-4 bg-blue-50/50 rounded-2xl">
              <p class="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">💡 Tips</p>
              <p class="text-xs text-blue-800/70 leading-relaxed font-medium">
                Only users with the <span class="text-blue-600 font-bold">USER</span> role appear in the dropdown. To add an admin, change their role first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showConfirmModal = false"></div>
        <div class="relative bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl animate-scaleIn">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ⚠️
          </div>
          <h3 class="text-2xl font-black text-gray-900 mb-2">Remove Trainer?</h3>
          <p class="text-gray-500 mb-8 leading-relaxed font-medium">
            Are you sure you want to remove <span class="font-bold text-gray-900">{{ trainerToRemove?.name }}</span> from {{ currentGymName }}?
          </p>
          <div class="flex flex-col gap-3">
            <button
              @click="removeTrainer"
              :disabled="isRemoving"
              class="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span v-if="!isRemoving">Yes, Remove</span>
              <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </button>
            <button
              @click="showConfirmModal = false"
              class="w-full py-4 bg-gray-50 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div
        v-if="toast.show"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[11000] px-6 py-3 rounded-2xl shadow-2xl transform transition-all duration-300 flex items-center gap-3 border"
        :class="[
          toast.type === 'success' ? 'bg-white border-green-100 text-green-700' : 'bg-white border-red-100 text-red-700',
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        ]"
      >
        <span class="text-lg">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        <span class="font-bold text-sm tracking-tight">{{ toast.message }}</span>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import trainerGymApi from '@/api/trainerGymApi'

// ✅ CONFIG
const gyms = [
  { id: 1, name: 'STING CLUB' },
  { id: 2, name: 'STING HIVE' },
]

// ✅ STATE
const selectedGymId = ref(1)
const trainers = ref([])
const availableUsers = ref([])
const selectedUserId = ref('')
const isLoading = ref(false)
const isLoadingUsers = ref(false)
const isAssigning = ref(false)
const isRemoving = ref(false)

// Confirmation Modal State
const showConfirmModal = ref(false)
const trainerToRemove = ref(null)

// Toast State
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// ✅ COMPUTED
const currentGymName = computed(() => {
  const gym = gyms.find((g) => g.id === selectedGymId.value)
  return gym ? gym.name : ''
})

// Filter out users who already have a gym assigned
const filteredAvailableUsers = computed(() => {
  return availableUsers.value.filter(user => {
    // Exclude users who have gym_id or gym_enum set
    return !user.gym_id && !user.gym_enum
  })
})

// ✅ ACTIONS
const fetchGymTrainers = async () => {
  isLoading.value = true
  try {
    const res = await trainerGymApi.getGymTrainers(selectedGymId.value)
    // Response is expected to be an array of developers per user instructions
    trainers.value = Array.isArray(res.data) ? res.data : (res.data.data || [])
  } catch (err) {
    console.error('Fetch trainers error:', err)
    showToast('Failed to load trainers', 'error')
  } finally {
    isLoading.value = false
  }
}

const fetchAvailableUsers = async () => {
  isLoadingUsers.value = true
  try {
    const res = await trainerGymApi.getAvailableUsers()
    // data: Array ของ User { id, name, username, ... }
    availableUsers.value = res.data.data || res.data || []
  } catch (err) {
    console.error('Fetch available users error:', err)
  } finally {
    isLoadingUsers.value = false
  }
}

const selectGym = (id) => {
  selectedGymId.value = id
  fetchGymTrainers()
}

const assignTrainer = async () => {
  if (!selectedUserId.value) return
  isAssigning.value = true
  try {
    await trainerGymApi.assignTrainer(selectedUserId.value, selectedGymId.value)
    showToast('Trainer added successfully')
    selectedUserId.value = ''
    // Refresh both lists
    fetchGymTrainers()
    fetchAvailableUsers()
  } catch (err) {
    console.error('Assign error:', err)
    const msg = err.response?.data?.message || 'Failed to add trainer'
    showToast(msg, 'error')
  } finally {
    isAssigning.value = false
  }
}

const confirmRemove = (trainer) => {
  trainerToRemove.value = trainer
  showConfirmModal.value = true
}

const removeTrainer = async () => {
  if (!trainerToRemove.value) return
  isRemoving.value = true
  try {
    await trainerGymApi.removeTrainer(trainerToRemove.value.id, selectedGymId.value)
    showToast('Trainer removed from gym')
    showConfirmModal.value = false
    trainerToRemove.value = null
    // Refresh both lists
    fetchGymTrainers()
    fetchAvailableUsers()
  } catch (err) {
    console.error('Remove error:', err)
    showToast('Failed to remove trainer', 'error')
  } finally {
    isRemoving.value = false
  }
}

onMounted(() => {
  fetchGymTrainers()
  fetchAvailableUsers()
})
</script>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-scaleIn {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

select {
  background-image: none;
}
</style>
