import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import th from '@/locales/th.json'
import EditBookingModal from './EditBookingModal.vue'
import BookingTimeSlots from '@/components/booking/BookingTimeSlots.vue'
import { api } from '@/api/bookingApi'
import trainerGymApi from '@/api/trainerGymApi'

const modalStore = { open: vi.fn(), closeAll: vi.fn() }

vi.mock('@/api/bookingApi', () => ({
  api: { bookings: { get: vi.fn(), create: vi.fn(), update: vi.fn() } },
}))
vi.mock('@/api/trainerGymApi', () => ({ default: { getGymTrainers: vi.fn() } }))
vi.mock('@/stores/modal', () => ({ useModalStore: () => modalStore }))
vi.mock('@/composables/useSchedules', () => ({ useSchedules: () => ({ fetchSchedules: vi.fn() }) }))
vi.mock('@/composables/useGymClosedDates', () => ({
  useGymClosedDates: () => ({ closedDates: ref([]) }),
}))

const slot = (id, seats) => ({
  id,
  start_time: '18:00:00',
  end_time: '19:00:00',
  available_seats: seats,
})

const savedBooking = (overrides = {}) => ({
  schedule: { gym_enum: 'STING_CLUB', start_time: '18:00:00', end_time: '19:00:00' },
  classes_schedule_id: 5,
  date_booking: '2026-10-30T00:00:00.000+07:00',
  is_private: true,
  client_name: 'Somchai',
  client_phone: '0812345678',
  client_email: 'a@b.co',
  capacity: 3,
  multipleStudents: true,
  trainer: 'Kru Cha',
  ...overrides,
})

const setTrainers = (list) => trainerGymApi.getGymTrainers.mockResolvedValue({ data: list })

const mountModal = async ({ bookingId = null, booking, locale = 'en' } = {}) => {
  if (booking) api.bookings.get.mockResolvedValue({ data: { data: [booking] } })
  const w = mount(EditBookingModal, {
    props: { show: true, bookingId },
    global: {
      plugins: [createI18n({ legacy: false, locale, messages: { en, th } })],
      stubs: { BookingCalender: true, BookingTimeSlots: true },
    },
  })
  await flushPromises()
  return w
}

const radios = (w) => w.findAll('input[type="radio"]')
const buttonEndingWith = (w, text) =>
  w.findAll('button').find((b) => b.text().trim().endsWith(text))
const popupRows = (w) => w.find('.max-w-md').findAll('.space-y-4 > div')
const stepper = (w, row, sign) => popupRows(w)[row].findAll('button')[sign === '+' ? 1 : 0]
const stepperValue = (w, row) => Number(popupRows(w)[row].find('span.w-6').text())
const clickTimes = async (el, n) => {
  for (let i = 0; i < n; i++) await el.trigger('click')
}
const openPopup = (w) => buttonEndingWith(w, 'Edit').trigger('click')
const pickSlot = async (w, s) => {
  w.findComponent(BookingTimeSlots).vm.$emit('select', s)
  await flushPromises()
}
const submit = async (w, label) => {
  await buttonEndingWith(w, label).trigger('click')
  await flushPromises()
}
const lastPayload = (fn) => fn.mock.calls.at(-1)?.[1] ?? fn.mock.calls.at(-1)?.[0]

beforeEach(() => {
  vi.clearAllMocks()
  api.bookings.create.mockResolvedValue({})
  api.bookings.update.mockResolvedValue({})
  // Kru Cha is on the booking being edited, so the API reports her busy
  setTrainers([
    { id: 2, name: 'Kru Bank' },
    { id: 3, name: 'Kru Tong' },
  ])
})

describe('EditBookingModal (admin) – create', () => {
  it('private class shows the popup button instead of the 2v1/1v1 radios and trainer search', async () => {
    const w = await mountModal()
    await radios(w)[3].setValue()
    expect(w.text()).not.toContain('2v1')
    expect(w.find('input[placeholder="Search and select trainer..."]').exists()).toBe(false)
    expect(w.text()).toContain('1 trainer(s) / 1 student(s)')
  })

  it('students are capped by the picked slot’s seats', async () => {
    const w = await mountModal()
    await radios(w)[3].setValue()
    await pickSlot(w, slot(9, 2))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 10)
    expect(stepperValue(w, 0)).toBe(2)
  })

  it('a full slot (admins can pick it) still allows only 1 — the API will reject overbooking', async () => {
    const w = await mountModal()
    await radios(w)[3].setValue()
    await pickSlot(w, slot(9, 0))
    await openPopup(w)
    expect(stepper(w, 0, '+').attributes('disabled')).toBeDefined()
  })

  it('popup stays English for admins even when the app locale is Thai', async () => {
    const w = await mountModal({ locale: 'th' })
    await radios(w)[3].setValue()
    await pickSlot(w, slot(9, 5))
    await openPopup(w)
    expect(w.find('.max-w-md').text()).toContain('Trainers & Students')
    expect(w.find('.max-w-md').text()).not.toContain('ครู')
  })

  it('creates with joined trainers and multiple_students from the counts', async () => {
    const w = await mountModal()
    await radios(w)[3].setValue()
    await pickSlot(w, slot(9, 5))
    await w.find('input[placeholder="Full Name"]').setValue('Walk-in')
    await w.find('input[placeholder="example@email.com"]').setValue('w@x.co')
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 3) // 4 students → 2 trainers
    await w.findAll('select')[1].setValue('Kru Tong')
    await buttonEndingWith(w, 'Confirm').trigger('click')
    await submit(w, 'Create Booking')

    expect(api.bookings.create.mock.calls[0][0]).toMatchObject({
      is_private: true,
      capacity: 4,
      trainer: 'Kru Tong',
      multiple_students: true,
    })
  })
})

