/**
 * Pure formatting/display helpers for ActivityLogPage. Extracted out of the
 * component so the log-shape-specific logic (field labels, per-action
 * descriptions, styling rules) can be read and tested independently of the
 * Vue template/state.
 */

// Friendly names for raw field keys, used both in the description line and
// in the changes table of the details modal.
const FIELD_LABELS = {
  classes_schedule_id: 'Class',
  schedule_id: 'Class',
  capacity: 'Seats',
  date_booking: 'Date',
  start_time: 'Start Time',
  end_time: 'End Time',
  start_date: 'Start Date',
  end_date: 'End Date',
  is_close_gym: 'Closes Gym',
  gyms_id: 'Gym ID',
  gym_enum: 'Gym',
  gym_name: 'Gym',
  note: 'Note',
}

// Bookkeeping-only fields that aren't meaningful to show as a "changed" line.
const DIFF_EXCLUDED_KEYS = new Set(['old_capasity', 'schedule_details'])

// Booking status values as actually stored (see models/Enums.js BOOKING_STATUS
// on the API side) — "PAYMENTED" in particular is a known naming quirk there,
// kept as-is on the backend since fixing it needs a DB migration; this is
// purely a display-layer relabel.
const STATUS_LABELS = {
  PENDING: 'Pending',
  SUCCEED: 'Confirmed',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
  RESCHEDULED: 'Rescheduled',
  PAYMENTED: 'Paid',
}

export const formatStatus = (value) => (value ? STATUS_LABELS[value] || value : '—')

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/** Formats a raw field value for display: dates, times, booleans, and long IDs get normalized/shortened. */
export const formatFieldValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (key === 'date_booking' || key === 'start_date' || key === 'end_date') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-GB')
  }
  // Logged old/new times aren't always in the same format (e.g. "20:00:00"
  // from the DB vs "20:00" from a raw request payload) — normalize both to
  // HH:MM so they display consistently and compare equal when unchanged.
  if (key === 'start_time' || key === 'end_time') {
    return typeof value === 'string' ? value.slice(0, 5) : String(value)
  }
  if (typeof value === 'string' && value.length > 20 && /^[0-9a-f-]{20,}$/i.test(value)) {
    return `${value.slice(0, 8)}…`
  }
  return String(value)
}

/** Compares an old_values/new_values pair and returns only the fields that actually changed. */
export const diffValues = (oldValues, newValues) => {
  if (!oldValues || !newValues) return []
  const keys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
  const changes = []
  for (const key of keys) {
    if (DIFF_EXCLUDED_KEYS.has(key)) continue
    const oldVal = oldValues[key]
    const newVal = newValues[key]
    if (typeof oldVal === 'object' || typeof newVal === 'object') continue

    const from = formatFieldValue(key, oldVal)
    const to = formatFieldValue(key, newVal)
    // Compare the normalized display values, not the raw ones — old/new
    // values are sometimes serialized differently (date-with-time vs plain
    // date, "HH:MM:SS" vs "HH:MM") for the exact same underlying value.
    if (from === to) continue

    changes.push({ key, label: FIELD_LABELS[key] || key, from, to })
  }
  return changes
}

const summarizeChanges = (details) => {
  const changes = diffValues(details?.old_values, details?.new_values)
  if (!changes.length) return 'No changes'
  return changes.map((c) => `${c.label}: ${c.from} → ${c.to}`).join(', ')
}

/**
 * Builds a " · Gym · start–end" suffix for advance-schedule rules, from
 * whichever of gym_name/start_date/end_date the log actually has. Older log
 * rows (written before the API started recording this) simply omit it.
 */
const formatAdvanceRuleScope = (details) => {
  const parts = []
  if (details.gym_name) parts.push(details.gym_name)
  if (details.start_date || details.end_date) {
    const start = formatFieldValue('start_date', details.start_date)
    const end = formatFieldValue('end_date', details.end_date)
    parts.push(start === end ? start : `${start}–${end}`)
  }
  return parts.length ? ` · ${parts.join(' · ')}` : ''
}

