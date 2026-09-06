<template>
  <div class="w-full overflow-hidden">
    <!-- ✅ HERO -->
    <HeroSection @scrollToBooking="scrollToBooking" />
    <AboutSection id="about" @scrollToBooking="scrollToBooking" />
    <ClassPricing id="pricing" @scrollToBooking="scrollToBooking" />
    <ClassType id="schedule" @scrollToBooking="scrollToBooking" />
    <section ref="ourTeam" class="py-20 bg-[#111]">
      <div class="text-center mb-14">
        <h2 class="font-bebas text-5xl md:text-6xl tracking-wide text-white">
          {{ t('landing.team.title_pre').toUpperCase() }} <span class="text-red-600">{{ t('landing.team.title_highlight').toUpperCase() }}</span>
        </h2>
        <div class="w-20 h-[3px] bg-red-600 mx-auto mt-3" />
      </div>
      <div class="max-w-7xl mx-auto px-4">
        <img src="/images/our team web.jpg" alt="Our Team 1" class="w-full h-auto object-cover" />
      </div>
      <div class="max-w-7xl mx-auto px-4 mt-8">
        <img src="/images/our team web2.jpg" alt="Our Team 2" class="w-full h-auto object-cover" />
      </div>
    </section>
    <Location id="location" @scrollToBooking="scrollToBooking" />

    <section ref="bookingRef" class="py-20 bg-[#111]">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="font-bebas text-5xl text-center text-white mb-4">
          {{ t('landing.booking_section.title_pre') }} <span class="text-red-600">{{ t('landing.booking_section.title_highlight') }}</span>
        </h2>
        <div class="w-20 h-[3px] bg-red-600 mx-auto mb-10" />
        <BookingPage />
      </div>
    </section>

    <footer class="bg-black border-t border-white/10 py-6 px-8">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div
          class="font-bold text-base text-white tracking-widest uppercase whitespace-nowrap flex items-center gap-2"
        >
          Sting <span class="text-red-600">Club</span> &amp; Sting Hive
          <p class="text-white/40 text-xs mt-1">{{ t('landing.footer.rights') }}</p>
        </div>
        <div class="flex gap-8">
          <a href="#" class="text-white/50 hover:text-white text-sm transition">{{ t('landing.footer.privacy') }}</a>
          <a href="#" class="text-white/50 hover:text-white text-sm transition">{{ t('landing.footer.terms') }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import HeroSection from '@/components/landing/HeroSection.vue'
import AboutSection from '@/components/landing/AboutSection.vue'
import BookingPage from '@/components/landing/BookingPage.vue'
import ClassPricing from '@/components/landing/ClassPricing.vue'
import ClassType from '@/components/landing/ClassType.vue'
import Location from '@/components/landing/GymLocation.vue'

const { t } = useI18n()
const bookingRef = ref(null)

const scrollToBooking = () => {
  bookingRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
