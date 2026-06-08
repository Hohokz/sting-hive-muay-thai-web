<template>
  <div class="w-full overflow-hidden">
    <!-- ✅ HERO -->
    <HeroSection @scrollToBooking="scrollToBooking" />
    <AboutSection id="about" @scrollToBooking="scrollToBooking" />
    <ClassPricing id="pricing" @scrollToBooking="scrollToBooking" />
    <ClassType id="schedule" @scrollToBooking="scrollToBooking" />
    <Location id="location" @scrollToBooking="scrollToBooking" />

    <section ref="bookingRef" class="py-20 bg-[#111]">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="font-bebas text-5xl text-center text-white mb-4">
          Book Your <span class="text-red-600">Training Session</span>
        </h2>
        <div class="w-20 h-[3px] bg-red-600 mx-auto mb-10" />
        <BookingPage />
      </div>
    </section>

    <footer class="bg-black border-t border-white/10 py-6 px-8">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="font-bold text-base text-white tracking-widest uppercase whitespace-nowrap flex items-center gap-2">
          Sting <span class="text-red-600">Club</span> &amp; Sting Hive
          <p class="text-white/40 text-xs mt-1">Since 2020 &amp; 2024. All Rights Reserved.</p>
        </div>
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
const aboutRef = ref(null)

const scrollToBooking = () => {
  bookingRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToAbout = () => {
  aboutRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
