import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './auth'

/**
 * usePermissionStore — role-based permission helpers.
 *
 * Derive all permission checks from the auth store here rather than
 * scattering `auth.isAdmin` checks across templates.
 */
export const usePermissionStore = defineStore('permission', () => {
  const auth = useAuthStore()

  /** True if the current user has the ADMIN role */
  const isAdmin = computed(() => auth.isAdmin)

  /** True if the current user is a regular USER (staff) */
  const isUser = computed(() => {
    const role = auth.user?.role?.toUpperCase()
    return role === 'USER'
  })

  /** True if the user can perform write/edit operations */
  const canEdit = computed(() => auth.isAuthenticated)

  /** True if the user can manage other users */
  const canManageUsers = computed(() => auth.isAdmin)

  /** True if the user can view activity logs */
  const canViewLogs = computed(() => auth.isAdmin)

  return {
    isAdmin,
    isUser,
    canEdit,
    canManageUsers,
    canViewLogs,
  }
})
