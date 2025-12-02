import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'booking', component: () => import('../pages/BookingPage.vue') },
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
