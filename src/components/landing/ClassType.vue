<template>
  <section class="py-20 bg-gray-400">
    <div class="max-w-6xl mx-auto text-center px-6">
      <h2 class="text-3xl text-gray-100 font-bold mb-10">Training Details</h2>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- ✅ LEFT IMAGE -->
        <div class="bg-black p-5 rounded-3xl shadow-xl aspect-[4/5]
           flex items-center justify-center border border-white/10">
          <img src="@/assets/class_schedule_for_web.jpg" alt="Class Schedule"
            class="w-full h-full object-contain rounded-2xl" />
        </div>

        <!-- ✅ RIGHT IMAGE -->
        <div class="bg-black p-5 rounded-3xl shadow-xl aspect-[4/5]
           flex items-center justify-center border border-white/10">
          <img src="@/assets/class_pricing_for_web.jpg" alt="Class Pricing"
            class="w-full h-full object-contain rounded-2xl" />
        </div>
      </div>
    </div>
  </section>
</template>
