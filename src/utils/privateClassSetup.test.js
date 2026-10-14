import { describe, it, expect } from 'vitest'
import {
  MAX_STUDENTS,
  MAX_TRAINERS,
  clampTrainers,
  maxStudentsForSeats,
  normalizeStudents,
  normalizeTrainers,
  parseTrainerNames,
  inferPrivateSetup,
  privateBookingFields,
  pruneTrainerSlots,
  resizeTrainerSlots,
  trainerOptionsFor,
  trainerRange,
} from './privateClassSetup'

describe('constants', () => {
  it('5 students at 2 per trainer needs 3 trainers', () => {
    expect(MAX_STUDENTS).toBe(5)
    expect(MAX_TRAINERS).toBe(3)
  })
})

describe('maxStudentsForSeats', () => {
  it.each([
    [1, 1],
    [2, 2],
    [5, 5],
    [6, 5],
    [999, 5],
  ])('seats %s → %s', (seats, expected) => {
    expect(maxStudentsForSeats(seats)).toBe(expected)
  })

  it('no slot chosen yet falls back to the max', () => {
    expect(maxStudentsForSeats(undefined)).toBe(5)
    expect(maxStudentsForSeats(null)).toBe(5)
    expect(maxStudentsForSeats('')).toBe(5)
  })

  it('accepts seats sent as a numeric string', () => {
    expect(maxStudentsForSeats('2')).toBe(2)
    expect(maxStudentsForSeats(' 3 ')).toBe(3)
  })

  it('rounds fractional seats down, never up past what is left', () => {
    expect(maxStudentsForSeats(2.9)).toBe(2)
  })

  it('never drops below 1 for zero / negative seats (full slots are hidden upstream)', () => {
    expect(maxStudentsForSeats(0)).toBe(1)
    expect(maxStudentsForSeats(-3)).toBe(1)
  })

  it('garbage seats fall back to the max instead of NaN', () => {
    expect(maxStudentsForSeats('abc')).toBe(5)
    expect(maxStudentsForSeats(NaN)).toBe(5)
    expect(maxStudentsForSeats(Infinity)).toBe(5)
    expect(maxStudentsForSeats({})).toBe(5)
  })
})

describe('normalizeStudents', () => {
  it('keeps valid counts', () => {
    expect(normalizeStudents(3)).toBe(3)
  })

  it('floors decimals (2.7 people is not a thing)', () => {
    expect(normalizeStudents(2.7)).toBe(2)
    expect(normalizeStudents(1.999)).toBe(1)
  })

  it('caps at the given max', () => {
    expect(normalizeStudents(9, 2)).toBe(2)
    expect(normalizeStudents(5)).toBe(5)
    expect(normalizeStudents(6)).toBe(5)
  })

  it('empty / zero / negative / non-numeric become 1', () => {
    for (const v of ['', 0, -1, -0.5, 0.4, 'abc', null, undefined, NaN]) {
      expect(normalizeStudents(v)).toBe(1)
    }
  })

  it('huge and exponent input are capped', () => {
    expect(normalizeStudents(1e21)).toBe(5)
    expect(normalizeStudents('1e3')).toBe(5)
  })
})

describe('trainerRange', () => {
  it.each([
    [1, 1, 1],
    [2, 1, 2],
    [3, 2, 3],
    [4, 2, 3],
    [5, 3, 3],
  ])('%s students → %s..%s trainers', (students, min, max) => {
    expect(trainerRange(students)).toEqual({ min, max })
  })

  it('min never exceeds max for any allowed student count', () => {
    for (let s = 1; s <= MAX_STUDENTS; s++) {
      const { min, max } = trainerRange(s)
      expect(min).toBeLessThanOrEqual(max)
      // every count in range respects 2 students per trainer and no idle trainer
      for (let tr = min; tr <= max; tr++) {
        expect(tr * 2).toBeGreaterThanOrEqual(s)
        expect(tr).toBeLessThanOrEqual(s)
      }
    }
  })
})

describe('clampTrainers', () => {
  it('raises trainers when students outgrow them', () => {
    expect(clampTrainers(1, 5)).toBe(3)
    expect(clampTrainers(1, 3)).toBe(2)
  })

  it('lowers trainers when students drop below them', () => {
    expect(clampTrainers(3, 1)).toBe(1)
    expect(clampTrainers(3, 2)).toBe(2)
  })

  it('keeps an already valid count', () => {
    expect(clampTrainers(2, 4)).toBe(2)
  })
})

describe('resizeTrainerSlots', () => {
  it('pads new slots with "no preference"', () => {
    expect(resizeTrainerSlots(['A'], 3)).toEqual(['A', '', ''])
  })

  it('truncates extra slots, dropping their picks', () => {
    expect(resizeTrainerSlots(['A', 'B', 'C'], 1)).toEqual(['A'])
  })

  it('normalizes holes / undefined to ""', () => {
    expect(resizeTrainerSlots([, undefined, null], 3)).toEqual(['', '', ''])
  })

  it('returns a new array (does not mutate input)', () => {
    const slots = ['A']
    const out = resizeTrainerSlots(slots, 2)
    expect(out).not.toBe(slots)
    expect(slots).toEqual(['A'])
  })
})

