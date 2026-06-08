import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import trainerGymApi from '@/api/trainerGymApi'

/** Gym configuration — single source of truth */
export const GYMS = [
  { id: 1, name: 'STING CLUB' },
  { id: 2, name: 'STING HIVE' },
]

/**
 * useTrainerGymStore — trainer ↔ gym assignment management.
 * Extracted from TrainerGymPage.vue.
 */
export const useTrainerGymStore = defineStore('trainerGym', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const selectedGymId = ref(GYMS[0].id)
  const trainers = ref([])
  const availableUsers = ref([])

  const isLoading = ref(false)
  const isLoadingUsers = ref(false)
  const isAssigning = ref(false)
  const isRemoving = ref(false)
  const error = ref(null)

  // ─── Getters ──────────────────────────────────────────────────────────────

  const currentGymName = computed(
    () => GYMS.find((g) => g.id === selectedGymId.value)?.name ?? '',
  )

  /** Users who do NOT yet have a gym assigned */
  const filteredAvailableUsers = computed(() =>
    availableUsers.value.filter((u) => !u.gym_id && !u.gym_enum),
  )

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Load trainers assigned to the currently selected gym. */
  const fetchGymTrainers = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await trainerGymApi.getGymTrainers(selectedGymId.value)
      trainers.value = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
    } catch (err) {
      console.error('[trainerGymStore] fetchGymTrainers error:', err)
      error.value = 'Failed to load trainers'
    } finally {
      isLoading.value = false
    }
  }

  /** Load all users available to be assigned as trainers. */
  const fetchAvailableUsers = async () => {
    isLoadingUsers.value = true
    try {
      const res = await trainerGymApi.getAvailableUsers()
      availableUsers.value = res.data.data ?? res.data ?? []
    } catch (err) {
      console.error('[trainerGymStore] fetchAvailableUsers error:', err)
    } finally {
      isLoadingUsers.value = false
    }
  }

  /**
   * Switch to a different gym and reload its trainers.
   * @param {number} gymId
   */
  const selectGym = async (gymId) => {
    selectedGymId.value = gymId
    await fetchGymTrainers()
  }

  /**
   * Assign a user as a trainer to the current gym.
   * @param {string|number} userId
   * @returns {{ ok: boolean, message?: string }}
   */
  const assignTrainer = async (userId) => {
    if (!userId) return { ok: false, message: 'No user selected' }
    isAssigning.value = true
    try {
      await trainerGymApi.assignTrainer(userId, selectedGymId.value)
      await Promise.all([fetchGymTrainers(), fetchAvailableUsers()])
      return { ok: true }
    } catch (err) {
      const message = err?.response?.data?.message ?? 'Failed to add trainer'
      console.error('[trainerGymStore] assignTrainer error:', err)
      return { ok: false, message }
    } finally {
      isAssigning.value = false
    }
  }

  /**
   * Remove a trainer from the current gym.
   * @param {object} trainer
   * @returns {{ ok: boolean, message?: string }}
   */
  const removeTrainer = async (trainer) => {
    if (!trainer) return { ok: false, message: 'No trainer specified' }
    isRemoving.value = true
    try {
      await trainerGymApi.removeTrainer(trainer.id, selectedGymId.value)
      await Promise.all([fetchGymTrainers(), fetchAvailableUsers()])
      return { ok: true }
    } catch (err) {
      console.error('[trainerGymStore] removeTrainer error:', err)
      return { ok: false, message: 'Failed to remove trainer' }
    } finally {
      isRemoving.value = false
    }
  }

  return {
    // Config
    gyms: GYMS,
    // State
    selectedGymId,
    trainers,
    availableUsers,
    isLoading,
    isLoadingUsers,
    isAssigning,
    isRemoving,
    error,
    // Getters
    currentGymName,
    filteredAvailableUsers,
    // Actions
    fetchGymTrainers,
    fetchAvailableUsers,
    selectGym,
    assignTrainer,
    removeTrainer,
  }
})
