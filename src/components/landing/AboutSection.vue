<template>
  <section class="bg-[#151515] py-20 px-6">
    <!-- Title -->
    <div class="text-center mb-14">
      <h2 class="font-bebas text-5xl md:text-6xl tracking-wide text-white">
        Why Choose To <span class="text-red-600">Train With Us?</span>
      </h2>
      <div class="w-32 h-[3px] bg-red-600 mx-auto m mt-1" />
    </div>

    <!-- Cards -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="(card, i) in cards" :key="i"
        class="rounded-xl border p-8 flex flex-col items-center text-center transition-colors duration-300 border-white/10 bg-[#222] hover:border-red-600">
        <!-- Icon circle -->
        <div class="w-14 h-14 rounded-full bg-red-900/60 flex items-center justify-center mb-6">
          <component :is="card.icon" class="w-6 h-6 text-red-400" stroke-width="1.5" />
        </div>

        <!-- Card title -->
        <h3 class="font-bebas text-xl tracking-widest text-white mb-5">
          {{ card.title }}
        </h3>
        <!-- Body -->
        <div class="text-sm text-white/60 leading-relaxed space-y-3 text-left w-full" v-html="card.body" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ShieldCheck, UserCheck, Users } from 'lucide-vue-next';

const cards = [
  {
    icon: ShieldCheck,
    title: 'All Levels Welcome',
    featured: false,
    body: `
      <p><strong class="text-white font-semibold">For Beginners:</strong> Never boxed before? No worries! We build your foundation, teach proper guard & strikes, prioritizing safety.</p>
      <p class="mt-3"><strong class="text-white font-semibold">For Advanced:</strong> Intense programs, live sparring sessions, and advanced techniques to sharpen your weapons to perfection.</p>
    `,
  },
  {
    icon: UserCheck,
    title: 'Expert & Friendly Trainers',
    featured: false,
    body: `
      <p>Learn from expert trainers with real fighting experience on the canvas. Our instructors are kind, friendly, and ready to closely supervise and adapt the training basics to fit your unique physique and personal limits.</p>
    `,
  },
  {
    icon: Users,
    title: 'A Supportive Community',
    featured: false,
    body: `
      <p>Here at the "Sting Hive," we aren't just a gym; we are a family. You will meet new, health-conscious friends who will constantly encourage you, cheer you up, and push you to surpass your own limits together.</p>
    `,
  },
];
</script>
