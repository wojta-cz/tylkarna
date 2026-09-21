import React, { useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { SESSION_TYPES, TAGS } from '../../data/seed'
import TaskEditorModal, { blankTaskForm } from '../../components/TaskEditorModal.jsx'
import Modal from '../../components/Modal.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  ...Object.values(SESSION_TYPES).map((s) => ({ key: s.key, label: `${s.emoji} ${s.label}` })),
  { key: 'scheduled', label: '📆 Scheduled' }
]

export default function AdminTasks() {
  const { db, persist } = useApp()
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  if (!db) return null

  const visible = db.tasks.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'scheduled') return t.recurring
    return !t.recurring && t.sessionType.includes(filter)
  })

  const grouped = {}
  visible.forEach((t) => {
    const key = t.recurring ? 'scheduled' : t.sessionType[0]
    grouped[key] = grouped[key] || []
    grouped[key].push(t)
  })
  Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.order - b.order))

  const move = (task, dir) => {
    const groupKey = task.recurring ? 'scheduled' : task.sessionType[0]
    const siblings = db.tasks
      .filter((t) => (t.recurring ? groupKey === 'scheduled' : !t.recurring && t.sessionType[0] === groupKey))
      .sort((a, b) => a.order - b.order)
    const idx = siblings.findIndex((t) => t.id === task.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= siblings.length) return
    const a = siblings[idx]
    const b = siblings[swapIdx]
    persist((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === a.id) return { ...t, order: b.order }
        if (t.id === b.id) return { ...t, order: a.order }
        return t
      })
    }))
  }

  const openNew = () => setEditing({ mode: 'new', form: blankTaskForm(false) })
  const openEdit = (task) => setEditing({ mode: 'edit', id: task.id, form: { ...task } })

  const save = (form) => {
    if (editing.mode === 'new') {
      const maxOrder = Math.max(-1, ...db.tasks.filter((t) => (form.recurring ? t.recurring : t.sessionType[0] === form.sessionType[0])).map((t) => t.order))
      const task = { id: `task_${Date.now()}`, order: maxOrder + 1, ...form }
      persist((prev) => ({ ...prev, tasks: [...prev.tasks, task] }))
      showToast('Task created')
    } else {
      persist((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === editing.id ? { ...t, ...form } : t)) }))
      showToast('Task updated')
    }
    setEditing(null)
  }

  const remove = (task) => {
    persist((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== task.id) }))
    setConfirmDelete(null)
    showToast('Task deleted')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
                filter === f.key ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 text-sm font-medium bg-accent text-white px-3.5 py-2 rounded-xl hover:bg-accent-700 shrink-0">
          <Plus size={15} /> New Task
        </button>
      </div>

      {Object.entries(grouped).map(([groupKey, list]) => (
        <div key={groupKey} className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {groupKey === 'scheduled' ? '📆 Scheduled' : `${SESSION_TYPES[groupKey].emoji} ${SESSION_TYPES[groupKey].label}`}
          </h3>
          <div className="flex flex-col gap-2">
            {list.map((t, i) => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                {t.imageUrl && <img src={t.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{t.title}</span>
                    {t.required && <Star size={12} className="text-red-500 fill-red-500" />}
                    {!t.active && <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Inactive</span>}
                    {t.recurring && <span className="text-[10px] font-medium text-accent bg-accent-50 px-1.5 py-0.5 rounded-full">Scheduled</span>}
                    {(t.tags || []).map((tk) => (
                      <span key={tk} className="text-[10px]">{TAGS[tk]?.emoji}</span>
                    ))}
                  </div>
                </div>
                {!t.recurring && (
                  <div className="flex flex-col">
                    <button disabled={i === 0} onClick={() => move(t, -1)} className="text-gray-400 hover:text-accent disabled:opacity-20">
                      <ArrowUp size={14} />
                    </button>
                    <button disabled={i === list.length - 1} onClick={() => move(t, 1)} className="text-gray-400 hover:text-accent disabled:opacity-20">
                      <ArrowDown size={14} />
                    </button>
                  </div>
                )}
                <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-accent p-1.5">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setConfirmDelete(t)} className="text-gray-400 hover:text-red-500 p-1.5">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {visible.length === 0 && <p className="text-sm text-gray-400">No tasks match this filter.</p>}

      {editing && (
        <TaskEditorModal initial={editing.form} onSave={save} onClose={() => setEditing(null)} />
      )}

      {confirmDelete && (
        <Modal title="Delete task?" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-4">
            This will permanently remove <strong>{confirmDelete.title}</strong>.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium">Cancel</button>
            <button onClick={() => remove(confirmDelete)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-600">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
