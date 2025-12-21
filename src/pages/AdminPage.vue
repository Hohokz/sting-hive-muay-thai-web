<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      <input v-model="email" placeholder="Username" class="w-full border p-3 rounded mb-4" />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full border p-3 rounded mb-6"
      />

      <button class="w-full bg-black text-white py-3 rounded" @click="login">Login</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { api } from '@/api/bookingApi' // Updated import
// const STING_HIVE_API_URL = import.meta.env.VITE_STING_HIVE_API_URL || 'localhost:3000' // Removed unused

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

const login = async () => {
  try {
    const res = await api.auth.login({
      username: email.value,
      password: password.value,
    })

    const data = res.data
    // Handle structure variety (accessToken vs token vs direct) based on previous code usage
    const token = data.accessToken || data.token || data
    const refreshToken = data.refreshToken || null // Assume API returns it

    const success = auth.login(token, refreshToken)
    if (success) {
      router.push('/admin/dashboard')
    } else {
      alert('Login failed: Invalid token received')
    }
  } catch (error) {
    console.error(error)
    alert('Login failed: ' + (error.response?.data?.message || error.message))
  }
}
</script>
