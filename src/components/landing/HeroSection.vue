<template>
  <section class="relative h-screen bg-black text-white">
    <img src="/images/PPAI1718.jpg" class="absolute inset-0 w-full h-full object-cover opacity-20" />

    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
      <h1 class="mb-4">
        <img src="/images/combinelogo.png" alt="Sting Muay Thai" class="mx-auto w-80 md:w-[500px] drop-shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform duration-500 ease-out" />
      </h1>

      <button @click="$emit('scrollToBooking')"
        class="bg-red-600 hover:bg-red-700 px-8 py-4 mt-5 rounded-xl text-lg font-bold transition">
        Book a Class Now
      </button>
    </div>
  </section>
</template>
