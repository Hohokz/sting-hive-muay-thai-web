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
            :value="localFilters.date"
            @input="update('date', $event.target.value)"
            class="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Place</label>
          <select
            :value="localFilters.gym"
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
            :value="localFilters.classType"
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
            :value="localFilters.scheduleId"
            @change="update('scheduleId', $event.target.value)"
            :disabled="!localFilters.date || isLoadingSchedules"
            class="w-full border rounded-md px-2 py-1.5 text-sm bg-white disabled:bg-gray-50"
          >
            <option value="">{{ isLoadingSchedules ? 'Loading...' : 'Any Slot' }}</option>
            <option v-for="sch in availableSchedules" :key="sch.id" :value="sch.id">
              {{ formatTime(sch.start_time) }} - {{ formatTime(sch.end_time) }} [{{
                sch.gym_enum === 'STING_HIVE' ? 'Hive' : 'Club'
              }}]
            </option>
          </select>
          <p v-if="!localFilters.date" class="text-[10px] text-red-400 mt-1">
            * Please select date first
          </p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
            >Search Name</label
          >
          <input
            type="text"
            :value="localFilters.name"
            @input="update('name', $event.target.value)"
            placeholder="Search name..."
            class="w-full border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div class="flex justify-end gap-2">
          <button
            @click="applyFilters"
            class="w-full bg-black text-white text-sm py-2.5 rounded-lg mt-2 font-medium hover:bg-white hover:text-black hover:border hover:border-black"
          >
            Apply Filters
          </button>
          <button
            @click="resetFilters"
            class="w-full bg-white text-black border border-black text-sm py-2.5 rounded-lg mt-2 font-medium hover:bg-gray-800 hover:text-white"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import bookingApi from '@/api/bookingApi'
const schedules = bookingApi.schedules

const filters = defineModel({
  default: () => ({
    date: '',
    scheduleId: '',
    classType: 'ALL',
    gym: 'ALL',
    name: '',
  }),
})

const isOpen = ref(false)
const availableSchedules = ref([])
const isLoadingSchedules = ref(false)

const getTodayDate = () => new Date().toISOString().split('T')[0]

// ✅ 1. ใช้ localFilters เก็บค่าไว้รอการกด Apply
const localFilters = ref({
  ...filters.value,
  date: filters.value.date || getTodayDate(),
})

const fetchAvailableSchedules = async () => {
  const date = localFilters.value.date
  if (!date) {
    availableSchedules.value = []
    return
  }

  try {
    isLoadingSchedules.value = true
    // ดึงข้อมูลจาก API ตาม วัน และ ยิม
    const res = await schedules.get({
      date,
      gym_enum: localFilters.value.gym === 'ALL' ? undefined : localFilters.value.gym,
    })

    const rawData = res.data.data || []

    // ✅ แก้ไขจุดนี้: ฟิลเตอร์เฉพาะเงื่อนไขหลัก (Active/Gym/ClassType)
    // โดย "ไม่เอาชื่อ (name)" มาฟิลเตอร์รายการใน Dropdown
    availableSchedules.value = rawData
      .filter((s) => {
        const isActive = s.is_active === true || s.is_active === 1
        const isCorrectGym =
          localFilters.value.gym === 'ALL' || s.gym_enum === localFilters.value.gym

        let isCorrectType = true
        if (localFilters.value.classType !== 'ALL') {
          const isPrivate = s.is_private_class === true || s.is_private_class === 1
          isCorrectType = localFilters.value.classType === 'PRIVATE' ? isPrivate : !isPrivate
        }

        // คืนค่าเฉพาะเงื่อนไขของตัว Slot เอง เพื่อให้รายการ Slot ไม่หายไปเวลาพิมพ์ชื่อ
        return isActive && isCorrectGym && isCorrectType
      })
      .sort((a, b) => {
        if (a.start_time < b.start_time) return -1
        if (a.start_time > b.start_time) return 1
        return a.gym_enum.localeCompare(b.gym_enum)
      })
  } catch (err) {
    console.error('Failed to fetch schedules:', err)
    availableSchedules.value = []
  } finally {
    isLoadingSchedules.value = false
  }
}

// ✅ 2. ปรับ update ให้ทำงานกับ localFilters และจัดการล้างค่าเมื่อเปลี่ยนวัน
const update = (key, value) => {
  localFilters.value[key] = value || ''

  if (key === 'date') {
    localFilters.value.scheduleId = ''
    localFilters.value.name = '' // เปลี่ยนวันแล้วล้างชื่อตามที่คุยกัน
    fetchAvailableSchedules()
  } else if (key === 'gym' || key === 'classType') {
    localFilters.value.scheduleId = '' // ล้าง Slot ที่เคยเลือกเพราะยิม/ประเภทเปลี่ยน
    fetchAvailableSchedules() // ดึงรายการ Slot ใหม่ตามยิม/ประเภทที่เลือก
  }
  // ถ้าเป็น key === 'name' ไม่ต้องทำอะไร รายการใน Dropdown จะไม่ขยับ
}

// ✅ 3. ฟังก์ชันส่งค่าออกไปข้างนอกเมื่อกด Apply (ไม่ปิด Modal)
const applyFilters = () => {
  filters.value = { ...localFilters.value }
  // ไม่ใส่ isOpen.value = false ตามโจทย์
}

const resetFilters = () => {
  const today = getTodayDate()
  localFilters.value = {
    date: today,
    scheduleId: '',
    classType: 'ALL',
    gym: 'ALL',
    name: '',
  }
  fetchAvailableSchedules()
  filters.value = { ...localFilters.value }
}

const formatTime = (time) => time?.slice(0, 5) || '--:--'

// เมื่อเปิด Modal ครั้งแรก ให้ดึง Schedules ล่าสุดตามค่าที่มีอยู่
watch(isOpen, (val) => {
  if (val) {
    if (!localFilters.value.date) {
      localFilters.value.date = getTodayDate()
    }
    fetchAvailableSchedules()
  }
})
</script>
