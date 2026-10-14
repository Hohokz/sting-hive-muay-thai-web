import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import BookingPage from './BookingPage.vue'
import BookingCalender from '@/components/booking/BookingCalender.vue'
import BookingTimeSlots from '@/components/booking/BookingTimeSlots.vue'
import { api } from '@/api/bookingApi'
import trainerGymApi from '@/api/trainerGymApi'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/api/bookingApi', () => ({ api: { bookings: { create: vi.fn() } } }))
vi.mock('@/api/trainerGymApi', () => ({ default: { getPublicGymTrainers: vi.fn() } }))
vi.mock('@/composables/useGymClosedDates', () => ({
  useGymClosedDates: () => ({ closedDates: ref([]) }),
}))

const slot = (id, seats) => ({
  id,
  start_time: '18:00:00',
  end_time: '19:00:00',
  available_seats: seats,
})

const setTrainers = (list) => trainerGymApi.getPublicGymTrainers.mockResolvedValue({ data: list })

const mountPage = () =>
  mount(BookingPage, {
    global: {
      plugins: [createI18n({ legacy: false, locale: 'en', messages: { en } })],
      stubs: { LanguageSwitcher: true, BookingCalender: true, BookingTimeSlots: true },
    },
  })

const radios = (w) => w.findAll('input[type="radio"]')
const button = (w, text) => w.findAll('button').find((b) => b.text().trim() === text)

// Students row comes first in the popup, trainers second
const popupRows = (w) => w.find('.max-w-md').findAll('.space-y-4 > div')
const stepper = (w, row, sign) => popupRows(w)[row].findAll('button')[sign === '+' ? 1 : 0]
const stepperValue = (w, row) => Number(popupRows(w)[row].find('span.w-6').text())
const clickTimes = async (el, n) => {
  for (let i = 0; i < n; i++) await el.trigger('click')
}

const choosePrivate = async (w) => {
  await radios(w)[0].setValue() // STING_CLUB
  await radios(w)[3].setValue() // private
}
const pickDateAndSlot = async (w, s) => {
  w.findComponent(BookingCalender).vm.$emit('update:modelValue', '2026-10-30')
  await flushPromises()
  w.findComponent(BookingTimeSlots).vm.$emit('select', s)
  await flushPromises()
}
const popupButton = (w) => w.findAll('button').find((b) => b.text().endsWith('Edit'))
const openPopup = (w) => popupButton(w).trigger('click')
const confirm = (w) => button(w, 'Confirm').trigger('click')

const submit = async (w) => {
  await w.find('input[type="text"]').setValue('Somchai')
  await w.find('input[type="email"]').setValue('a@b.co')
  await button(w, 'Proceed to Booking').trigger('click')
  await flushPromises()
  return api.bookings.create.mock.calls.at(-1)?.[0]
}

beforeEach(() => {
  vi.clearAllMocks()
  api.bookings.create.mockResolvedValue({})
  setTrainers([
    { id: 1, name: 'Kru Cha' },
    { id: 2, name: 'Kru Bank' },
    { id: 3, name: 'Kru Tong' },
  ])
})