describe('pruneTrainerSlots', () => {
  const list = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
  ]

  it('clears picks no longer offered, keeps slot positions', () => {
    expect(pruneTrainerSlots(['C', 'B', ''], list)).toEqual(['', 'B', ''])
  })

  it('an empty trainer list clears every pick', () => {
    expect(pruneTrainerSlots(['A', 'B'], [])).toEqual(['', ''])
  })
})

describe('trainerOptionsFor', () => {
  const list = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
    { id: 3, name: 'C' },
  ]

  it('hides trainers picked in other slots but keeps this slot’s own pick', () => {
    const slots = ['A', 'B', '']
    expect(trainerOptionsFor(list, slots, 0).map((t) => t.name)).toEqual(['A', 'C'])
    expect(trainerOptionsFor(list, slots, 1).map((t) => t.name)).toEqual(['B', 'C'])
    expect(trainerOptionsFor(list, slots, 2).map((t) => t.name)).toEqual(['C'])
  })

  it('more slots than trainers: the extra slots offer nothing (only "no preference")', () => {
    const two = list.slice(0, 2)
    expect(trainerOptionsFor(two, ['A', 'B', ''], 2)).toEqual([])
  })
})

describe('normalizeTrainers', () => {
  it('drops blank names that would collide with "no preference"', () => {
    const out = normalizeTrainers([
      { id: 1, name: '' },
      { id: 2, name: '   ' },
      { id: 3, name: null },
      { id: 4, name: 'A' },
    ])
    expect(out).toEqual([{ id: 4, name: 'A' }])
  })

  it('drops duplicate names (first wins) and trims whitespace', () => {
    const out = normalizeTrainers([
      { id: 1, name: 'Kru Cha' },
      { id: 2, name: ' Kru Cha ' },
      { id: 3, name: 'Kru Bank' },
    ])
    expect(out).toEqual([
      { id: 1, name: 'Kru Cha' },
      { id: 3, name: 'Kru Bank' },
    ])
  })

  it('stringifies numeric names', () => {
    expect(normalizeTrainers([{ id: 1, name: 7 }])).toEqual([{ id: 1, name: '7' }])
  })
})

describe('privateBookingFields', () => {
  it('no trainers picked → trainer null', () => {
    expect(privateBookingFields(1, 1, [''])).toEqual({ trainer: null, multiple_students: false })
  })

  it('joins picked trainers and skips empty slots', () => {
    expect(privateBookingFields(5, 3, ['', 'A', 'B']).trainer).toBe('A, B')
  })

  it('multiple_students only when some trainer has 2 students', () => {
    expect(privateBookingFields(2, 2, []).multiple_students).toBe(false)
    expect(privateBookingFields(3, 2, []).multiple_students).toBe(true)
    expect(privateBookingFields(2, 1, []).multiple_students).toBe(true)
  })
})

describe('parseTrainerNames', () => {
  it('splits "A, B" and trims', () => {
    expect(parseTrainerNames('Kru Cha, Kru Bank')).toEqual(['Kru Cha', 'Kru Bank'])
  })

  it('ignores blanks, stray commas and spaces', () => {
    expect(parseTrainerNames(' , Kru Cha ,, ')).toEqual(['Kru Cha'])
  })

  it('empty / null / undefined → no names', () => {
    expect(parseTrainerNames('')).toEqual([])
    expect(parseTrainerNames(null)).toEqual([])
    expect(parseTrainerNames(undefined)).toEqual([])
  })
})

describe('inferPrivateSetup', () => {
  it('2v1 flag → 1 trainer per 2 students', () => {
    expect(inferPrivateSetup({ capacity: 3, multipleStudents: true, trainer: '' })).toEqual({
      students: 3,
      trainerCount: 2,
      trainers: ['', ''],
    })
  })

  it('1v1 flag → 1 trainer per student (capped at 3)', () => {
    expect(inferPrivateSetup({ capacity: 2, multipleStudents: false }).trainerCount).toBe(2)
    expect(inferPrivateSetup({ capacity: 5, multipleStudents: false }).trainerCount).toBe(3)
  })

  it('named trainers win over the flag when there are more of them', () => {
    const out = inferPrivateSetup({ capacity: 4, multipleStudents: true, trainer: 'A, B, C' })
    expect(out.trainerCount).toBe(3)
    expect(out.trainers).toEqual(['A', 'B', 'C'])
  })

  it('more named trainers than students allow are cut to the valid count', () => {
    const out = inferPrivateSetup({ capacity: 1, multipleStudents: false, trainer: 'A, B' })
    expect(out).toEqual({ students: 1, trainerCount: 1, trainers: ['A'] })
  })

  it('2v1 flag with only 1 student (inconsistent data) → still 1 trainer', () => {
    expect(inferPrivateSetup({ capacity: 1, multipleStudents: true }).trainerCount).toBe(1)
  })

  it('missing / garbage capacity falls back to 1 student', () => {
    expect(inferPrivateSetup({ capacity: null }).students).toBe(1)
    expect(inferPrivateSetup({ capacity: 'x' }).students).toBe(1)
  })
})
