<template>
  <section class="bg-[#111] py-20 px-6">
    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

      <!-- Left: Info -->
      <div>
        <h2 class="font-bebas text-4xl md:text-5xl text-white mb-4">
          Join The <span class="text-red-600">Sting Family</span>
        </h2>
        <p class="text-white/60 text-sm leading-relaxed mb-8">
          Ready to step into the ring? Contact us today to book your class, ask questions, or just drop by to say hello.
          We are located right in the heart of Chiang Mai Old Town.
        </p>

        <!-- Location -->
        <div class="flex items-start gap-4 mb-6">
          <div class="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <MapPin class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-white font-bold text-sm mb-1">Location</p>
            <p class="text-white/60 text-sm">Chiang Mai Old Town</p>
            <p class="text-white/60 text-sm">Visit our <strong class="text-white">Sting Club</strong> or <strong
                class="text-white">Sting Hive</strong> branches.</p>
          </div>
        </div>

        <!-- LINE -->
        <div class="flex items-start gap-4 mb-6">
          <div class="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
            <MessageCircle class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-white font-bold text-sm mb-1">LINE Official</p>
            <p class="text-white/60 text-sm">@stingclub</p>
          </div>
        </div>

        <!-- Phone -->
        <div class="flex items-start gap-4 mb-10">
          <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Phone class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-white font-bold text-sm mb-1">Call Us</p>
            <p class="text-white/60 text-sm">062-949 5951</p>
            <p class="text-white/60 text-sm">083-262 7195</p>
          </div>
        </div>

        <!-- Follow Us -->
        <div>
          <p class="font-bebas text-lg tracking-widest text-white mb-3">Follow Us</p>
          <div class="flex gap-3 mb-2">
            <a href="https://facebook.com/stingclubcm" target="_blank"
              class="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition">
              <Facebook class="w-5 h-5 text-white" />
            </a>
            <a href="https://instagram.com/stinghivemuaythaigym" target="_blank"
              class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 hover:opacity-80 flex items-center justify-center transition">
              <Instagram class="w-5 h-5 text-white" />
            </a>
          </div>
          <p class="text-white/40 text-xs">FB/IG: stingclubcm / stinghivemuaythaigym</p>
        </div>
      </div>

      <!-- Right: Map -->
      <div class="border border-white/10 rounded-2xl overflow-hidden bg-[#1a1a1a]">
        <!-- Toggle -->
        <div class="flex border-b border-white/10">
          <button v-for="(branch, i) in branches" :key="i"
            class="flex-1 py-3 text-xs font-bebas tracking-widest transition-colors duration-200" :class="active === i
              ? 'bg-red-600 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'" @click="active = i">
            {{ branch.name }}
          </button>
        </div>

        <!-- Map iframe -->
        <div class="relative w-full h-80">
          <iframe v-for="(branch, i) in branches" :key="i" :src="branch.mapUrl"
            class="absolute inset-0 w-full h-full transition-opacity duration-300"
            :class="active === i ? 'opacity-100' : 'opacity-0 pointer-events-none'" style="border: 0;" allowfullscreen
            loading="lazy" referrerpolicy="no-referrer-when-downgrade" />
        </div>

        <!-- Open in Maps -->
        <div class="p-4 flex justify-center">

          :href="branches[active].googleUrl"
          target="_blank"
          class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-widest uppercase px-6 py-2 rounded
          transition"
          >
          Open in Google Maps
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { MapPin, MessageCircle, Phone, Facebook, Instagram } from 'lucide-vue-next';

const active = ref(0);

const branches = [
  {
    name: 'Sting Hive (NW)',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3777.074070751317!2d98.97612977519836!3d18.794852082352644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3b495d4d8d5b%3A0x1dfa73c5448d637a!2sSting%20Hive%20Muay%20Thai%20Gym!5e0!3m2!1sth!2sth!4v1780902600520!5m2!1sth!2sth',
    googleUrl: 'https://maps.app.goo.gl/exCR1YWzc45n83yU6',
  },
  {
    name: 'Sting Club (SW)',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15108.294031228392!2d98.96840496204197!3d18.7948771743456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da31ba41df98bd%3A0xda6fac6126e26dbc!2sSting%20Club%20Muay%20Thai%20Gym!5e0!3m2!1sth!2sth!4v1780902659432!5m2!1sth!2sth',
    googleUrl: 'https://maps.app.goo.gl/2L5TtDPr5tygMA1B9',
  },
];
</script>
