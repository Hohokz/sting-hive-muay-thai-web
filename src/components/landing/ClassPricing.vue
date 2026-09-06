<template>
  <section class="bg-[#111] py-20 px-6">
    <!-- Title -->
    <div class="text-center mb-14">
      <h2 class="font-bebas text-5xl md:text-6xl tracking-wide text-white">
        {{ t('landing.pricing.title_pre') }} <span class="text-red-600">{{ t('landing.pricing.title_highlight') }}</span>
      </h2>
      <p class="text-white/60 text-sm mt-2 mb-4">
        {{ t('landing.pricing.subtitle') }}
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
          {{ t('landing.pricing.best_price_badge') }}
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
      {{ t('landing.pricing.footnote') }}
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dumbbell, Users, CalendarDays, Ticket, PersonStanding } from 'lucide-vue-next';

const { t } = useI18n()

const plans = computed(() => [
  {
    price: '300฿',
    icon: Dumbbell,
    type: t('landing.pricing.group_training'),
    name: t('landing.pricing.plan_1_name'),
    note: t('landing.pricing.plan_1_note'),
    featured: false,
  },
  {
    price: '1,900฿',
    icon: Users,
    type: t('landing.pricing.group_training'),
    name: t('landing.pricing.plan_7_name'),
    expiry: t('landing.pricing.plan_7_expiry'),
    note: t('landing.pricing.note_not_shared'),
    featured: false,
  },
  {
    price: '2,900฿',
    icon: CalendarDays,
    type: t('landing.pricing.group_training'),
    name: t('landing.pricing.plan_15_name'),
    expiry: t('landing.pricing.plan_15_expiry'),
    note: t('landing.pricing.note_not_shared'),
    featured: false,
  },
  {
    price: '4,900฿',
    icon: Ticket,
    type: t('landing.pricing.group_training'),
    name: t('landing.pricing.plan_30_name'),
    expiry: t('landing.pricing.plan_30_expiry'),
    note: t('landing.pricing.note_shared'),
    featured: true,
  },
  {
    prices: ['800฿ / 1 hr', '1,000฿ / 1.5 hrs'],
    icon: PersonStanding,
    type: '',
    name: t('landing.pricing.private_training'),
    expiry: t('landing.pricing.private_expiry'),
    featured: false,
  },
]);
</script>
