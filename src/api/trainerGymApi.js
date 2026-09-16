import axios from '@/utils/axios'

const trainerGymApi = {
  getAvailableUsers: () => axios.get('/api/v1/trainer-gyms/available-users'),

  getGymTrainers: (gymId, params) => axios.get(`/api/v1/trainer-gyms/${gymId}`, { params }),

  // Public (no auth required) — id/name only, for the customer booking
  // flow's private-class trainer picker. Use this instead of
  // getGymTrainers on any page a customer can reach without logging in.
  getPublicGymTrainers: (gymId, params) =>
    axios.get(`/api/v1/trainer-gyms/public/${gymId}`, { params }),

  assignTrainer: (userId, gymId) => axios.post('/api/v1/trainer-gyms/assign', { userId, gymId }),

  removeTrainer: (userId, gymId) => axios.post('/api/v1/trainer-gyms/remove', { userId, gymId }),
}

export default trainerGymApi
