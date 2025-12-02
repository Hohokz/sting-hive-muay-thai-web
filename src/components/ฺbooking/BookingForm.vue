<template>
    <form @submit.prevent="submit">
        <input v-model="form.client_name" placeholder="ชื่อ" required />
        <input v-model="form.client_email" placeholder="อีเมล" />
        <input v-model="form.client_phone" placeholder="เบอร์โทร" required />

        <button type="submit">Confirm Booking</button>
    </form>
</template>

<script setup>
import { reactive } from 'vue';
import { createBooking } from '../../api/bookingApi';

const props = defineProps({
    scheduleId: Number
});

const form = reactive({
    client_name: '',
    client_email: '',
    client_phone: '',
    capacity: 1
});

const submit = async () => {
    await createBooking({
        ...form,
        classes_schedule_id: props.scheduleId
    });
    alert('Booking success!');
};
</script>
