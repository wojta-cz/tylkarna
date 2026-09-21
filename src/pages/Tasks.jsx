import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { SESSION_TYPES } from '../data/seed'
import {
  findOpenSession,
  sessionTasksFor,
  todaysScheduledTasks,
  startSession,
  toggleSessionTaskCompletion,
  toggleScheduledTaskCompletion,
  setSessionTaskNote,
  setScheduledTaskNote
} from '../utils/sessionHelpers'
import SessionPicker from '../components/SessionPicker.jsx'
import ProgressCard from '../components/ProgressCard.jsx'
import TaskRow from '../components/TaskRow.jsx'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Dobré ráno'
  if (h < 18) return 'Dobré odpoledne'
  return 'Dobrý večer'
}

export default function Tasks() {
  const { db, currentUser, persist } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()

  if (!db) return null

  const session = findOpenSession(db, currentUser.id)

  if (!session) {
    return (
      <SessionPicker
        db={db}
        onPick={(type) => {
          persist((prev) => startSession(prev, currentUser, type))
          showToast(`Směna ${SESSION_TYPES[type].label.toLowerCase()} zahájena`, { emoji: SESSION_TYPES[type].emoji })
        }}
      />
    )
  }

  const sType = SESSION_TYPES[session.type]
  const sessionTasks = sessionTasksFor(db, session.type)
  const scheduledTasks = todaysScheduledTasks(db)

  function todayKey() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const todaysCompletions = db.dailyCompletions[todayKey()] || {}

  const doneCount =
    sessionTasks.filter((t) => session.completions[t.id]).length +
    scheduledTasks.filter((t) => todaysCompletions[t.id]).length
  const totalCount = sessionTasks.length + scheduledTasks.length
  const allDone = totalCount > 0 && doneCount === totalCount

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">
          {greeting()}, {currentUser.name.split(' ')[0]} {currentUser.avatarEmoji}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {sType.emoji} {sType.label} {sType.time ? `· ${sType.time}` : '· Flexibilní čas'}
        </p>
      </div>

      <div className="mb-6">
        <ProgressCard done={doneCount} total={totalCount} />
      </div>

      {allDone && (
        <button
          onClick={() => navigate('/end-session')}
          className="w-full mb-6 bg-accent text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-accent-700 transition-colors"
        >
          <PartyPopper size={18} /> Všechny úkoly hotové — ukončit směnu
        </button>
      )}

      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">{sType.emoji}</span>
        <h2 className="font-semibold text-gray-800 text-sm">Úkoly: {sType.label.toLowerCase()}</h2>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        {sessionTasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            completion={session.completions[t.id]}
            allowNotes={db.settings.allowTaskNotes}
            onToggle={() => persist((prev) => toggleSessionTaskCompletion(prev, session.id, t.id, currentUser))}
            onSaveNote={(note) => persist((prev) => setSessionTaskNote(prev, session.id, t.id, note))}
          />
        ))}
        {sessionTasks.length === 0 && <p className="text-sm text-gray-400 px-1">Pro tuto směnu zatím nejsou žádné úkoly.</p>}
      </div>

      {scheduledTasks.length > 0 && (
        <>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">📆</span>
            <h2 className="font-semibold text-gray-800 text-sm">Naplánováno na dnešek</h2>
          </div>
          <p className="text-xs text-gray-400 mb-2 px-1">Sdílené mezi všemi dnešními směnami. Kdo úkol dokončí, označí ho jako hotový pro celý den.</p>
          <div className="flex flex-col gap-2">
            {scheduledTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                completion={todaysCompletions[t.id]}
                allowNotes={db.settings.allowTaskNotes}
                onToggle={() => persist((prev) => toggleScheduledTaskCompletion(prev, t.id, currentUser))}
                onSaveNote={(note) => persist((prev) => setScheduledTaskNote(prev, t.id, note))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