/** Builds a one-line, human-readable summary of what a log entry actually recorded. */
export const getLogDescription = (log) => {
  if (log.description) return log.description
  if (log.details?.description) return log.details.description

  const details = log.details || {}
  const key = `${log.service}:${log.action}`

  switch (key) {
    case 'BOOKING:CREATE':
      return `${details.client_name || 'Client'} · ${formatFieldValue('date_booking', details.date_booking)} · ${details.capacity ?? '?'} seat(s)`
    case 'BOOKING:UPDATE':
    case 'SCHEDULE:UPDATE':
    case 'SCHEDULE:UPDATE_ADVANCED':
      return summarizeChanges(details)
    case 'BOOKING:UPDATE_NOTE':
      return details.note ? `"${details.note}"` : 'Note cleared'
    case 'BOOKING:UPDATE_STATUS':
    case 'BOOKING:UPDATE_PAYMENT':
      return `${formatStatus(details.old_status)} → ${formatStatus(details.new_status)}`
    case 'BOOKING:UPDATE_TRAINER':
      return `${details.old_trainer || 'None'} → ${details.new_trainer || 'None'}`
    case 'SCHEDULE:CREATE':
      return `${details.start_time?.slice(0, 5) || '?'}-${details.end_time?.slice(0, 5) || '?'} (${details.gym_enum || '-'}), capacity ${details.capacity ?? '?'}`
    case 'SCHEDULE:DELETE':
      return `${details.start_time?.slice(0, 5) || '?'}-${details.end_time?.slice(0, 5) || '?'}`
    case 'SCHEDULE:CREATE_ADVANCED': {
      const what = details.is_close_gym ? 'Gym closure' : `Capacity override → ${details.capacity ?? '?'} seats`
      return `${what}${formatAdvanceRuleScope(details)}`
    }
    case 'SCHEDULE:DELETE_ADVANCED': {
      const what = details.is_close_gym ? 'Gym closure removed' : 'Capacity override removed'
      return `${what}${formatAdvanceRuleScope(details)}`
    }
    case 'TRAINER_GYM:ASSIGN':
      return `${details.trainer_name || 'Trainer'} → ${details.gym_name || 'Gym'}`
    case 'TRAINER_GYM:REMOVE':
      return `${details.trainer_name || 'Trainer'} ✕ ${details.gym_name || 'Gym'}`
    case 'USER:LOGIN':
      return `Role: ${details.role || '-'}`
    default:
      break
  }

  // Fallback for anything not explicitly mapped above
  const action = String(log.action).toUpperCase()
  if (action === 'LOGOUT') return 'User logged out'
  if (details.booking_id) return `Booking #${String(details.booking_id).slice(0, 8)}`
  if (details.schedule_id) return `Schedule #${String(details.schedule_id).slice(0, 8)}`
  return '—'
}

// Friendly title for the details modal header, falling back to the raw action name.
const ACTION_LABELS = {
  'BOOKING:CREATE': 'New Booking',
  'BOOKING:UPDATE': 'Booking Updated',
  'BOOKING:UPDATE_NOTE': 'Note Updated',
  'BOOKING:UPDATE_STATUS': 'Status Changed',
  'BOOKING:UPDATE_TRAINER': 'Trainer Changed',
  'BOOKING:UPDATE_PAYMENT': 'Payment Updated',
  'SCHEDULE:CREATE': 'New Schedule',
  'SCHEDULE:UPDATE': 'Schedule Updated',
  'SCHEDULE:DELETE': 'Schedule Deleted',
  'SCHEDULE:CREATE_ADVANCED': 'Advance Rule Created',
  'SCHEDULE:UPDATE_ADVANCED': 'Advance Rule Updated',
  'SCHEDULE:DELETE_ADVANCED': 'Advance Rule Deleted',
  'TRAINER_GYM:ASSIGN': 'Trainer Assigned',
  'TRAINER_GYM:REMOVE': 'Trainer Removed',
  'USER:LOGIN': 'Logged In',
}

export const getModalTitle = (log) => {
  if (!log) return 'Log Details'
  return ACTION_LABELS[`${log.service}:${log.action}`] || log.action
}

// Plain key/value fields to show in the modal for log entries that aren't an
// old_values/new_values update (booking_id/schedule_id/advanced_id are shown
// separately, not repeated here).
const OMITTED_DETAIL_KEYS = new Set([
  'old_values',
  'new_values',
  'booking_id',
  'schedule_id',
  'advanced_id',
  'schedule_details',
  'old_capasity',
  // shown via selectedLogChanges instead, as a single Before/After row
  'old_status',
  'new_status',
  'old_trainer',
  'new_trainer',
  // redundant once gym_name/gym_enum are shown
  'gyms_id',
])

