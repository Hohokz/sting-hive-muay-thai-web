<template>
  <section class="relative h-screen bg-black text-white">
    <!-- <img src="../assets/hero.jpg" class="absolute inset-0 w-full h-full object-cover opacity-50" /> -->

    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
      <h1 class="text-4xl md:text-6xl font-extrabold mb-4">
        Sting Muay Thai
      </h1>
      <p class="text-lg mb-8">
        Train Hard. Fight Smart. Become Stronger.
      </p>

      <button @click="$emit('scrollToBooking')"
        class="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl text-lg font-bold transition">
        Book a Class Now
      </button>
    </div>
  </section>
</template>
