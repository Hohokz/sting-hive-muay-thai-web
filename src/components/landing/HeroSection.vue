<template>
  <section class="relative h-screen bg-black text-white overflow-hidden">
    <!-- Slideshow background -->
    <div class="absolute inset-0 z-0">
      <div v-for="(img, i) in slides" :key="i"
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        :class="current === i ? 'opacity-20' : 'opacity-0'" :style="{ backgroundImage: `url(${img})` }" />
    </div>

    <!-- Nav -->
    <nav
      class="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-4 bg-black border-b border-white/10">

      <!-- Logo left -->
      <div class="font-bold text-base tracking-widest uppercase w-56 whitespace-nowrap flex items-center gap-2">
        Sting <span class="text-red-600">Club</span> &amp; Sting Hive
      </div>

      <!-- Links center -->
      <ul class="flex gap-8 list-none absolute left-1/2 -translate-x-1/2">
        <li v-for="link in navLinks" :key="link">
          <a href="#" class="text-xs font-semibold tracking-widest uppercase text-white/80 hover:text-white transition">
            {{ link }}
          </a>
        </li>
      </ul>

      <!-- Button right -->
      <RouterLink to="/admin"
        class="bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold tracking-widest uppercase rounded transition w-56 text-center">
        Login
      </RouterLink>

    </nav>

    <!-- Hero content -->
    <div class="relative z-9 flex flex-col items-center justify-center h-[calc(100%-64px)] text-center px-6 mt-5">
      <img src="/images/combinelogo.png" alt="logo" class="h-64 w-auto" />
      <h1 class="font-['Bebas_Neue'] text-[90px] leading-none tracking-wide">
        Train
        <span class="block text-red-600">Muay Thai</span>
      </h1>

      <p class="font-['Dancing_Script'] text-4xl font-bold mt-3 mb-5">
        in the heart of Chiang Mai!
      </p>

      <p class="max-w-lg text-sm leading-relaxed text-white/85 mb-3">
        <strong>Sting Club &amp; Sting Hive Muay Thai Gym</strong> welcomes all levels, from
        beginners to advanced. Come train with our expert and friendly trainers and be part of
        a truly supportive community!
      </p>

      <p class="max-w-lg text-sm leading-relaxed text-white/75 mb-7">
        Whether your goal is weight loss, building muscle, learning self-defense, or stepping
        into the professional ring, Sting Club &amp; Sting Hive Muay Thai Gym is ready to push
        you to your goals in a fun, positive atmosphere!
      </p>

      <div class="flex gap-3">
        <button @click="$emit('scrollToBooking')"
          class="border-2 border-white hover:bg-white hover:text-black px-7 py-3 text-sm font-bold tracking-widest uppercase rounded transition">
          Booking Class
        </button>
        <button
          class="bg-red-600 hover:bg-red-700 px-7 py-3 text-sm font-bold tracking-widest uppercase rounded transition">
          View Pricing
        </button>
      </div>

      <!-- Slideshow dots -->
      <div class="flex gap-2 mt-5">
        <button v-for="(_, i) in slides" :key="i" class="w-2 h-2 rounded-full transition-colors"
          :class="current === i ? 'bg-red-600' : 'bg-white/30'" @click="goTo(i)">
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const navLinks = ['About', 'Pricing', 'Schedule', 'Location'];

const slides = [
  '/images/PPAI1718.jpg'
];

const current = ref(0);
let timer = null;

const goTo = (n) => {
  current.value = n;
};

onMounted(() => {
  timer = setInterval(() => {
    current.value = (current.value + 1) % slides.length;
  }, 4000);
});

onUnmounted(() => clearInterval(timer));
</script>
