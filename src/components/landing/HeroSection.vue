<template>
  <section class="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col justify-between pb-8">
    <!-- Slideshow background -->
    <div class="absolute inset-0 z-0">
      <div v-for="(img, i) in slides" :key="i"
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        :class="current === i ? 'opacity-20' : 'opacity-0'" :style="{ backgroundImage: `url(${img})` }" />
    </div>

    <!-- Nav -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black border-b border-white/10">
      <!-- Logo -->
      <div class="font-bold text-sm tracking-widest uppercase whitespace-nowrap flex items-center gap-2">
        <img src="/2logo.png" alt="logo" class="h-8 w-auto" />
        Sting <span class="text-red-600">Club</span> &amp; Sting Hive
      </div>

      <!-- Desktop links -->
      <ul class="hidden md:flex gap-8 list-none absolute left-1/2 -translate-x-1/2">
        <li v-for="link in navLinks" :key="link.target">

          <a href="#" class="text-xs font-semibold tracking-widest uppercase text-white/80 hover:text-white transition"
            @click.prevent="scrollTo(link.target)">
            {{ link.label }}
          </a>
        </li>
      </ul>

      <!-- Right -->
      <div class="flex items-center gap-3">
        <RouterLink to="/admin"
          class="hidden md:block bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold tracking-widest uppercase rounded transition">
          Login
        </RouterLink>
        <button @click="menuOpen = !menuOpen" class="md:hidden text-white p-1">
          <Menu v-if="!menuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </nav>

    <!-- Mobile drawer -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="menuOpen"
        class="fixed top-[57px] left-0 right-0 z-40 bg-black border-b border-white/10 flex flex-col md:hidden">
        <a v-for="link in navLinks" :key="link.target" href="#"
          class="px-8 py-4 text-xs font-semibold tracking-widest uppercase text-white/80 hover:text-white hover:bg-white/5 border-b border-white/5 transition"
          @click.prevent="scrollTo(link.target)">
          {{ link.label }}
        </a>
        <div class="px-8 py-4">
          <RouterLink to="/admin"
            class="block bg-red-600 hover:bg-red-700 px-5 py-3 text-xs font-bold tracking-widest uppercase rounded transition text-center"
            @click="menuOpen = false">
            Login
          </RouterLink>
        </div>
      </div>
    </Transition>

    <!-- Hero content -->
    <div class="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 pt-32 pb-12 md:pt-28">
      <img src="/images/combinelogo.png" alt="logo" class="h-64 w-auto" />
      <h1 class="font-bebas text-[90px] leading-none tracking-wide">
        Train
        <span class="block text-red-600">Muay Thai</span>
      </h1>

      <p class="font-dancing text-4xl font-bold mt-3 mb-5">
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
        <button @click="$emit(scrollTo('pricing'))"
          class="bg-red-600 hover:bg-red-700 px-7 py-3 text-sm font-bold tracking-widest uppercase rounded transition">
          View Pricing
        </button>
      </div>

      <!-- Slideshow dots -->
      <div class="flex gap-2 mt-5">
        <button v-for="(_, i) in slides" :key="i" class="w-2 h-2 rounded-full transition-colors"
          :class="current === i ? 'bg-red-600' : 'bg-white/30'" @click="goTo(i)" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X } from 'lucide-vue-next'

const menuOpen = ref(false)
const navLinks = [
  { label: 'About', target: 'about' },
  { label: 'Pricing', target: 'pricing' },
  { label: 'Schedule', target: 'schedule' },
  { label: 'Location', target: 'location' },
]

const scrollTo = (target) => {
  const el = document.getElementById(target)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  menuOpen.value = false
}

const slides = [
  '/images/PPAI1718.jpg',
  '/images/PPAI1983.jpg',
  '/images/PPAI1673.jpg',
  '/images/PPAI2376.jpg',
  '/images/PPAI2017.jpg',
  '/images/PPAI1721.jpg',
]

const current = ref(0)
let timer = null

const goTo = (n) => {
  current.value = n
}

onMounted(() => {
  timer = setInterval(() => {
    current.value = (current.value + 1) % slides.length
  }, 4000)
})

onUnmounted(() => clearInterval(timer))
</script>
