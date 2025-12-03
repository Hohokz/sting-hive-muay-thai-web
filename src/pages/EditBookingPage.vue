<template>
  <div class="w-full min-h-screen p-6">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">

      <h1 class="text-2xl font-semibold">Edit Booking</h1>

      <!-- ✅ SELECT GYM -->

      <h2 class="text-xl font-semibold mb-4">Select Place</h2>

      <div class="flex justify-around items-center gap-6">

        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" value="STING_CLUB" v-model="selectedGym" class="accent-blue-600" />
          <span>Sting Club</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" value="STING_HIVE" v-model="selectedGym" class="accent-blue-600" />
          <span>Sting Hive</span>
        </label>

      </div>


      <h2 class="text-xl font-semibold mb-4">Select a Slot</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        <!-- DATE -->
        <div class="calendar-wrapper">
          <p class="text-gray-600 text-sm mb-2">Select Date</p>
          <BookingCalender v-model="selectedDate" />
        </div>

        <!-- TIME -->
        <div>
          <p class="text-gray-600 text-sm mb-5">Select Time</p>

          <BookingTimeSlots :date="selectedDate" :gym_enum="selectedGym" @select="onSelectSchedule" />

          <p v-if="!selectedGym" class="text-sm text-red-500">
            กรุณาเลือกสถานที่ก่อน
          </p>
        </div>

      </div>


      <!-- ✅ PRIVATE -->
      <div class="flex items-center justify-between border p-4 rounded-md">
        <p class="font-medium">Private Class</p>

        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="selectPrivate" class="sr-only peer" />
          <div class="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 relative transition">
            <div class="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full
                     transition-transform peer-checked:translate-x-[20px]">
            </div>
          </div>
        </label>
      </div>

      <!-- ✅ CONTACT INFO -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-600 mb-1">Name</p>
          <input v-model="clientName" class="w-full p-3 border rounded-md" />
        </div>

        <div>
          <p class="text-sm text-gray-600 mb-1">Mobile</p>
          <input disabled v-model="mobile" class="w-full p-3 border rounded-md" maxlength="10"
            @input="mobile = mobile.replace(/\D/g, '')" />
        </div>

        <div>
          <p class="text-sm text-gray-600 mb-1">Email</p>
          <input disabled v-model="email" type="email" class="w-full p-3 border rounded-md" />
        </div>

        <div>
          <p class="text-sm text-gray-600 mb-1">Participants</p>
          <input v-model.number="participants" type="number" min="1" class="w-full p-3 border rounded-md" />
        </div>
      </div>

      <!-- ✅ ACTION -->
      <div class="flex flex-col md:flex-row gap-4">
        <button class="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          @click="resetAll">
          Back
        </button>
        <button class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          :disabled="isSubmitting" @click="updateBooking">
          <span v-if="!isSubmitting">Update Booking</span>
          <span v-else>Updating...</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ✅ LOADING OVERLAY -->
  <div v-if="isSubmitting" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white px-6 py-4 rounded-xl shadow text-lg font-semibold">
      Updating Booking...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

import BookingCalender from "@/components/ฺbooking/BookingCalender.vue";
import BookingTimeSlots from "@/components/ฺbooking/BookingTimeSlots.vue";

const route = useRoute();
const router = useRouter();

const resetAll = () => {
  sessionStorage.clear()
  router.back()

}
const bookingId = route.params.id; // /edit-booking/:id

const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'localhost:3000';

const selectedGym = ref("");
const selectedDate = ref(null);
const selectedSchedule = ref(null);

const selectPrivate = ref(false);
const clientName = ref("");
const mobile = ref("");
const email = ref("");
const participants = ref(1);

const isSubmitting = ref(false);

/* ✅ เมื่อเลือก slot ใหม่ */
const onSelectSchedule = (payload) => {
  selectedSchedule.value = payload;
};

/* ✅ โหลด booking เดิม */
const fetchBookingDetail = async () => {
  try {
    const res = await axios.get(`${STING_HIVE_API_URL}/api/v1/bookings?classes_booking_id=${bookingId}`);

    // ✅ กันกรณี data เป็น array
    const b = Array.isArray(res.data.data)
      ? res.data.data[0]
      : res.data.data;

    if (!b) {
      alert("ไม่พบข้อมูล booking");
      return;
    }

    console.log("✅ BOOKING:", b);

    selectedGym.value = b.schedule.gym_enum;
    selectedDate.value = b.date_booking;
    selectPrivate.value = b.is_private;

    clientName.value = b.client_name;
    mobile.value = b.client_phone;
    email.value = b.client_email;
    participants.value = b.capacity;

    selectedSchedule.value = {
      id: b.classes_schedule_id,
      start_time: b.schedule.start_time,
      end_time: b.schedule.end_time
    };

  } catch (err) {
    console.error(err);
    alert("โหลดข้อมูล booking ไม่สำเร็จ");
  }
};

onMounted(fetchBookingDetail);

/* ✅ UPDATE */
const updateBooking = async () => {
  if (!selectedSchedule.value) {
    alert("กรุณาเลือกเวลาใหม่");
    return;
  }

  const payload = {
    gym_enum: selectedGym.value,
    client_name: clientName.value,
    client_phone: mobile.value,
    client_email: email.value,
    capacity: participants.value,
    is_private: selectPrivate.value,
    classes_schedule_id: selectedSchedule.value.id,
    date_booking: selectedDate.value,
  };

  console.log("Updating booking with payload:", payload);

  try {
    isSubmitting.value = true;

    await axios.put(
      `${STING_HIVE_API_URL}/api/v1/bookings/${bookingId}`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    alert("✅ อัปเดต Booking สำเร็จแล้ว");
    router.push("/search-booking");
  } catch (err) {
    console.error(err);
    alert("❌ อัปเดตไม่สำเร็จ");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
