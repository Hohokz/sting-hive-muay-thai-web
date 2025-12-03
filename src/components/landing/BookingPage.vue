<template>
  <div class="w-full min-h-screen p-6">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- LEFT CONTENT -->
      <div class="lg:col-span-2 space-y-6">

        <!-- ✅ SELECT GYM -->
        <div class="bg-white rounded-xl shadow p-6">
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
        </div>

        <!-- ✅ SELECT A SLOT -->
        <div class="bg-white rounded-xl shadow p-6">
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

              <BookingTimeSlots :date="selectedDate" :gym_enum="selectedGym" :is_private_class="selectPrivate"
                @select="onSelectSchedule" />

              <p v-if="!selectedGym" class="text-sm text-red-500">
                Please select a Place first.
              </p>
            </div>

          </div>
        </div>

        <!-- ✅ PRIVATE CLASS -->
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold mb-1">Private Class</h3>
            </div>

            <label class="relative inline-flex items-center cursor-pointer">
              <!-- ✅ INPUT -->
              <input type="checkbox" v-model="selectPrivate" class="sr-only peer" />

              <!-- ✅ TRACK -->
              <div class="w-11 h-6 bg-gray-300 rounded-full
               transition-colors duration-300
               peer-checked:bg-blue-600
               relative">
                <!-- ✅ DOT -->
                <div class="absolute top-[2px] left-[2px]
                 w-5 h-5 bg-white rounded-full
                 transition-transform duration-300
                 peer-checked:translate-x-[20px]"></div>
              </div>
            </label>
          </div>
        </div>
        <!-- ✅ CONTACT INFO -->
        <div class="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 class="text-xl font-semibold mb-4">Contact Information</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- NAME  -->
            <div>
              <p class="text-gray-600 text-sm mb-1">Name</p>
              <input v-model="clientName" type="text" class="w-full p-3 border rounded-md"
                placeholder="Enter Your Name" />
            </div>
            <!-- ✅ MOBILE -->
            <div>
              <p class="text-gray-600 text-sm mb-1">Mobile Number</p>
              <input v-model="mobile" inputmode="numeric" pattern="[0-9]*" class="w-full p-3 border rounded-md"
                placeholder="Enter mobile number" maxlength="10" @input="mobile = mobile.replace(/\D/g, '')" />
            </div>

            <!-- ✅ EMAIL -->
            <div>
              <p class="text-gray-600 text-sm mb-1">Email</p>
              <input v-model="email" type="email" class="w-full p-3 border rounded-md"
                placeholder="Enter email address" />
              <p v-if="email && !email.includes('@')" class="text-red-500 text-xs mt-1">
                Email format ไม่ถูกต้อง
              </p>
            </div>
            <!-- ✅ Person -->
            <div>
              <p class="text-gray-600 text-sm mb-1">Participants</p>
              <input v-model.number="participants" type="number" class="w-full p-3 border rounded-md"
                placeholder="Enter Participants Amount" min="1" />
            </div>

          </div>
        </div>
      </div>

      <!-- ✅ RIGHT SUMMARY -->
      <div>
        <div class="bg-white rounded-xl shadow p-6 h-fit">
          <h2 class="text-lg font-semibold mb-4">Booking Details</h2>

          <!-- ✅ PLACE -->
          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">Place</p>
            <p class="text-sm">{{ gymLabel }}</p>
          </div>

          <!-- ✅ DATE & TIME -->
          <div class="border-b pb-4 mb-4">
            <p class="text-gray-700 font-medium">Date & Time</p>
            <p v-if="!selectedDate || !selectedSchedule" class="text-sm mt-1">
              -
            </p>
            <p v-else class="text-sm mt-1">
              {{ displayDate }} - {{ displayTime }}
            </p>
          </div>

          <!-- ✅ CONTACT INFO SUMMARY -->
          <div class="border-b pb-4">
            <p class="text-gray-700 font-medium mb-2">Contact Information</p>

            <div class="text-sm space-y-1">
              <p>
                <span class="text-gray-500">Name:</span>
                <span class="ml-1">{{ clientName || "-" }}</span>
              </p>
              <p>
                <span class="text-gray-500">Mobile:</span>
                <span class="ml-1">{{ mobile || "-" }}</span>
              </p>

              <p>
                <span class="text-gray-500">Email:</span>
                <span class="ml-1">{{ email || "-" }}</span>
              </p>
              <p>
                <span class="text-gray-500">Participants:</span>
                <span class="ml-1">{{ participants || "-" }}</span>
              </p>
            </div>

          </div>

          <button class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
            :disabled="isSubmitting" @click="submitBooking">
            <span v-if="!isSubmitting">Proceed to Booking</span>
            <span v-else>Loading...</span>
          </button>
        </div>

        <div v-if="isSubmitting" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div class="bg-white px-6 py-4 rounded-xl shadow text-lg font-semibold">
            Creating Booking...
          </div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 h-fit mt-6">
          <h2 class="text-lg font-semibold mb-4">Find Your Booking</h2>
          <button class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
            @click="goToFindBooking">
            <span>Find Booking</span>
          </button>
        </div>
      </div>
    </div>
    <!-- WARNING MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-2xl w-[340px] text-center shadow-xl animate-fadeIn">
        <h3 class="text-lg font-semibold mb-2" :class="{
          'text-yellow-500': modalType === 'warning',
          'text-red-500': modalType === 'error',
          'text-green-500': modalType === 'success',
        }">
          {{ modalTitle }}
        </h3>

        <p class="text-gray-600">
          {{ modalMessage }}
        </p>

        <button class="mt-5 px-5 py-2 rounded-lg transition" :class="{
          'bg-yellow-500 text-white hover:bg-yellow-600': modalType === 'warning',
          'bg-red-500 text-white hover:bg-red-600': modalType === 'error',
          'bg-green-500 text-white hover:bg-green-600': modalType === 'success',
        }" @click="showModal = false">
          OK
        </button>
      </div>
    </div>

  </div>
