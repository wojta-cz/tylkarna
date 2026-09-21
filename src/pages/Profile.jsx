import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { SESSION_TYPES } from '../data/seed'

export default function Profile() {
  const { db, currentUser } = useApp()
  const navigate = useNavigate()
  if (!db) return null

  const mySessions = db.sessions
    .filter((s) => s.employeeId === currentUser.id && s.status === 'closed')
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4 mb-6">
        <span className="text-4xl">{currentUser.avatarEmoji}</span>
        <div>
          <h1 className="font-semibold text-gray-900">{currentUser.name}</h1>
          <p className="text-sm text-gray-500">{currentUser.email}</p>
          <span className="inline-block mt-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
            {currentUser.role}
          </span>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-800 mb-2">Session history</h2>
      <div className="flex flex-col gap-2">
        {mySessions.map((s) => {
          const sType = SESSION_TYPES[s.type]
          const taskCount = Object.keys(s.completions).length
          return (
            <button
              key={s.id}
              onClick={() => navigate(`/session/${s.id}`)}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left hover:border-accent-200 transition-colors"
            >
              <span className="text-2xl">{sType.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{sType.label}</span>
                  {s.closure?.endedEarly && (
                    <span className="text-[11px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Ended Early</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {s.date} · {taskCount} tasks · closed {s.endTime}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          )
        })}
        {mySessions.length === 0 && <p className="text-sm text-gray-400">No closed sessions yet.</p>}
      </div>
    </div>
  )
}
