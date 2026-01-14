import axios from '@/utils/axios'

const trainerGymApi = {
  getAvailableUsers: () => axios.get('/api/v1/trainer-gyms/available-users'),

  getGymTrainers: (gymId, params) => axios.get(`/api/v1/trainer-gyms/${gymId}`, { params }),

  assignTrainer: (userId, gymId) => axios.post('/api/v1/trainer-gyms/assign', { userId, gymId }),

  removeTrainer: (userId, gymId) => axios.post('/api/v1/trainer-gyms/remove', { userId, gymId }),
}

export default trainerGymApi
