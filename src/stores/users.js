import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/bookingApi'

/**
 * useUsersStore — admin user management (CRUD + status toggle).
 * Extracted from AdminUsersPage.vue.
 */
export const useUsersStore = defineStore('users', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const users = ref([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const isDeleting = ref(false)
  const error = ref(null)

  // ─── Getters ──────────────────────────────────────────────────────────────

  /**
   * Returns a filter function so the component can pass its own search query.
   * Usage: `filteredUsers.value(searchQuery)` or use `getFilteredUsers`.
   */
  const getFilteredUsers = computed(() => (query) => {
    if (!query) return users.value
    const q = query.toLowerCase()
    return users.value.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q),
    )
  })

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Load the full user list from the API. */
  const fetchUsers = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.auth.getUser()
      users.value = res.data.data ?? []
    } catch (err) {
      console.error('[usersStore] fetchUsers error:', err)
      error.value = err?.response?.data?.message ?? 'Failed to load users'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new user.
   * @param {object} data
   * @returns {{ ok: boolean, message?: string }}
   */
  const createUser = async (data) => {
    isSubmitting.value = true
    try {
      await api.auth.createUser(data)
      await fetchUsers()
      return { ok: true }
    } catch (err) {
      const message = err?.response?.data?.message ?? 'Failed to create user'
      console.error('[usersStore] createUser error:', err)
      return { ok: false, message }
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Update an existing user.
   * @param {string|number} id
   * @param {object} data
   * @returns {{ ok: boolean, message?: string }}
   */
  const updateUser = async (id, data) => {
    isSubmitting.value = true
    try {
      await api.auth.updateUser(id, data)
      await fetchUsers()
      return { ok: true }
    } catch (err) {
      const message = err?.response?.data?.message ?? 'Failed to update user'
      console.error('[usersStore] updateUser error:', err)
      return { ok: false, message }
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Delete a user by id and remove from local list.
   * @param {string|number} id
   * @returns {{ ok: boolean, message?: string }}
   */
  const deleteUser = async (id) => {
    isDeleting.value = true
    try {
      await api.auth.deleteUser(id)
      users.value = users.value.filter((u) => u.id !== id)
      return { ok: true }
    } catch (err) {
      const message =
        err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to delete user'
      console.error('[usersStore] deleteUser error:', err)
      return { ok: false, message }
    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Optimistically toggle a user's `is_active` status.
   * Reverts on failure.
   * @param {object} user — the user object from `users` array (mutated in place)
   * @returns {{ ok: boolean, message?: string }}
   */
  const toggleStatus = async (user) => {
    const previous = user.is_active
    user.is_active = !previous
    try {
      const payload = { ...user, is_active: !previous, password: undefined }
      await api.auth.updateUser(user.id, payload)
      return { ok: true }
    } catch (err) {
      // Revert on failure
      user.is_active = previous
      const message =
        err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to update status'
      console.error('[usersStore] toggleStatus error:', err)
      return { ok: false, message }
    }
  }

  return {
    // State
    users,
    isLoading,
    isSubmitting,
    isDeleting,
    error,
    // Getters
    getFilteredUsers,
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
  }
})
