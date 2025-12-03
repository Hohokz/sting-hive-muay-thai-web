import { createRouter, createWebHistory } from 'vue-router'

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
    component: () => import('../pages/EditBookingPage.vue'),
  },
  {
    path: '/search-booking',
    name: 'searchBooking',
    component: () => import('../pages/SearchBookingPage.vue'),
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