describe('BookingPage – private class trainers & students popup', () => {
  it('group class keeps the plain participants input, private shows the popup button', async () => {
    const w = mountPage()
    expect(w.find('input[type="number"]').exists()).toBe(true)
    expect(w.text()).not.toContain('student(s)')

    await choosePrivate(w)
    expect(w.find('input[type="number"]').exists()).toBe(false)
    expect(w.text()).toContain('1 trainer(s) / 1 student(s)')
  })

  it('cannot pick more students than seats left (seats 2, clicks + ten times)', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 2))
    await openPopup(w)

    await clickTimes(stepper(w, 0, '+'), 10)
    expect(stepperValue(w, 0)).toBe(2)
    expect(stepper(w, 0, '+').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('2 seat(s) left in this slot')
  })

  it('seats sent as a string still limit students', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, '3'))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 10)
    expect(stepperValue(w, 0)).toBe(3)
  })

  it('trainer range follows students: 5 students locks trainers at exactly 3', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)

    await clickTimes(stepper(w, 0, '+'), 4)
    expect(stepperValue(w, 0)).toBe(5)
    expect(stepperValue(w, 1)).toBe(3)
    expect(stepper(w, 1, '+').attributes('disabled')).toBeDefined()
    expect(stepper(w, 1, '-').attributes('disabled')).toBeDefined()
  })

  it('1 student → only 1 trainer allowed, trainer buttons both disabled', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    expect(stepper(w, 1, '+').attributes('disabled')).toBeDefined()
    expect(stepper(w, 1, '-').attributes('disabled')).toBeDefined()
  })

  it('dropping students pulls trainers down and drops the extra trainer picks', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 4) // 5 students, 3 trainers
    expect(w.findAll('select')).toHaveLength(3)
    await w.findAll('select')[2].setValue('Kru Tong')

    await clickTimes(stepper(w, 0, '-'), 4) // back to 1 student
    expect(stepperValue(w, 1)).toBe(1)
    expect(w.findAll('select')).toHaveLength(1)

    await clickTimes(stepper(w, 0, '+'), 4) // up again: slot 3 must not resurrect Kru Tong
    expect(w.findAll('select')[2].element.value).toBe('')
  })

  it('cancel throws away every change made in the popup', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 3)
    await w.findAll('select')[0].setValue('Kru Cha')
    await button(w, 'Cancel').trigger('click')

    expect(w.text()).toContain('1 trainer(s) / 1 student(s)')
    expect(w.text()).not.toContain('Kru Cha')
  })

  it('clicking the backdrop closes like cancel', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 2)
    await w.find('.fixed.inset-0').trigger('click')
    expect(w.text()).toContain('1 trainer(s) / 1 student(s)')
  })

  it('popup button is locked until a class time is picked', async () => {
    const w = mountPage()
    await choosePrivate(w)
    expect(popupButton(w).attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('Please select a class time first')

    await openPopup(w)
    expect(w.find('.max-w-md').exists()).toBe(false)

    await pickDateAndSlot(w, slot(1, 5))
    expect(popupButton(w).attributes('disabled')).toBeUndefined()
    expect(w.text()).not.toContain('Please select a class time first')
  })

  it('locks again when the picked time is cleared (slots reload after changing date)', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    w.findComponent(BookingTimeSlots).vm.$emit('loading', true)
    await flushPromises()
    expect(popupButton(w).attributes('disabled')).toBeDefined()
  })

  it('a trainer picked in one slot disappears from the other slots', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 2) // 3 students
    await clickTimes(stepper(w, 1, '+'), 1) // 3 trainers
    await w.findAll('select')[0].setValue('Kru Cha')

    const opts = w
      .findAll('select')[1]
      .findAll('option')
      .map((o) => o.text())
    expect(opts).toEqual(['No preference', 'Kru Bank', 'Kru Tong'])
  })

  it('blank and duplicate trainer names from the API are cleaned out', async () => {
    setTrainers([
      { id: 1, name: '' },
      { id: 2, name: 'Kru Cha' },
      { id: 3, name: 'Kru Cha ' },
      { id: 4, username: 'kru_user' },
    ])
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)

    const opts = w
      .find('select')
      .findAll('option')
      .map((o) => o.text())
    expect(opts).toEqual(['No preference', 'Kru Cha', 'kru_user'])
  })

  it('trainer API failure still lets the customer book with no preference', async () => {
    trainerGymApi.getPublicGymTrainers.mockRejectedValue(new Error('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))

    const payload = await submit(w)
    expect(payload).toMatchObject({ is_private: true, trainer: null, capacity: 1 })
  })

  it('switching to a slot whose trainer list lacks the picked trainer clears the pick', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await w.find('select').setValue('Kru Cha')
    await confirm(w)
    expect(w.text()).toContain('Kru Cha')

    setTrainers([{ id: 2, name: 'Kru Bank' }])
    w.findComponent(BookingTimeSlots).vm.$emit('select', slot(2, 5))
    await flushPromises()

    expect(w.text()).not.toContain('Kru Cha')
    expect((await submit(w)).trainer).toBeNull()
  })

  it('5 students in one slot, then switching to a slot with 2 seats shrinks students and trainers', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 4)
    await confirm(w)
    expect(w.text()).toContain('3 trainer(s) / 5 student(s)')

    w.findComponent(BookingTimeSlots).vm.$emit('select', slot(2, 2))
    await flushPromises()
    expect(w.text()).toContain('2 trainer(s) / 2 student(s)')

    const payload = await submit(w)
    expect(payload).toMatchObject({ capacity: 2, participants: 2, multiple_students: false })
  })

  it('submits joined trainer names and multiple_students when a trainer has 2 students', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 4) // 5 students → 3 trainers
    const selects = w.findAll('select')
    await selects[0].setValue('Kru Bank')
    await selects[2].setValue('Kru Cha') // middle slot left as no preference
    await confirm(w)

    const payload = await submit(w)
    expect(payload).toMatchObject({
      is_private: true,
      capacity: 5,
      participants: 5,
      trainer: 'Kru Bank, Kru Cha',
      multiple_students: true,
    })
  })

  it('2 students with 2 trainers is 1-on-1 each → multiple_students false', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await clickTimes(stepper(w, 0, '+'), 1)
    await clickTimes(stepper(w, 1, '+'), 1)
    await confirm(w)
    expect((await submit(w)).multiple_students).toBe(false)
  })

  it('trainers picked in private are not sent after switching back to group', async () => {
    const w = mountPage()
    await choosePrivate(w)
    await pickDateAndSlot(w, slot(1, 5))
    await openPopup(w)
    await w.find('select').setValue('Kru Cha')
    await confirm(w)

    await radios(w)[2].setValue() // group
    w.findComponent(BookingTimeSlots).vm.$emit('select', slot(3, 5))
    await flushPromises()

    expect(await submit(w)).toMatchObject({
      is_private: false,
      trainer: null,
      multiple_students: false,
    })
  })

  it('group → private with 5 participants starts at 3 trainers, not an invalid 1', async () => {
    const w = mountPage()
    await w.find('input[type="number"]').setValue(5)
    await choosePrivate(w)
    expect(w.text()).toContain('3 trainer(s) / 5 student(s)')
  })
})

describe('BookingPage – group participants input', () => {
  it('decimal input is floored (2.7 → 2)', async () => {
    const w = mountPage()
    await w.find('input[type="number"]').setValue(2.7)
    expect(w.find('input[type="number"]').element.value).toBe('2')
  })

  it('typing more than the slot’s seats is capped', async () => {
    const w = mountPage()
    await radios(w)[0].setValue()
    await pickDateAndSlot(w, slot(1, 3))
    await w.find('input[type="number"]').setValue(9)
    expect(w.find('input[type="number"]').element.value).toBe('3')
  })

  it('emptied field is left alone while typing and refilled with 1 on blur', async () => {
    const w = mountPage()
    const input = w.find('input[type="number"]')
    await input.setValue('')
    expect(input.element.value).toBe('')
    await input.trigger('blur')
    expect(input.element.value).toBe('1')
  })

  it('negative input becomes 1', async () => {
    const w = mountPage()
    const input = w.find('input[type="number"]')
    await input.setValue(-4)
    expect(input.element.value).toBe('1')
  })
})
