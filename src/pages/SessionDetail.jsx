import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { SESSION_TYPES } from '../data/seed'
import { taskAppliesOnDate } from '../utils/schedule'

export default function SessionDetail() {
  const { id } = useParams()
  const { db } = useApp()
  const navigate = useNavigate()
  if (!db) return null

  const session = db.sessions.find((s) => s.id === id)
  if (!session) {
    return (
      <div className="max-w-lg mx-auto text-center pt-16">
        <p className="text-sm text-gray-500">Session not found.</p>
      </div>
    )
  }

  const sType = SESSION_TYPES[session.type]
  const sessionTasks = db.tasks.filter((t) => !t.recurring && t.sessionType.includes(session.type))
  const scheduledForDate = db.tasks.filter((t) => t.recurring && taskAppliesOnDate(t, session.date))
  const dayCompletions = db.dailyCompletions[session.date] || {}

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-accent text-sm font-medium mb-5">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{sType.emoji}</span>
        <h1 className="text-xl font-semibold text-gray-900">{sType.label} — {session.date}</h1>
      </div>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-500">{session.employeeName}</span>
        {session.closure?.endedEarly ? (
          <span className="text-[11px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">⚠️ Ended Early</span>
        ) : (
          <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Completed</span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 text-sm flex flex-col gap-2">
        <Row label="Start" value={session.startTime} />
        <Row label="Closed" value={session.endTime || '—'} />
        <Row label="Confirmed by" value={session.closure?.confirmationName} />
        {session.closure?.endedEarly && <Row label="Reason" value={session.closure.reason} />}
        {session.closure?.comment && <Row label="Comment" value={session.closure.comment} />}
        {session.closure?.note && <Row label="Session note" value={session.closure.note} />}
      </div>

      <h2 className="text-sm font-semibold text-gray-800 mb-2">{sType.label} tasks</h2>
      <div className="flex flex-col gap-2 mb-6">
        {sessionTasks.map((t) => {
          const c = session.completions[t.id]
          return <DetailRow key={t.id} title={t.title} completion={c} />
        })}
      </div>

      {scheduledForDate.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Scheduled tasks for that date</h2>
          <div className="flex flex-col gap-2">
            {scheduledForDate.map((t) => {
              const c = dayCompletions[t.id]
              return <DetailRow key={t.id} title={t.title} completion={c} />
            })}
          </div>
        </>
      )}
    </div>
  )
}

function DetailRow({ title, completion }) {
  const done = !!completion
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <span className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        {done ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
      </span>
      <div className="min-w-0">
        <p className={`text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>{title}</p>
        {done && (
          <p className="text-xs text-gray-400 mt-0.5">
            {completion.completedAt} · {completion.completedBy}
            {completion.note ? ` · 📝 ${completion.note}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  )
}
