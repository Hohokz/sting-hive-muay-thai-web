<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile Header with Hamburger -->
    <header
      class="md:hidden fixed top-0 left-0 right-0 h-16 bg-black text-white flex items-center justify-between px-4 z-50"
    >
      <button @click="open = !open" class="text-2xl">☰</button>
      <h1 class="text-lg font-bold text-red-500">ADMIN MANAGER</h1>
      <div class="w-8"></div>
      <!-- Spacer for centering -->
    </header>

    <!-- Sidebar -->
    <aside
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      class="fixed h-screen z-40 bg-black text-white p-4 transition-all duration-300 flex flex-col justify-between overflow-hidden"
      :class="[
        open ? 'left-0 w-64 top-16 md:top-0' : '-left-64 md:left-0',
        'md:flex md:top-0',
        open || hover ? 'md:w-64' : 'md:w-16',
      ]"
    >
      <div>
        <h1
          class="hidden md:block text-xl font-bold text-red-500 mb-8 whitespace-nowrap transition-opacity duration-300"
          :class="open || hover ? 'opacity-100' : 'opacity-0'"
        >
          ADMIN MANAGER
        </h1>

        <nav class="space-y-3 text-sm">
          <RouterLink
            to="/"
            class="flex items-center gap-4 hover:text-red-400 group h-6"
            @click="closeMobileSidebar"
          >
            <img
              src="/dashboard/clock-two-svgrepo-com.svg"
              class="w-5 h-5 shrink-0"
              style="filter: brightness(0) invert(1)"
              alt="Booking"
            />
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="[
                open || hover
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none',
              ]"
            >
              Booking
            </span>
          </RouterLink>
          <RouterLink
            to="/admin"
            class="flex items-center gap-4 hover:text-red-400 group h-6"
            @click="closeMobileSidebar"
          >
            <img
              src="/dashboard/board-svgrepo-com.svg"
              class="w-5 h-5 shrink-0"
              style="filter: brightness(0) invert(1)"
              alt="Board"
            />
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="[
                open || hover
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none',
              ]"
            >
              Main Dashboard
            </span>
          </RouterLink>

          <div class="pt-4 pb-1 border-t border-gray-800 overflow-hidden">
            <p
              class="text-[10px] uppercase text-gray-500 font-bold mb-2 tracking-widest transition-opacity duration-300 whitespace-nowrap"
              :class="open || hover ? 'opacity-100' : 'opacity-0'"
            >
              Gym Filter
            </p>
          </div>

          <RouterLink
            :to="{ path: '/admin/bookings', query: { gym: 'STING_HIVE' } }"
            class="flex items-center gap-4 hover:text-red-400 h-6"
            @click="closeMobileSidebar"
          >
            <img
              src="/dashboard/appointments-svgrepo-com.svg"
              class="w-5 h-5 shrink-0"
              style="filter: brightness(0) invert(1)"
              alt="Sting Hive"
            />
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="[
                open || hover
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none',
              ]"
            >
              Sting Hive Booking List
            </span>
          </RouterLink>

          <RouterLink
            :to="{ path: '/admin/bookings', query: { gym: 'STING_CLUB' } }"
            class="flex items-center gap-4 hover:text-red-400 h-6"
            @click="closeMobileSidebar"
          >
            <img
              src="/dashboard/appointments-svgrepo-com.svg"
              class="w-5 h-5 shrink-0"
              style="filter: brightness(0) invert(1)"
              alt="Sting Club"
            />
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="[
                open || hover
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none',
              ]"
            >
              Sting Club Booking List
            </span>
          </RouterLink>

          <RouterLink
            v-if="auth.isAdmin"
            to="/admin/users"
            class="flex items-center gap-4 hover:text-red-400 h-6"
            @click="closeMobileSidebar"
          >
            <img
              src="/dashboard/user-circle-1-svgrepo-com.svg?url"
              class="w-5 h-5 shrink-0"
              style="filter: brightness(0) invert(1)"
              alt="Users"
            />
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="[
                open || hover
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none',
              ]"
            >
              Users Manager
            </span>
          </RouterLink>

          <RouterLink
            v-if="auth.isAdmin"
            to="/admin/logs"
            class="flex items-center gap-4 hover:text-red-400 h-6"
            @click="closeMobileSidebar"
          >
            <img
              src="/dashboard/board-svgrepo-com.svg"
              class="w-5 h-5 shrink-0"
              style="filter: brightness(0) invert(1)"
              alt="Logs"
            />
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="[
                open || hover
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none',
              ]"
            >
              Activity Logs
            </span>
          </RouterLink>

          <RouterLink
            v-if="auth.isAdmin"
            to="/admin/trainers"
            class="flex items-center gap-4 hover:text-red-400 h-6"
            @click="closeMobileSidebar"
          >
            <img
              src="/dashboard/user-circle-1-svgrepo-com.svg?url"
              class="w-5 h-5 shrink-0"
              style="filter: brightness(0) invert(1)"
              alt="Trainers"
            />
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="[
                open || hover
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none',
              ]"
            >
              Trainer Management
            </span>
          </RouterLink>
        </nav>
      </div>

      <button @click="logout" class="flex items-center gap-4 text-red-400 hover:text-white h-6">
        <img
          src="/dashboard/log-out-exit-svgrepo-com.svg?url"
          class="w-5 h-5 shrink-0"
          style="filter: brightness(0) invert(1)"
          alt="Logout"
        />
        <span
          class="transition-all duration-300 whitespace-nowrap"
          :class="[
            open || hover
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-4 pointer-events-none',
          ]"
        >
          Logout
        </span>
      </button>
    </aside>

    <!-- Backdrop (Mobile only) -->
    <div
      v-if="open"
      @click="open = false"
      class="fixed inset-0 bg-black/40 z-30 md:hidden top-16"
    ></div>

    <!-- Content Wrapper -->
    <div
      class="min-h-screen transition-all duration-300"
      :class="[
        // Mobile: no left margin, add top padding for header
        'pt-16 md:pt-0',
        // Desktop: margin based on sidebar state
        open || hover ? 'md:ml-64' : 'md:ml-16',
      ]"
    >
      <!-- Page Content -->
      <main class="p-4 sm:p-8">
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

const closeMobileSidebar = () => {
  // Only close on mobile (screen width < 768px)
  if (window.innerWidth < 768) {
    open.value = false
  }
}

const logout = () => {
  auth.logout()
  router.push('/admin')
}
</script>
