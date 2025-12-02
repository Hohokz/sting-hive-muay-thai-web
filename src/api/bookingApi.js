import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000'
});

export const getSchedules = () => api.get('/schedules');

export const getCapacity = (scheduleId, date) =>
    api.get(`/capacity?schedule_id=${scheduleId}&date=${date}`);

export const createBooking = (data) =>
    api.post('/booking', data);