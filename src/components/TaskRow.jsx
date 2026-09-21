import React, { useState } from 'react'
import { Check, MessageSquarePlus, Star } from 'lucide-react'
import { TAGS } from '../data/seed'

const TAG_COLOR = {
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-green-50 text-green-600'
}

export default function TaskRow({ task, completion, onToggle, onSaveNote, allowNotes }) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState(completion?.note || '')
  const done = !!completion

  const submitNote = () => {
    onSaveNote(noteDraft)
    setNoteOpen(false)
  }

  return (
    <div className={`rounded-2xl border border-gray-200 px-4 py-3.5 flex gap-3 items-start transition-colors ${done ? 'bg-gray-50' : 'bg-white'}`}>
      <button
        onClick={onToggle}
        aria-label={done ? 'Označit jako nedokončené' : 'Označit jako hotové'}
        className={`task-checkbox mt-0.5 w-7 h-7 shrink-0 rounded-lg border-2 flex items-center justify-center ${
          done ? 'bg-accent border-accent' : 'border-gray-300 bg-white'
        }`}
      >
        {done && <Check size={16} className="text-white" strokeWidth={3} />}
      </button>

      {task.imageUrl && (
        <img src={task.imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 border border-gray-200" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium text-sm ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</span>
          {task.required && !done && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-red-500">
              <Star size={11} fill="currentColor" /> Povinné
            </span>
          )}
          {(task.tags || []).map((tagKey) => {
            const tag = TAGS[tagKey]
            if (!tag) return null
            return (
              <span key={tagKey} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TAG_COLOR[tag.color]}`}>
                {tag.emoji} {tag.label}
              </span>
            )
          })}
        </div>
        {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}

        {done && (
          <div className="mt-1 text-xs text-gray-400">
            Dokončeno v {completion.completedAt}, {completion.completedBy}
          </div>
        )}

        {done && completion.note && <div className="mt-1 text-xs bg-accent-50 text-accent-700 rounded-lg px-2 py-1 inline-block">📝 {completion.note}</div>}

        {done && allowNotes && !completion.note && !noteOpen && (
          <button onClick={() => setNoteOpen(true)} className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent font-medium">
            <MessageSquarePlus size={13} /> Přidat poznámku
          </button>
        )}

        {done && allowNotes && noteOpen && (
          <div className="mt-2 flex gap-2">
            <input
              autoFocus
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNote()}
              placeholder="Rychlá poznámka…"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-200"
            />
            <button onClick={submitNote} className="text-xs font-medium text-accent px-2">Uložit</button>
          </div>
        )}
      </div>
    </div>
  )
}
