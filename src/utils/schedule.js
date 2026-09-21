// Decides whether a scheduled task applies on a given calendar date.
// This is deliberately NOT "show every scheduled task every day" — each
// task has exactly one schedule pattern (see Task.schedule in the data model).

const WEEKDAY_CODES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function weekdayCodeFromDate(date) {
  return WEEKDAY_CODES[date.getDay()]
}

export function parseIsoDate(isoDate) {
  // Parse as local date (avoid UTC off-by-one from `new Date('YYYY-MM-DD')`)
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayIso() {
  return toIsoDate(new Date())
}

export function toIsoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Nth-weekday-of-month check, e.g. "1st Wednesday" or "Last Friday".
function matchesMonthlyRule(date, rule) {
  if (weekdayCodeFromDate(date) !== rule.weekday) return false
  const dayOfMonth = date.getDate()
  const occurrence = Math.ceil(dayOfMonth / 7) // 1st, 2nd, 3rd, 4th occurrence of this weekday

  if (rule.nth === -1) {
    // "Last" — true only if adding 7 days pushes into next month
    const nextOccurrence = new Date(date)
    nextOccurrence.setDate(date.getDate() + 7)
    return nextOccurrence.getMonth() !== date.getMonth()
  }
  return occurrence === rule.nth
}

export function taskAppliesOnDate(task, isoDate) {
  const date = parseIsoDate(isoDate)
  const schedule = task.schedule || { type: 'everyday' }

  switch (schedule.type) {
    case 'everyday':
      return true
    case 'weekly': {
      const days = schedule.days || []
      if (days.length === 0) return true // empty list = every day
      return days.includes(weekdayCodeFromDate(date))
    }
    case 'monthly': {
      const rules = schedule.monthly || []
      return rules.some((rule) => matchesMonthlyRule(date, rule))
    }
    case 'dates': {
      const dates = schedule.dates || []
      return dates.includes(isoDate)
    }
    default:
      return false
  }
}

export function scheduledTasksForDate(tasks, isoDate) {
  return tasks.filter((t) => t.recurring && t.active !== false && taskAppliesOnDate(t, isoDate))
}

export const WEEKDAYS = WEEKDAY_CODES.slice(1).concat(WEEKDAY_CODES[0]) // Mon..Sun order for UI grids
export const ORDINALS = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: -1, label: 'Last' }
]