</template>


<script setup>
import { ref, watch, computed } from "vue";
import BookingCalender from "@/components/ฺbooking/BookingCalender.vue";
import BookingTimeSlots from "@/components/ฺbooking/BookingTimeSlots.vue";
import axios from "axios";
import { useRouter } from "vue-router";

const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'localhost:3000';
const router = useRouter();

const goToFindBooking = () => {
  router.push("/search-booking"); // ✅ path ของหน้าค้นหา booking
};
const showModal = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");
const modalType = ref("warning")

const openModal = (title, message, type = "warning") => {
  modalTitle.value = title;
  modalMessage.value = message;
  modalType.value = type;
  showModal.value = true;
};

const gymLabel = computed(() => {
  if (selectedGym.value === "STING_CLUB") return "Sting Club";
  if (selectedGym.value === "STING_HIVE") return "Sting Hive";
  return "-";
});

const displayDate = computed(() => {
  if (!selectedDate.value) return "-";

  const d = new Date(selectedDate.value);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const displayTime = computed(() => {
  if (!selectedSchedule.value) return "-";

  const start = selectedSchedule.value.start_time.slice(0, 5);
  const end = selectedSchedule.value.end_time.slice(0, 5);

  return `${start} - ${end}`;
});

const selectedSchedule = ref(null)
const selectedDate = ref(null);
const selectedTime = ref(null);

const selectedGym = ref(null);
const selectPrivate = ref(false);
const mobile = ref("");
const email = ref("");
const clientName = ref("");
const participants = ref(1);

const onSelectSchedule = (payload) => {
  selectedSchedule.value = payload;
};

const isSubmitting = ref(false);

const submitBooking = async () => {
  if (!selectedDate.value || !selectedSchedule.value || !selectedGym.value) {
    openModal(
      "Incomplete Information",
      "Please select Place / Date / Time before continuing.",
      "warning"
    );
    return;
  }

  if (!mobile.value || mobile.value.length < 9) {
    openModal(
      "Incomplete Information",
      "Please enter a valid mobile number before continuing.",
      "warning"
    );
    return;
  }

  if (!participants.value || participants.value < 1) {
    openModal(
      "Incomplete Information",
      "Please enter a valid number of participants.",
      "warning"
    );
    return;
  }

  const payload = {
    gym_enum: selectedGym.value,
    client_name: clientName.value,
    client_phone: mobile.value,
    client_email: email.value,
    participants: participants.value,
    is_private: selectPrivate.value,
    classes_schedule_id: selectedSchedule.value.id,
    date_booking: selectedDate.value,
    capacity: participants.value,
  };

  console.log("Submitting booking with payload:", payload);

  try {
    isSubmitting.value = true;
    const res = await axios.post(
      `${STING_HIVE_API_URL}/api/v1/bookings`,
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Booking success:", res.data);
    openModal(
      "Booking Success",
      "Your booking has been successfully created.",
      "success"
    );

  } catch (err) {
    console.error("❌ Booking failed:", err);
    openModal(
      "Booking Failed",
      "There was an error creating your booking. Please try again later.",
      "error"
    );
  } finally {
    isSubmitting.value = false;
    goToFindBooking();
  }
};

/* ✅ เมื่อเปลี่ยนวัน → reset เวลา */
watch([selectedSchedule, selectPrivate, selectedGym], () => {
  selectedTime.value = null;
});
</script>
<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
