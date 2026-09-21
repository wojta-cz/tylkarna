import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { SESSION_TYPES } from '../../data/seed'
import { todayIso, taskAppliesOnDate } from '../../utils/schedule'

function StatCard({ label, value, emoji }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="text-base">{emoji}</span>
      </div>
      <span className="text-2xl font-semibold text-gray-900">{value}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const { db, persist } = useApp()
  const navigate = useNavigate()
  if (!db) return null

  const iso = todayIso()
  const todaysSessions = db.sessions.filter((s) => s.date === iso)
  const activeSessions = db.sessions.filter((s) => s.status === 'open')
  const closedSessions = db.sessions.filter((s) => s.status === 'closed')

  const scheduledToday = db.tasks.filter((t) => t.recurring && t.active !== false && taskAppliesOnDate(t, iso))
  const todaysCompletions = db.dailyCompletions[iso] || {}
  const scheduledPending = scheduledToday.filter((t) => !todaysCompletions[t.id]).length

  const incompleteRequiredToday = (() => {
    let count = 0
    todaysSessions.forEach((s) => {
      const sessionTasks = db.tasks.filter((t) => !t.recurring && t.sessionType.includes(s.type) && t.required)
      count += sessionTasks.filter((t) => !s.completions[t.id]).length
    })
    count += scheduledToday.filter((t) => t.required && !todaysCompletions[t.id]).length
    return count
  })()

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const sessionsThisWeek = db.sessions.filter((s) => new Date(s.date) >= oneWeekAgo).length

  const closedLast7 = closedSessions.filter((s) => new Date(s.date) >= oneWeekAgo)
  const avgCompletion = closedLast7.length
    ? Math.round(
        (closedLast7.reduce((sum, s) => {
          const sessionTasks = db.tasks.filter((t) => !t.recurring && t.sessionType.includes(s.type))
          const total = sessionTasks.length || 1
          const done = sessionTasks.filter((t) => s.completions[t.id]).length
          return sum + done / total
        }, 0) /
          closedLast7.length) *
          100
      )
    : 0

  const endedEarly7d = closedLast7.filter((s) => s.closure?.endedEarly).length

  // Recent notes feed
  const notes = []
  db.sessions.forEach((s) => {
    if (s.closure?.note) notes.push({ kind: 'Poznámka ke směně', text: s.closure.note, who: s.closure.confirmationName, when: s.closure.confirmedAt })
    if (s.closure?.endedEarly && s.closure.comment) notes.push({ kind: 'Komentář k předčasnému ukončení', text: s.closure.comment, who: s.closure.confirmationName, when: s.closure.confirmedAt })
    Object.entries(s.completions).forEach(([taskId, c]) => {
      if (c.note) {
        const task = db.tasks.find((t) => t.id === taskId)
        notes.push({ kind: 'Poznámka k úkolu', text: `${task?.title || 'Úkol'}: ${c.note}`, who: c.completedBy, when: `${s.date}T${c.completedAt}` })
      }
    })
  })
  Object.entries(db.dailyCompletions).forEach(([date, map]) => {
    Object.entries(map).forEach(([taskId, c]) => {
      if (c.note) {
        const task = db.tasks.find((t) => t.id === taskId)
        notes.push({ kind: 'Poznámka k naplánovanému úkolu', text: `${task?.title || 'Úkol'}: ${c.note}`, who: c.completedBy, when: `${date}T${c.completedAt}` })
      }
    })
  })
  notes.sort((a, b) => (a.when < b.when ? 1 : -1))

  const toggleAllowNotes = () => {
    persist((prev) => ({ ...prev, settings: { ...prev.settings, allowTaskNotes: !prev.settings.allowTaskNotes } }))
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <StatCard label="Dnešní směny" value={todaysSessions.length} emoji="📋" />
        <StatCard label="Aktivní směny" value={activeSessions.length} emoji="🟢" />
        <StatCard label="Ukončené směny" value={closedSessions.length} emoji="✅" />
        <StatCard label="Nedokončené povinné úkoly (dnes)" value={incompleteRequiredToday} emoji="⚠️" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Směny tento týden" value={sessionsThisWeek} emoji="📆" />
        <StatCard label="Průměrné dokončení (7 dní)" value={`${avgCompletion}%`} emoji="📈" />
        <StatCard label="Předčasně ukončené (7 dní)" value={endedEarly7d} emoji="🏃" />
        <StatCard label="Dnešní čekající úkoly" value={scheduledPending} emoji="🕓" />
      </div>

      <h2 className="text-sm font-semibold text-gray-800 mb-2">Dnešní směny</h2>
      <div className="flex flex-col gap-2 mb-8">
        {todaysSessions.map((s) => {
          const sType = SESSION_TYPES[s.type]
          const count = Object.keys(s.completions).length
          return (
            <button
              key={s.id}
              onClick={() => s.status === 'closed' && navigate(`/session/${s.id}`)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 text-left"
            >
              <span className="text-xl">{sType.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{s.employeeName} · {sType.label}</p>
                <p className="text-xs text-gray-500">{count} dokončených úkolů</p>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                s.status === 'open' ? 'bg-blue-50 text-blue-600' : s.closure?.endedEarly ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
              }`}>
                {s.status === 'open' ? 'Aktivní' : s.closure?.endedEarly ? 'Ukončena předčasně' : 'Dokončena'}
              </span>
            </button>
          )
        })}
        {todaysSessions.length === 0 && <p className="text-sm text-gray-400">Dnes zatím žádné směny.</p>}
      </div>

      <h2 className="text-sm font-semibold text-gray-800 mb-2">Poslední poznámky</h2>
      <div className="flex flex-col gap-2 mb-8">
        {notes.slice(0, 8).map((n, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-medium text-accent bg-accent-50 px-2 py-0.5 rounded-full">{n.kind}</span>
              <span className="text-xs text-gray-400">{n.who}</span>
            </div>
            <p className="text-sm text-gray-700">{n.text}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-sm text-gray-400">Zatím žádné poznámky.</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Nastavení</h2>
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <span className="text-sm text-gray-700">Povolit zaměstnancům přidávat poznámky při dokončení úkolů</span>
          <span
            onClick={toggleAllowNotes}
            className={`w-11 h-6 rounded-full relative transition-colors ${db.settings.allowTaskNotes ? 'bg-accent' : 'bg-gray-200'}`}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              style={{ transform: db.settings.allowTaskNotes ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </span>
        </label>
      </div>
    </div>
  )
}
