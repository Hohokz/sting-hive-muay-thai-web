<template>
  <section class="bg-[#111] py-20 px-6">
    <!-- Title -->
    <div class="text-center mb-14">
      <h2 class="font-bebas text-5xl md:text-6xl tracking-wide text-white">
        Class <span class="text-red-600">Pricing</span>
      </h2>
      <p class="text-white/60 text-sm mt-2 mb-4">
        Flexible plans for everyone. Find the perfect package to start your Muay Thai journey.
      </p>
      <div class="w-20 h-[3px] bg-red-600 mx-auto" />
    </div>

    <!-- Cards -->
    <div class="max-w-6xl mx-auto flex flex-wrap justify-center gap-5">
      <div v-for="(plan, i) in plans" :key="i"
        class="relative bg-white rounded-2xl p-6 flex flex-col items-center text-center w-48 transition-all duration-300 ease-out hover:scale-110 hover:z-10 hover:shadow-2xl cursor-pointer"
        :class="plan.featured ? 'border-4 border-yellow-400' : 'border border-gray-200'">
        <!-- Best Price badge -->
        <div v-if="plan.featured"
          class="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
          Best Price
        </div>

        <!-- Price -->
        <div class="mb-3" :class="plan.featured ? 'text-yellow-500' : 'text-red-600'">
          <template v-if="plan.prices">
            <div v-for="(p, j) in plan.prices" :key="j" class="font-bebas text-2xl leading-tight">
              {{ p }}
            </div>
          </template>
          <div v-else class="font-bebas text-3xl">{{ plan.price }}</div>
        </div>

        <!-- Icon -->
        <div class="mb-4" :class="plan.featured ? 'text-yellow-500' : 'text-gray-800'">
          <component :is="plan.icon" class="w-10 h-10 mx-auto" stroke-width="1.5" />
        </div>

        <!-- Name -->
        <div class="font-bebas text-sm tracking-widest text-gray-800 leading-tight mb-1">
          {{ plan.type }}
        </div>
        <div class="font-bebas text-xl tracking-wide text-gray-900 leading-tight">
          {{ plan.name }}
        </div>

        <!-- Expiry -->
        <p v-if="plan.expiry" class="text-gray-500 text-xs mt-1">{{ plan.expiry }}</p>

        <!-- Note -->
        <p v-if="plan.note" class="text-xs font-bold tracking-widest uppercase mt-4"
          :class="plan.featured ? 'text-green-500' : 'text-red-500'">
          {{ plan.note }}
        </p>
      </div>
    </div>

    <p class="text-center text-white/40 text-xs italic mt-10">
      * Gloves and hand wrap rental is not included.
    </p>
  </section>
</template>

<script setup>
import { Dumbbell, Users, CalendarDays, Ticket, PersonStanding } from 'lucide-vue-next';

const plans = [
  {
    price: '300฿',
    icon: Dumbbell,
    type: 'Group Training',
    name: '1 Class',
    note: 'Reservation Required',
    featured: false,
  },
  {
    price: '1,900฿',
    icon: Users,
    type: 'Group Training',
    name: '7 Class Pack',
    expiry: 'Expires in 15 days',
    note: 'Coupon cannot be shared',
    featured: false,
  },
  {
    price: '2,900฿',
    icon: CalendarDays,
    type: 'Group Training',
    name: '15 Class Pack',
    expiry: 'Expires in 1 month',
    note: 'Coupon cannot be shared',
    featured: false,
  },
  {
    price: '4,900฿',
    icon: Ticket,
    type: 'Group Training',
    name: '30 Class Pack',
    expiry: 'Expires in 2 months',
    note: 'Coupon Can Be Shared',
    featured: true,
  },
  {
    prices: ['800฿ / 1 hr', '1,000฿ / 1.5 hrs'],
    icon: PersonStanding,
    type: '',
    name: 'Private Training',
    expiry: 'One-on-One training with a dedicated Coach',
    featured: false,
  },
];
</script>
