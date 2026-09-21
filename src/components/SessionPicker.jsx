import React from 'react'
import { SESSION_TYPES } from '../data/seed'
import { sessionTasksFor, todaysScheduledTasks } from '../utils/sessionHelpers'

export default function SessionPicker({ db, onPick }) {
  const scheduledCount = todaysScheduledTasks(db).length

  return (
    <div className="max-w-lg mx-auto pt-4">
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">👋</div>
        <h1 className="text-xl font-semibold text-gray-900">Na čem dnes pracujete?</h1>
        <p className="text-sm text-gray-500 mt-1">Vyberte směnu a zobrazte dnešní seznam úkolů.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.values(SESSION_TYPES).map((st) => {
          const count = sessionTasksFor(db, st.key).length + scheduledCount
          return (
            <button
              key={st.key}
              onClick={() => onPick(st.key)}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-start gap-1.5 text-left shadow-sm hover:shadow-md hover:border-accent-200 transition-all"
            >
              <span className="text-3xl mb-1">{st.emoji}</span>
              <span className="font-semibold text-gray-900">{st.label}</span>
              <span className="text-xs text-gray-500">{st.flexible ? 'Flexibilní čas' : st.time}</span>
              <span className="text-xs text-accent font-medium mt-1">{count} úkolů</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
