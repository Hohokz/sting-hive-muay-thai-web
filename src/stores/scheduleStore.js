import { defineStore } from 'pinia';
import { getSchedules, getCapacity } from '../api/bookingApi';

export const useScheduleStore = defineStore('schedule', {
    state: () => ({
        schedules: [],
        selectedDate: null,
        selectedSchedule: null,
        selectedCapacity: null
    }),

    actions: {
        async loadSchedules() {
            const { data } = await getSchedules();
            this.schedules = data;
        },

        async loadCapacity(scheduleId, date) {
            const { data } = await getCapacity(scheduleId, date);
            this.selectedCapacity = data.capacity;
        }
    }
});
