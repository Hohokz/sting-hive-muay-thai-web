<template>
  <div class="w-full overflow-hidden">

    <!-- ✅ HERO -->
    <HeroSection @scrollToBooking="scrollToBooking" />

    <!-- ✅ ABOUT -->
    <AboutSection />

    <!-- ✅ CLASS TYPES -->
    <ClassTypes />

    <!-- ✅ BOOKING (COMPONENT หลักของมึง) -->
    <section ref="bookingRef" class="py-20 bg-[#f7f9fc]">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-10">
          Book Your Training Session
        </h2>

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
import { ref } from "vue";

import HeroSection from "@/components/landing/HeroSection.vue";
import AboutSection from "@/components/landing/AboutSection.vue";
import ClassTypes from "@/components/landing/ClassType.vue";
import Testimonials from "@/components/landing/Testimonials.vue";
import FooterSection from "@/components/landing/FooterSection.vue";

import BookingPage from "@/components/landing/BookingPage.vue";

const bookingRef = ref(null);

const scrollToBooking = () => {
  bookingRef.value?.scrollIntoView({ behavior: "smooth" });
};
</script>
