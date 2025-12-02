<template>
  <div class="w-full min-h-screen bg-[#f7f9fc] flex items-center justify-center p-6">
    <div class="bg-white rounded-xl shadow p-6 w-full max-w-md space-y-6">

      <h1 class="text-xl font-semibold text-center">Find Your Booking</h1>

      <!-- ✅ EMAIL INPUT -->
      <div>
        <p class="text-sm text-gray-600 mb-1">Email</p>
        <input v-model="email" type="email" class="w-full p-3 border rounded-md" placeholder="Enter your email" />
        <p v-if="email && !email.includes('@')" class="text-xs text-red-500 mt-1">
          Email format ไม่ถูกต้อง
        </p>
      </div>

      <!-- ✅ BUTTON -->
      <div class="flex flex-col md:flex-row gap-4">

        <button class="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          @click="resetAll">
          Back
        </button>
        <button class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          :disabled="isLoading || !email || !email.includes('@')" @click="searchBooking">
          <span v-if="!isLoading">Search Booking</span>
          <span v-else>Searching...</span>
        </button>
      </div>

      <!-- ✅ RESULT -->
      <div v-if="bookings.length" class="border-t pt-4 space-y-3">
        <h2 class="font-semibold text-gray-700">Your Bookings</h2>

        <div v-for="b in bookings" :key="b.id" class="border p-3 rounded-md flex items-center justify-between">
          <div class="text-sm">
            <p><b>Date:</b> {{ b.date_booking }}</p>
            <p><b>Time:</b> {{ b.schedule.start_time }} - {{ b.schedule.end_time }}</p>
            <p><b>Place:</b> {{ b.schedule.gym_enum }}</p>
          </div>

          <router-link :to="`/edit-booking/${b.id}`" class="bg-green-600 text-white px-3 py-1 rounded text-sm">
            Edit
          </router-link>
        </div>
      </div>

      <p v-if="searched && !bookings.length" class="text-center text-red-500 text-sm">
        ❌ ไม่พบ Booking ของ Email นี้
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const bookings = ref([]);
const isLoading = ref(false);
const searched = ref(false);

const resetAll = () => {
  sessionStorage.clear()
  router.push("/")
}

const searchBooking = async () => {
  try {
    isLoading.value = true;
    searched.value = false;
    bookings.value = [];

    const res = await axios.get(
      `http://localhost:3000/api/v1/bookings?client_email=${email.value}`
    );

    console.log(res.data.data);

    bookings.value = res.data.data || [];
    searched.value = true;

  } catch (err) {
    console.error(err);
    alert("❌ ค้นหาไม่สำเร็จ");
  } finally {
    isLoading.value = false;
  }
};
</script>
