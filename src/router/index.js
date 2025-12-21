import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const routes = [
  { path: '/', name: 'home', component: () => import('../pages/LandingPage.vue') },
  {
    path: '/booking',
    name: 'booking',
    component: () => import('@/components/landing/BookingPage.vue'),
  },
  {
    path: '/edit-booking/:id',
    name: 'editBooking',
    component: () => import('@/pages/EditBookingPage.vue'),
  },
  {
    path: '/search-booking',
    name: 'searchBooking',
    component: () => import('@/pages/SearchBookingPage.vue'),
  },
  {
    path: '/admin/dashboard',
    name: 'dashborad',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true, adminOnly: false }, // Accessible by both admin and user
  },
  {
    path: '/admin',
    name: 'login',
    component: () => import('@/pages/AdminPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ ✅ ✅ ROUTER GUARD ตัวจริง
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // ✅ ต้อง Login ก่อนเข้าโซน Admin
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/admin')
  }

  // ✅ เฉพาะ ADMIN เท่านั้น
  if (to.meta.adminOnly && !auth.isAdmin) {
    // alert('❌ Staff ไม่มีสิทธิ์เข้าหน้านี้') // Optional: Use a toast notification instead
    console.warn('Access denied: Admin only')
    return next('/admin/dashboard')
  }

  // Prevent logged-in users from visiting login page again
  if (to.path === '/admin' && auth.isAuthenticated) {
    return next('/admin/dashboard')
  }

  next()
})
export default router
