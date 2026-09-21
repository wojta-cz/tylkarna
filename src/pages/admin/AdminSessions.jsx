import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { SESSION_TYPES } from '../../data/seed'

export default function AdminSessions() {
  const { db } = useApp()
  const navigate = useNavigate()
  if (!db) return null

  const closed = db.sessions
    .filter((s) => s.status === 'closed')
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Closed sessions</h2>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Tasks</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Closed at</th>
              </tr>
            </thead>
            <tbody>
              {closed.map((s) => {
                const sType = SESSION_TYPES[s.type]
                const sessionCount = Object.keys(s.completions).length
                const dayCompletions = db.dailyCompletions[s.date] || {}
                const scheduledCount = Object.keys(dayCompletions).length
                return (
                  <tr key={s.id} onClick={() => navigate(`/session/${s.id}`)} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 text-gray-700">{s.date}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{s.employeeName}</td>
                    <td className="px-4 py-3 text-gray-700">{sType.emoji} {sType.label}</td>
                    <td className="px-4 py-3 text-gray-500">{sessionCount + scheduledCount} completed</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        s.closure?.endedEarly ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                      }`}>
                        {s.closure?.endedEarly ? 'Ended Early' : 'Completed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.endTime}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {closed.length === 0 && <p className="text-sm text-gray-400 px-4 py-6">No closed sessions yet.</p>}
      </div>
    </div>
  )
}
