<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="group text-sm px-4 py-2 border border-gray-500 hover:border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white flex items-center gap-2 transition-colors"
    >
      <img
        src="/dashboard/find-svgrepo-com.svg"
        class="w-5 h-5 shrink-0 transition-all group-hover:brightness-0 group-hover:invert"
        alt="Filter"
      />
      Filter
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-x-0 mx-auto mt-2 w-[calc(100vw-2rem)] sm:absolute sm:right-0 sm:left-auto sm:inset-x-auto max-w-sm bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4"
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
            :value="filters.date"
            @input="update('date', $event.target.value)"
            class="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Place</label>
          <select
            :value="filters.gym"
            @change="update('gym', $event.target.value)"
            class="w-full border rounded-md px-3 py-1.5 text-sm bg-white"
          >
            <option value="ALL">All Places</option>
            <option value="STING_HIVE">Sting Hive</option>
            <option value="STING_CLUB">Sting Club</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Class Type</label>
          <select
            :value="filters.classType"
            @change="update('classType', $event.target.value)"
            class="w-full border rounded-md px-3 py-1.5 text-sm bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="PRIVATE">Private Only</option>
            <option value="GROUP">Group Only</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
            >Select Schedule Slot</label
          >
          <select
            :value="filters.scheduleId"
            @change="update('scheduleId', $event.target.value)"
            :disabled="!filters.date || isLoadingSchedules"
            class="w-full border rounded-md px-2 py-1.5 text-sm bg-white disabled:bg-gray-50"
          >
            <option value="">{{ isLoadingSchedules ? 'Loading...' : 'Any Slot' }}</option>
            <option v-for="sch in availableSchedules" :key="sch.id" :value="sch.id">
              {{ formatTime(sch.start_time) }} - {{ formatTime(sch.end_time) }} [{{
                sch.gym_enum === 'STING_HIVE' ? 'Hive' : 'Club'
              }}]
            </option>
          </select>
          <p v-if="!filters.date" class="text-[10px] text-red-400 mt-1">
            * Please select date first
          </p>
          <p
            v-if="filters.date && availableSchedules.length === 0 && !isLoadingSchedules"
            class="text-[10px] text-orange-500 mt-1"
          >
            No slots found for this date.
          </p>
        </div>

        <button
          @click="isOpen = false"
          class="w-full bg-black text-white text-sm py-2.5 rounded-lg mt-2 font-medium hover:bg-gray-800"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import bookingApi from '@/api/bookingApi'
const schedules = bookingApi.schedules

const filters = defineModel({
  default: () => ({
    date: '',
    scheduleId: '',
    classType: 'ALL',
    gym: 'ALL',
  }),
})

const isOpen = ref(false)
const availableSchedules = ref([])
const isLoadingSchedules = ref(false)

// 📡 ฟังก์ชันดึง Schedules ตามวันที่และยิม
const fetchAvailableSchedules = async () => {
  const date = filters.value.date
  if (!date) {
    availableSchedules.value = []
    return
  }

  try {
    isLoadingSchedules.value = true

    // ✅ ส่งทั้ง date และ gym_enum ไปกรองที่ Backend
    const res = await schedules.get({
      date,
      gym_enum: filters.value.gym === 'ALL' ? undefined : filters.value.gym,
    })

    const rawData = res.data.data || []

    // ✅ ทำการ Filter และต่อด้วย Sort ทันที
    availableSchedules.value = rawData
      .filter((s) => {
        const isActive = s.is_active === true || s.is_active === 1
        const isCorrectGym = filters.value.gym === 'ALL' || s.gym_enum === filters.value.gym

        // ✅ เพิ่มการกรองตาม Class Type (Private/Group)
        let isCorrectType = true
        if (filters.value.classType !== 'ALL') {
          const isPrivate = s.is_private_class === true || s.is_private_class === 1
          isCorrectType = filters.value.classType === 'PRIVATE' ? isPrivate : !isPrivate
        }

        return isActive && isCorrectGym && isCorrectType
      })
      .sort((a, b) => {
        // ✅ เรียงตามเวลาเริ่ม (start_time)
        // เนื่องจากเป็น String "08:00", "09:00" สามารถใช้การเทียบ String ได้เลย
        if (a.start_time < b.start_time) return -1
        if (a.start_time > b.start_time) return 1

        // ถ้าเวลาเท่ากัน ให้เรียงตามชื่อยิมต่อ (Hive ก่อน Club หรือตามตัวอักษร)
        return a.gym_enum.localeCompare(b.gym_enum)
      })
  } catch (err) {
    console.error('Failed to fetch schedules for filter:', err)
    availableSchedules.value = []
  } finally {
    isLoadingSchedules.value = false
  }
}

// 👀 เฝ้าดูวันที่ และ ยิม (ถ้าเปลี่ยนยิม รายการเวลาก็ต้องเปลี่ยน)
watch(
  [() => filters.value.date, () => filters.value.gym, () => filters.value.classType],
  ([newDate]) => {
    // ✅ จุดสำคัญ: เมื่อวันที่หรือยิมเปลี่ยน ต้องล้าง ID เก่าทิ้งทันที!
    filters.value = { ...filters.value, scheduleId: '' }
    if (newDate) {
      fetchAvailableSchedules()
    }
  },
  { immediate: true },
)

const update = (key, value) => {
  const newFilters = { ...filters.value, [key]: value }
  // ✅ ถ้าเปลี่ยนวันที่ ให้ล้าง scheduleId ในก้อนใหม่ด้วย
  if (key === 'date') newFilters.scheduleId = ''
  filters.value = newFilters
}

const formatTime = (time) => time?.slice(0, 5) || '--:--'
</script>
