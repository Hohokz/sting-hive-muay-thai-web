<template>
  <section class="bg-[#111] py-20 px-6">
    <!-- Title -->
    <div class="text-center mb-14">
      <h2 class="font-bebas text-5xl md:text-6xl tracking-wide text-white">
        Class <span class="text-red-600">Schedule</span>
      </h2>
      <div class="w-20 h-[3px] bg-red-600 mx-auto mt-3" />
    </div>

    <!-- Two columns -->
    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="group in schedule" :key="group.title" class="border border-white/10 rounded-2xl p-8 bg-[#1a1a1a]">
        <!-- Group title -->
        <h3 class="font-bebas text-2xl tracking-widest text-red-600 text-center mb-6">
          {{ group.title }}
        </h3>

        <!-- Time slots -->
        <div class="flex flex-col gap-3">
          <div v-for="(slot, i) in group.slots" :key="i"
            class="flex items-center gap-3 bg-[#222] rounded-lg px-4 py-3 cursor-pointer transition-all duration-300 ease-out hover:bg-red-600 hover:scale-105 hover:shadow-lg">
            <Clock class="w-5 h-5 text-white/60 flex-shrink-0" stroke-width="1.5" />
            <span class="font-bebas tracking-widest text-white text-lg">{{ slot }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Clock } from 'lucide-vue-next';

const schedule = [
  {
    title: 'Group Class',
    slots: [
      '09:00 AM - 10:30 AM',
      '11:00 AM - 12:30 PM',
      '03:00 PM - 04:30 PM',
      '04:45 PM - 06:15 PM',
      '06:30 PM - 08:00 PM',
    ],
  },
  {
    title: 'Private Training',
    slots: [
      '08:00 AM - 09:30 AM',
      '10:00 AM - 11:30 AM',
      '03:00 PM - 04:30 PM',
      '04:00 PM - 05:00 PM',
      '06:00 PM - 07:00 PM',
    ],
  },
];
</script>
