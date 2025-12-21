<template>
  <div class="min-h-screen bg-gray-100">
    <!-- ✅ FIXED SIDEBAR -->
    <aside
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      class="fixed top-0 left-0 h-screen z-40 bg-black text-white p-4 transition-all duration-300 flex flex-col justify-between"
      :class="open || hover ? 'w-64' : 'w-16'"
    >
      <!-- ✅ LOGO -->
      <div>
        <h1
          class="text-xl font-bold text-red-500 mb-8 whitespace-nowrap overflow-hidden transition-all"
          :class="open || hover ? 'opacity-100' : 'opacity-0'"
        >
          STING ADMIN
        </h1>

        <!-- ✅ MENU -->
        <nav class="space-y-3 text-sm">
          <div class="pt-4 pb-1 border-t border-gray-800">
            <p
              v-if="open || hover"
              class="text-[10px] uppercase text-gray-500 font-bold mb-2 tracking-widest text-gray-400"
            >
              Gym Filter
            </p>
          </div>

          <RouterLink
            :to="{ path: '/admin/bookings', query: { gym: 'STING_HIVE' } }"
            class="flex items-center gap-3 hover:text-red-400"
          >
            🐝 <span v-if="open || hover">Sting Hive</span>
          </RouterLink>

          <RouterLink
            :to="{ path: '/admin/bookings', query: { gym: 'STING_CLUB' } }"
            class="flex items-center gap-3 hover:text-red-400"
          >
            🥊 <span v-if="open || hover">Sting Club</span>
          </RouterLink>

          <RouterLink
            v-if="auth.isAdmin"
            to="/admin/users"
            class="flex items-center gap-3 hover:text-red-400"
          >
            👤 <span v-if="open || hover">Users</span>
          </RouterLink>
        </nav>
      </div>

      <!-- ✅ LOGOUT -->
      <button @click="logout" class="flex items-center gap-3 text-red-400 hover:text-white">
        🚪 <span v-if="open || hover">Logout</span>
      </button>
    </aside>

    <!-- ✅ BACKDROP (เฉพาะ Mobile) -->
    <div v-if="open" @click="open = false" class="fixed inset-0 bg-black/40 z-30 md:hidden"></div>

    <!-- ✅ CONTENT WRAPPER (ดันตาม sidebar) -->
    <div
      class="min-h-screen transition-all duration-300"
      :class="open || hover ? 'ml-64' : 'ml-16'"
    >
      <!-- ✅ PAGE CONTENT -->
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const open = ref(false) // mobile toggle
const hover = ref(false) // desktop hover expand

const logout = () => {
  auth.logout()
  router.push('/admin')
}
</script>
