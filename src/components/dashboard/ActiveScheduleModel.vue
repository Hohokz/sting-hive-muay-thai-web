<template>
  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
    <div
      class="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl"
          >
            📋
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 leading-tight">Active Class Management</h3>
            <p class="text-sm text-gray-400 font-medium">Manage which classes are active</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-black transition-colors p-2"
        >
          <span class="text-2xl">✖</span>
        </button>
      </div>

      <div class="flex-1 overflow-hidden flex flex-col bg-gray-50 p-4">
        <!-- Add action buttons here -->
        <div class="flex gap-2 mb-4 justify-end">
          <button :disabled="scheduleStore.isUpdatingAll" @click="setAllActiveStatus(true)" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="scheduleStore.isUpdatingAll" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else>✅</span> Active All
          </button>
          <button :disabled="scheduleStore.isUpdatingAll" @click="setAllActiveStatus(false)" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="scheduleStore.isUpdatingAll" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else>❌</span> Inactive All
          </button>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <div class="overflow-x-auto flex-1">
            <table class="w-full text-sm">
              <thead class="border-b bg-gray-50 sticky top-0 z-10">
                <tr class="text-left text-gray-600 select-none">
                  <th class="py-3 px-4 cursor-pointer hover:bg-gray-100" @click="setSort('gym_enum')">
                    Gym {{ sortIcon('gym_enum') }}
                  </th>
                  <th class="py-3 px-4 cursor-pointer hover:bg-gray-100" @click="setSort('start_time')">
                    Time {{ sortIcon('start_time') }}
                  </th>
                  <th class="py-3 px-4">Type</th>
                  <th class="py-3 px-4 text-center border-x">Capacity</th>
                  <th class="py-3 px-4 text-center">Active Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in sortedSchedules" :key="item.id" class="border-b hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 font-medium">{{ formatGym(item.gym_enum) }}</td>
                  <td class="px-4 font-mono">
                    {{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}
                  </td>
                  <td class="px-4">
                    <span
                      class="px-2 py-1 rounded text-[10px] font-bold uppercase"
                      :class="
                        item.is_private_class
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      "
                    >
                      {{ item.is_private_class ? 'Private' : 'Group' }}
                    </span>
                  </td>
                  <td class="px-4 text-center font-bold border-x text-gray-700">
                    {{ item.capacity_data?.capacity || '-' }}
                  </td>
                  <td class="px-4 text-center">
                    <div class="flex justify-center items-center">
                      <!-- เปลี่ยนมาเช็กสถานะการโหลดแยกรายตัวด้วย Object mapping -->
                      <div v-if="scheduleStore.updatingItems[item.id]" class="w-5 h-5 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                      <input
                        v-else
                        type="checkbox"
                        v-model="item.is_active"
                        @change="toggleActiveStatus(item)"
                        :disabled="scheduleStore.isUpdatingAll"
                        class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </td>
                </tr>

                <tr v-if="scheduleStore.isLoading">
                  <td colspan="5" class="py-12 text-center text-gray-400">
                    <div class="flex justify-center items-center">
                      <div class="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="sortedSchedules.length === 0">
                  <td colspan="5" class="py-12 text-center text-gray-400">
                    No schedules found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useScheduleStore } from '@/stores/schedule'
import StatusModal from '@/components/common/StatusModal.vue'

const props = defineProps({
  onSuccess: Function,
  onClose: Function
})

const modalStore = useModalStore()
const scheduleStore = useScheduleStore()

// State
const sortKey = ref('start_time')
const sortOrder = ref('asc')

const openStatusModal = (title, message, type = 'success') => {
  modalStore.open(StatusModal, { title, message, type })
}

/* ================= ACTIONS ================= */

const setAllActiveStatus = async (status) => {
  const result = await scheduleStore.setAllActiveStatus(status)
  
  if (result.ok) {
    if (result.noOp) {
      openStatusModal('Info', result.message, 'success')
    } else {
      if (props.onSuccess) {
        props.onSuccess()
      }
      openStatusModal('Success', `Successfully updated ${result.count} schedules`)
    }
  } else {
    openStatusModal('Error', result.message, 'error')
  }
}

const toggleActiveStatus = async (item) => {
  const result = await scheduleStore.toggleActiveStatus(item)
  if (result.ok) {
    openStatusModal('Success', 'Successfully updated schedule status')
  } else {
    openStatusModal('Error', result.message, 'error')
  }
}

/* ================= SORT & UTILS ================= */

const sortedSchedules = computed(() => {
  const data = [...scheduleStore.schedules]
  if (!sortKey.value) return data
  return data.sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    // จัดการกรณีข้อมูลเป็น Null หรือ Undefined เพื่อไม่ให้การ Sort พัง
    if (valA === undefined || valA === null) return 1
    if (valB === undefined || valB === null) return -1

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const setSort = (k) => {
  if (sortKey.value === k) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = k
    sortOrder.value = 'asc'
  }
}

const sortIcon = (k) => (sortKey.value !== k ? '↕' : sortOrder.value === 'asc' ? '↑' : '↓')
const formatTime = (t) => t?.slice(0, 5) || '--:--'
const formatGym = (g) => (g === 'STING_HIVE' ? 'Sting Hive' : g === 'STING_CLUB' ? 'Sting Club' : g || '-')

onMounted(() => {
  scheduleStore.fetchSchedules()
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
