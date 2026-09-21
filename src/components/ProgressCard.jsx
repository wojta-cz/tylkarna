import React from 'react'

export default function ProgressCard({ done, total }) {
  const pct = total === 0 ? 100 : Math.round((done / total) * 100)
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {done} z {total} hotovo
        </span>
        <span className="text-sm font-semibold text-accent">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
