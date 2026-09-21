import { todayIso } from './schedule'

export function findOpenSession(db, userId) {
  return db.sessions.find((s) => s.employeeId === userId && s.status === 'open') || null
}

export function sessionTasksFor(db, sessionType) {
  return db.tasks
    .filter((t) => !t.recurring && t.active !== false && t.sessionType.includes(sessionType))
    .sort((a, b) => a.order - b.order)
}

export function todaysScheduledTasks(db) {
  const iso = todayIso()
  return db.tasks.filter((t) => t.recurring && t.active !== false && taskAppliesToday(t, iso))
}

import { taskAppliesOnDate } from './schedule'
function taskAppliesToday(task, iso) {
  return taskAppliesOnDate(task, iso)
}

export function startSession(db, user, sessionType) {
  const session = {
    id: `session_${Date.now()}`,
    employeeId: user.id,
    employeeName: user.name,
    type: sessionType,
    date: todayIso(),
    startTime: new Date().toTimeString().slice(0, 5),
    endTime: null,
    status: 'open',
    completions: {},
    closure: null
  }
  return { ...db, sessions: [...db.sessions, session] }
}

export function toggleSessionTaskCompletion(db, sessionId, taskId, user) {
  return {
    ...db,
    sessions: db.sessions.map((s) => {
      if (s.id !== sessionId) return s
      const completions = { ...s.completions }
      if (completions[taskId]) {
        delete completions[taskId]
      } else {
        completions[taskId] = {
          completedBy: user.name,
          completedAt: new Date().toTimeString().slice(0, 5),
          note: ''
        }
      }
      return { ...s, completions }
    })
  }
}

export function toggleScheduledTaskCompletion(db, taskId, user) {
  const iso = todayIso()
  const dayMap = { ...(db.dailyCompletions[iso] || {}) }
  if (dayMap[taskId]) {
    delete dayMap[taskId]
  } else {
    dayMap[taskId] = {
      completedBy: user.name,
      completedAt: new Date().toTimeString().slice(0, 5),
      note: ''
    }
  }
  return {
    ...db,
    dailyCompletions: { ...db.dailyCompletions, [iso]: dayMap }
  }
}

export function setSessionTaskNote(db, sessionId, taskId, note) {
  return {
    ...db,
    sessions: db.sessions.map((s) => {
      if (s.id !== sessionId) return s
      if (!s.completions[taskId]) return s
      return { ...s, completions: { ...s.completions, [taskId]: { ...s.completions[taskId], note } } }
    })
  }
}

export function setScheduledTaskNote(db, taskId, note) {
  const iso = todayIso()
  const dayMap = { ...(db.dailyCompletions[iso] || {}) }
  if (!dayMap[taskId]) return db
  dayMap[taskId] = { ...dayMap[taskId], note }
  return { ...db, dailyCompletions: { ...db.dailyCompletions, [iso]: dayMap } }
}

export function closeSession(db, sessionId, closure) {
  return {
    ...db,
    sessions: db.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, status: 'closed', endTime: new Date().toTimeString().slice(0, 5), closure }
        : s
    )
  }
}
