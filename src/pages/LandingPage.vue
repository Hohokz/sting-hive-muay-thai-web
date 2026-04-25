<template>
  <div class="w-full overflow-hidden">
    <div class="absolute top-6 right-6 z-50">
      <RouterLink
        to="/admin"
        class="bg-white/10 hover:bg-black text-white hover:text-white backdrop-blur-md border border-black/20 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2"
      >
        <span>👤</span> Login
      </RouterLink>
    </div>
    <!-- ✅ HERO -->
    <HeroSection @scrollToBooking="scrollToBooking" />

    <!-- ✅ BOOKING (COMPONENT หลักของมึง) -->
    <section ref="bookingRef" class="py-20 bg-[#f7f9fc]">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-10">Book Your Training Session</h2>

        <!-- ✅ เอาหน้า Booking เดิมมาวางตรงนี้เลย -->
        <BookingPage />
      </div>
    </section>

    <!-- ✅ TESTIMONIAL -->
    <Testimonials />

    <!-- ✅ FOOTER -->
    <FooterSection />
  </div>
</template>

<script setup>
import { ref } from 'vue'

import HeroSection from '@/components/landing/HeroSection.vue'
import Testimonials from '@/components/landing/Testimonials.vue'
import FooterSection from '@/components/landing/FooterSection.vue'

import BookingPage from '@/components/landing/BookingPage.vue'
import { RouterLink } from 'vue-router'

const bookingRef = ref(null)

const scrollToBooking = () => {
  bookingRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