describe('EditBookingModal (admin) – lock until a time is picked', () => {
  it('new private booking: popup button locked until a class time is picked', async () => {
    const w = await mountModal()
    await radios(w)[3].setValue()
    expect(buttonEndingWith(w, 'Edit').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('Select a class time first')

    await pickSlot(w, slot(9, 5))
    expect(buttonEndingWith(w, 'Edit').attributes('disabled')).toBeUndefined()
  })

  it('editing a booking: its saved time counts, so the button is open right away', async () => {
    const w = await mountModal({ bookingId: 7, booking: savedBooking() })
    expect(buttonEndingWith(w, 'Edit').attributes('disabled')).toBeUndefined()
  })
})

describe('EditBookingModal (admin) – edit', () => {
  it('rebuilds counts from the saved booking (3 students, 2v1 → 2 trainers)', async () => {
    const w = await mountModal({ bookingId: 7, booking: savedBooking() })
    expect(w.text()).toContain('2 trainer(s) / 3 student(s)')
    expect(w.text()).toContain('Currently selected: Kru Cha')
  })

  it('legacy 1v1 booking with 2 students is read as 2 trainers', async () => {
    const w = await mountModal({
      bookingId: 7,
      booking: savedBooking({ capacity: 2, multipleStudents: false, trainer: '' }),
    })
    expect(w.text()).toContain('2 trainer(s) / 2 student(s)')
  })

  it('reads multi-trainer bookings saved as "A, B"', async () => {
    const w = await mountModal({
      bookingId: 7,
      booking: savedBooking({ capacity: 4, trainer: 'Kru Cha, Kru Bank' }),
    })
    expect(w.text()).toContain('Currently selected: Kru Cha, Kru Bank')
  })

  it('keeps its own trainer even though the API lists her as busy, and saves unchanged', async () => {
    const w = await mountModal({ bookingId: 7, booking: savedBooking() })
    await submit(w, 'Update Booking')

    expect(api.bookings.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ capacity: 3, trainer: 'Kru Cha', multiple_students: true }),
    )
  })

  it('own trainer is still offered in the popup dropdown', async () => {
    const w = await mountModal({ bookingId: 7, booking: savedBooking() })
    await openPopup(w)
    const opts = w
      .find('select')
      .findAll('option')
      .map((o) => o.text())
    expect(opts).toContain('Kru Cha')
  })

  it('re-picking its own slot that shows 0 seats still allows its own 3 seats', async () => {
    const w = await mountModal({ bookingId: 7, booking: savedBooking() })
    await pickSlot(w, slot(5, 0))
    expect(w.text()).toContain('2 trainer(s) / 3 student(s)')

    await openPopup(w)
    expect(stepperValue(w, 0)).toBe(3)
    expect(stepper(w, 0, '+').attributes('disabled')).toBeDefined()
    expect(w.find('.max-w-md').text()).toContain('3 seat(s) left in this slot')
  })

  it('moving to another slot with 1 seat shrinks to 1/1 and drops the now-busy trainer', async () => {
    const w = await mountModal({ bookingId: 7, booking: savedBooking() })
    await pickSlot(w, slot(6, 1))

    expect(w.text()).toContain('1 trainer(s) / 1 student(s)')
    expect(w.text()).not.toContain('Kru Cha')
    await submit(w, 'Update Booking')
    expect(lastPayload(api.bookings.update)).toMatchObject({
      capacity: 1,
      trainer: null,
      multiple_students: false,
    })
  })

  it('a legacy group booking above 5 is not silently cut when editing other fields', async () => {
    const w = await mountModal({
      bookingId: 7,
      booking: savedBooking({ is_private: false, capacity: 8, trainer: '' }),
    })
    expect(w.find('input[type="number"][min="1"]').element.value).toBe('8')
    await submit(w, 'Update Booking')
    expect(lastPayload(api.bookings.update)).toMatchObject({ capacity: 8, is_private: false })
  })

  it('a legacy private booking above 5 is blocked with a clear error instead of sent', async () => {
    const w = await mountModal({ bookingId: 7, booking: savedBooking({ capacity: 7 }) })
    await submit(w, 'Update Booking')
    expect(api.bookings.update).not.toHaveBeenCalled()
    expect(modalStore.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: 'error', message: expect.stringContaining('at most 5') }),
    )
  })

  it('switching a private booking to group sends no trainer', async () => {
    const w = await mountModal({ bookingId: 7, booking: savedBooking() })
    await radios(w)[2].setValue() // group
    await pickSlot(w, slot(8, 5))
    await submit(w, 'Update Booking')
    expect(lastPayload(api.bookings.update)).toMatchObject({
      is_private: false,
      trainer: null,
      multiple_students: false,
    })
  })
})