/** Key/value fields to show in the details modal for a log's `details`, excluding fields already shown elsewhere. */
export const getPlainDetailFields = (details) => {
  if (!details) return []
  return Object.entries(details)
    .filter(([key, value]) => !OMITTED_DETAIL_KEYS.has(key) && typeof value !== 'object')
    .map(([key, value]) => ({
      key,
      label: FIELD_LABELS[key] || key,
      value: formatFieldValue(key, value),
    }))
}

/** Before/After rows for the details modal's changes table, however the log recorded the change. */
export const getSelectedLogChanges = (details) => {
  if (!details) return []

  if (details.old_values && details.new_values) {
    return diffValues(details.old_values, details.new_values)
  }

  if (details.old_status !== undefined || details.new_status !== undefined) {
    return [
      {
        key: 'status',
        label: 'Status',
        from: formatStatus(details.old_status),
        to: formatStatus(details.new_status),
      },
    ]
  }

  if (details.old_trainer !== undefined || details.new_trainer !== undefined) {
    return [
      {
        key: 'trainer',
        label: 'Trainer',
        from: details.old_trainer || 'None',
        to: details.new_trainer || 'None',
      },
    ]
  }

  return []
}

export const getSelectedLogRecordId = (details) => {
  return details?.booking_id || details?.schedule_id || details?.advanced_id || null
}

export const serviceClass = (service) => {
  switch (String(service).toUpperCase()) {
    case 'BOOKING':
      return 'bg-blue-100 text-blue-700'
    case 'SCHEDULE':
      return 'bg-purple-100 text-purple-700'
    case 'AUTH':
    case 'USER':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export const getDisplayAction = (log) => {
  const action = String(log.action).toUpperCase()
  const details = log.details || {}

  // Extract all possible status fields
  const status = String(details.status || details.new_status || details.booking_status || '').toUpperCase()
  const paymentStatus = String(details.payment_status || details.new_payment_status || '').toUpperCase()

  // 1. PAYMENT detection
  if (
    action.includes('PAYMENT') ||
    action.includes('PAID') ||
    paymentStatus.includes('PAID') ||
    paymentStatus.includes('SUCCESS') ||
    status.includes('PAID')
  ) {
    return 'PAYMENT'
  }

  // 2. DELETE/CANCEL detection
  if (
    action === 'DELETE' ||
    action.includes('CANCEL') ||
    status.includes('CANCEL') ||
    status.includes('DELETE') ||
    status === 'VOID'
  ) {
    return 'DELETE'
  }

  // 3. General UPDATE
  if (action === 'UPDATE_STATUS' || action.includes('UPDATE')) return 'UPDATE'

  return log.action
}

export const getDisplayRole = (log) => {
  if (log.user_role) return log.user_role
  if (log.role) return log.role
  if (log.user?.role) return log.user.role

  // Inference
  if (log.admin_name) return 'ADMIN'

  // Check if the name itself implies ADMIN
  const nameToCheck = (log.user_name || log.user?.name || log.details?.userName || '').toUpperCase()
  if (nameToCheck.includes('ADMIN')) return 'ADMIN'

  // If we have a user name but came here (no explicit role), it is likely a regular user
  if (log.user_name) return 'USER'

  // Default fallback
  return 'ADMIN'
}

export const roleClass = (role) => (role === 'ADMIN' ? 'text-red-600' : 'text-gray-400')

export const actionClass = (action, log) => {
  const displayAction = getDisplayAction(log || { action }).toUpperCase()

  switch (displayAction) {
    case 'LOGIN':
      return 'bg-green-100 text-green-700'
    case 'LOGOUT':
      return 'bg-gray-100 text-gray-700'
    case 'CREATE':
      return 'bg-blue-100 text-blue-700'
    case 'UPDATE':
    case 'UPDATE_STATUS':
      return 'bg-yellow-100 text-yellow-700'
    case 'PAYMENT':
      return 'bg-indigo-100 text-indigo-700'
    case 'CANCEL':
    case 'DELETE':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
