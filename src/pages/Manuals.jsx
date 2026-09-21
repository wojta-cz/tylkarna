import React, { useState } from 'react'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { MANUAL_CATEGORIES } from '../data/seed'

export default function Manuals() {
  const { db } = useApp()
  const [openId, setOpenId] = useState(null)

  if (!db) return null

  const manuals = db.manuals.filter((m) => m.active !== false)
  const open = manuals.find((m) => m.id === openId)

  if (open) {
    const cat = MANUAL_CATEGORIES[open.category]
    return (
      <div className="max-w-2xl mx-auto pb-6">
        <button onClick={() => setOpenId(null)} className="flex items-center gap-1.5 text-accent text-sm font-medium mb-5">
          <ArrowLeft size={16} /> Manuály
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{cat.emoji}</span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{cat.label}</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">{open.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{open.description}</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <ol className="flex flex-col gap-3">
            {open.content.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-800">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {open.notes && (
          <div className="mt-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-4 flex gap-2 text-sm">
            <Lightbulb size={16} className="shrink-0 mt-0.5" />
            <span>{open.notes}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">📖 Manuály</h1>
      <p className="text-sm text-gray-500 mb-6">Příručky k provozu kavárny.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {manuals.map((m) => {
          const cat = MANUAL_CATEGORIES[m.category]
          return (
            <button
              key={m.id}
              onClick={() => setOpenId(m.id)}
              className="bg-white border border-gray-200 rounded-2xl p-5 text-left shadow-sm hover:shadow-md hover:border-accent-200 transition-all"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <h3 className="font-semibold text-gray-900 mt-3">{m.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.description}</p>
              <span className="inline-block mt-3 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {cat.label}
              </span>
            </button>
          )
        })}
        {manuals.length === 0 && <p className="text-sm text-gray-400">Zatím žádné manuály.</p>}
      </div>
    </div>
  )
}
