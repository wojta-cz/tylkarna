import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { WEEKDAYS, ORDINALS } from '../../utils/schedule'
import TaskEditorModal, { blankTaskForm } from '../../components/TaskEditorModal.jsx'

export default function AdminScheduled() {
  const { db, persist } = useApp()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(null)
  const [addingTo, setAddingTo] = useState(null) // weekday string

  if (!db) return null

  const scheduled = db.tasks.filter((t) => t.recurring)
  const gridTasks = scheduled.filter((t) => t.schedule?.type === 'everyday' || t.schedule?.type === 'weekly')
  const monthlyTasks = scheduled.filter((t) => t.schedule?.type === 'monthly')
  const dateTasks = scheduled.filter((t) => t.schedule?.type === 'dates')

  const appliesToWeekday = (task, day) => {
    if (task.schedule.type === 'everyday') return true
    const days = task.schedule.days || []
    return days.length === 0 || days.includes(day)
  }

  const removeFromDay = (task, day) => {
    persist((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== task.id) return t
        if (t.schedule.type === 'everyday') {
          const days = WEEKDAYS.filter((d) => d !== day)
          return { ...t, schedule: { ...t.schedule, type: 'weekly', days } }
        }
        const days = (t.schedule.days.length ? t.schedule.days : WEEKDAYS).filter((d) => d !== day)
        return { ...t, schedule: { ...t.schedule, days } }
      })
    }))
    showToast(`Removed from ${day}`)
  }

  const addToDay = (taskId, day) => {
    persist((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t
        if (t.schedule.type === 'everyday') return t
        const days = Array.from(new Set([...(t.schedule.days || []), day]))
        return { ...t, schedule: { ...t.schedule, type: 'weekly', days } }
      })
    }))
    setAddingTo(null)
    showToast(`Added to ${day}`)
  }

  const openNew = () => setEditing({ mode: 'new', form: blankTaskForm(true) })
  const openEdit = (task) => setEditing({ mode: 'edit', id: task.id, form: { ...task } })

  const save = (form) => {
    if (editing.mode === 'new') {
      const task = { id: `task_${Date.now()}`, order: 0, ...form, recurring: true }
      persist((prev) => ({ ...prev, tasks: [...prev.tasks, task] }))
      showToast('Scheduled task created')
    } else {
      persist((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === editing.id ? { ...t, ...form } : t)) }))
      showToast('Scheduled task updated')
    }
    setEditing(null)
  }

  const weeklyAddCandidates = (day) => gridTasks.filter((t) => t.schedule.type === 'weekly' && !appliesToWeekday(t, day))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Weekly grid</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 text-sm font-medium bg-accent text-white px-3.5 py-2 rounded-xl hover:bg-accent-700">
          <Plus size={15} /> New Scheduled Task
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {WEEKDAYS.map((day) => (
          <div key={day} className="bg-white border border-gray-200 rounded-2xl p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">{day}</h4>
            <div className="flex flex-col gap-1.5 mb-2">
              {gridTasks.filter((t) => appliesToWeekday(t, day)).map((t) => (
                <div key={t.id} className="bg-accent-50 text-accent-700 rounded-lg px-2 py-1.5 text-[11px] font-medium flex items-center justify-between gap-1">
                  <button onClick={() => openEdit(t)} className="text-left truncate flex-1">{t.title}</button>
                  <button onClick={() => removeFromDay(t, day)} className="shrink-0 hover:text-red-500">
                    <X size={11} />
                  </button>
                </div>
              ))}
              {gridTasks.filter((t) => appliesToWeekday(t, day)).length === 0 && (
                <p className="text-[11px] text-gray-300">No tasks</p>
              )}
            </div>
            {addingTo === day ? (
              <select
                autoFocus
                onChange={(e) => e.target.value && addToDay(e.target.value, day)}
                onBlur={() => setAddingTo(null)}
                className="w-full text-[11px] border border-gray-200 rounded-lg px-1.5 py-1 bg-white"
                defaultValue=""
              >
                <option value="">Choose task…</option>
                {weeklyAddCandidates(day).map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            ) : (
              <button onClick={() => setAddingTo(day)} className="text-[11px] font-medium text-accent">
                + add existing task
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-gray-800 mb-2">Monthly pattern tasks</h2>
      <div className="flex flex-col gap-2 mb-8">
        {monthlyTasks.map((t) => (
          <button key={t.id} onClick={() => openEdit(t)} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-left">
            <span className="text-sm font-medium text-gray-900">{t.title}</span>
            <span className="text-xs text-gray-500 flex gap-1.5">
              {t.schedule.monthly.map((r, i) => (
                <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-full">
                  {ORDINALS.find((o) => o.value === r.nth)?.label} {r.weekday}
                </span>
              ))}
            </span>
          </button>
        ))}
        {monthlyTasks.length === 0 && <p className="text-sm text-gray-400">None yet.</p>}
      </div>

      <h2 className="text-sm font-semibold text-gray-800 mb-2">Specific-date tasks</h2>
      <div className="flex flex-col gap-2">
        {dateTasks.map((t) => (
          <button key={t.id} onClick={() => openEdit(t)} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between text-left">
            <span className="text-sm font-medium text-gray-900">{t.title}</span>
            <span className="text-xs text-gray-500 flex gap-1.5 flex-wrap justify-end">
              {t.schedule.dates.map((d) => (
                <span key={d} className="bg-gray-100 px-2 py-0.5 rounded-full">{d}</span>
              ))}
            </span>
          </button>
        ))}
        {dateTasks.length === 0 && <p className="text-sm text-gray-400">None yet.</p>}
      </div>

      {editing && <TaskEditorModal initial={editing.form} onSave={save} onClose={() => setEditing(null)} lockScheduled />}
    </div>
  )
}
