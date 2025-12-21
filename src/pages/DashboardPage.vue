<template>
  <DashboardLayout>
    <div class="space-y-10">
      <!-- ✅ STATS -->
      <DashboardStats />

      <!-- ✅ BOOKING -->
      <BookingTable :bookings="bookings" />

      <!-- ✅ SCHEDULE -->
      <ScheduleTable />
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import BookingTable from '@/components/dashboard/BookingTable.vue'
import ScheduleTable from '@/components/dashboard/ScheduleTable.vue'
import { ref, onMounted } from 'vue'
import { api } from '@/api/bookingApi'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const bookings = ref([])

const fetchBookings = async () => {
  try {
    const res = await api.dashboard.getDailyBookings(selectedDate.value)
    bookings.value = res.data.data
  } catch (err) {
    console.error('Failed to fetch dashboard bookings', err)
  }
}

onMounted(fetchBookings)
</script>
