// Private class rules: 1 trainer teaches up to 2 students, max 5 students per booking
export const MAX_STUDENTS = 5
export const STUDENTS_PER_TRAINER = 2
export const MAX_TRAINERS = Math.ceil(MAX_STUDENTS / STUDENTS_PER_TRAINER)

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

/**
 * Most students a booking can take: the slot's seats left, capped at MAX_STUDENTS.
 * No slot / unknown seats → MAX_STUDENTS. Seats may arrive as a numeric string.
 */
export const maxStudentsForSeats = (seats) => {
  if (seats === null || seats === undefined || seats === '') return MAX_STUDENTS
  const n = Math.floor(Number(seats))
  if (!Number.isFinite(n)) return MAX_STUDENTS
  return clamp(n, 1, MAX_STUDENTS)
}

/** Coerces a typed student count to a whole number within 1..max */
export const normalizeStudents = (value, max = MAX_STUDENTS) => {
  const n = Math.floor(Number(value))
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, max)
}

/** Allowed trainer counts for a student count: enough to cover them, never more than them */
export const trainerRange = (students) => ({
  min: Math.ceil(students / STUDENTS_PER_TRAINER),
  max: Math.min(MAX_TRAINERS, students),
})

export const clampTrainers = (trainers, students) => {
  const { min, max } = trainerRange(students)
  return clamp(trainers, min, max)
}

// '' in a slot means "no preference" for that trainer
export const resizeTrainerSlots = (slots, count) =>
  Array.from({ length: count }, (_, i) => slots[i] || '')

/** Drops picks that are no longer offered (e.g. the trainer list was refetched) */
export const pruneTrainerSlots = (slots, trainers) => {
  const names = new Set(trainers.map((tr) => tr.name))
  return slots.map((name) => (names.has(name) ? name : ''))
}

/** Trainers offered in a slot: hide ones already picked in another slot */
export const trainerOptionsFor = (trainers, slots, index) =>
  trainers.filter((tr) => tr.name === slots[index] || !slots.includes(tr.name))

/**
 * Cleans the trainer list from the API: no blank names (they'd collide with the
 * "no preference" option) and no duplicate names (bookings store trainers by name).
 */
export const normalizeTrainers = (trainers) => {
  const seen = new Set()
  return trainers
    .map((tr) => ({ ...tr, name: String(tr.name ?? '').trim() }))
    .filter((tr) => {
      if (!tr.name || seen.has(tr.name)) return false
      seen.add(tr.name)
      return true
    })
}

/** Booking payload fields for a private class */
export const privateBookingFields = (students, trainerCount, slots) => ({
  trainer: slots.filter(Boolean).join(', ') || null,
  multiple_students: students > trainerCount,
})

/** Splits a saved trainer field ("A, B") back into names */
export const parseTrainerNames = (trainer) =>
  String(trainer ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

/**
 * Rebuilds the popup state from a saved private booking. The trainer count isn't
 * stored, so it's inferred: at least the named trainers, otherwise 1 trainer per
 * student for a 1-on-1 booking or 1 per 2 students when multipleStudents is set.
 */
export const inferPrivateSetup = ({ capacity, multipleStudents, trainer }) => {
  const students = normalizeStudents(capacity)
  const names = parseTrainerNames(trainer)
  const fromStudents = multipleStudents ? Math.ceil(students / STUDENTS_PER_TRAINER) : students
  const trainerCount = clampTrainers(Math.max(names.length, fromStudents), students)
  return { students, trainerCount, trainers: resizeTrainerSlots(names, trainerCount) }
}
