<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      <form @submit.prevent="login">
        <input
          v-model="email"
          type="text"
          placeholder="Username"
          class="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-black/5"
          required
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full border p-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-black/5"
          required
        />

        <button
          type="submit"
          class="w-full bg-black text-white py-3 rounded disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:bg-gray-800 flex items-center justify-center"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Login</span>

          <div v-else class="flex items-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Logging in...
          </div>
        </button>
      </form>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-2xl w-[340px] text-center shadow-xl animate-fadeIn">
        <h3
          class="text-lg font-semibold mb-2"
          :class="{
            'text-yellow-500': modalType === 'warning',
            'text-red-500': modalType === 'error',
            'text-green-500': modalType === 'success',
          }"
        >
          {{ modalTitle }}
        </h3>
        <p class="text-gray-600 mb-5">{{ modalMessage }}</p>
        <button
          class="px-8 py-2 rounded-lg text-white font-semibold transition"
          :class="{
            'bg-yellow-500 hover:bg-yellow-600': modalType === 'warning',
            'bg-red-500 hover:bg-red-600': modalType === 'error',
            'bg-green-500 hover:bg-green-600': modalType === 'success',
          }"
          @click="showModal = false"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { api } from '@/api/bookingApi'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

// ✅ MODAL STATE
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('error')

const openModal = (title, message, type = 'error') => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = type
  showModal.value = true
}

const login = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    const res = await api.auth.login({
      username: email.value,
      password: password.value,
    })

    const data = res.data
    const token = data.accessToken || data.token || data
    const refreshToken = data.refreshToken || null

    const success = auth.login(token, refreshToken)

    if (success) {
      router.push('/admin/dashboard')
    } else {
      openModal('Login Failed', 'เซสชั่นไม่ถูกต้อง กรุณาลองใหม่', 'error')
    }
  } catch (error) {
    console.error('Login Error:', error)
    const errMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
    openModal('เข้าสู่ระบบไม่สำเร็จ', errMsg, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
