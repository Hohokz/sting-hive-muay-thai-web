<template>
  <div class="w-full overflow-hidden">
    <!-- ✅ HERO -->
    <HeroSection @scrollToBooking="scrollToBooking" />
    <AboutSection @scrollToBooking="scrollToBooking" />
    <ClassPricing @scrollToBooking="scrollToBooking" />
    <ClassType @scrollToBooking="scrollToBooking" />
    <Location @scrollToBooking="scrollToBooking" />

    <!-- ✅ BOOKING (COMPONENT หลักของมึง) -->
    <section ref="bookingRef" class="py-20 bg-[#f7f9fc]">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-10">Book Your Training Session</h2>

        <!-- ✅ เอาหน้า Booking เดิมมาวางตรงนี้เลย -->
        <BookingPage />
      </div>
    </section>
    <footer class="bg-black border-t border-white/10 py-6 px-8">
      <div class="max-w-6xl mx-auto flex items-center justify-between">

        <!-- Left: Logo + copyright -->
        <div
          class="font-bold text-base text-white/40 tracking-widest uppercase w-56 whitespace-nowrap flex items-center gap-2">
          Sting <span class="text-red-600">Club</span> &amp; Sting Hive
          <p class="text-white/40 text-xs mt-1">Since 2020 &amp; 2024. All Rights Reserved.</p>
        </div>

        <!-- Right: Links -->
        <div class="flex gap-8">
          <a href="#" class="text-white/50 hover:text-white text-sm transition">Privacy Policy</a>
          <a href="#" class="text-white/50 hover:text-white text-sm transition">Terms of Service</a>
        </div>

      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import HeroSection from '@/components/landing/HeroSection.vue'
import AboutSection from '@/components/landing/AboutSection.vue'
import BookingPage from '@/components/landing/BookingPage.vue'
import ClassPricing from '@/components/landing/ClassPricing.vue'
import ClassType from '@/components/landing/ClassType.vue'
import Location from '@/components/landing/GymLocation.vue'
const bookingRef = ref(null)

const scrollToBooking = () => {
  bookingRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
