import React, { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { MANUAL_CATEGORIES } from '../../data/seed'
import Modal from '../../components/Modal.jsx'

const emptyForm = { title: '', description: '', category: 'procedures', content: '', notes: '', active: true }

export default function AdminManuals() {
  const { db, persist } = useApp()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState(null)

  if (!db) return null

  const openNew = () => { setForm(emptyForm); setEditing('new') }
  const openEdit = (m) => {
    setForm({ title: m.title, description: m.description, category: m.category, content: m.content.join('\n'), notes: m.notes || '', active: m.active !== false })
    setEditing(m)
  }

  const save = () => {
    if (!form.title.trim()) { showToast('Title required', { type: 'error' }); return }
    const content = form.content.split('\n').map((s) => s.trim()).filter(Boolean)
    if (editing === 'new') {
      const manual = { id: `manual_${Date.now()}`, ...form, content }
      persist((prev) => ({ ...prev, manuals: [...prev.manuals, manual] }))
      showToast('Manual created')
    } else {
      persist((prev) => ({ ...prev, manuals: prev.manuals.map((m) => (m.id === editing.id ? { ...m, ...form, content } : m)) }))
      showToast('Manual updated')
    }
    setEditing(null)
  }

  const remove = (m) => {
    persist((prev) => ({ ...prev, manuals: prev.manuals.filter((x) => x.id !== m.id) }))
    setConfirmDelete(null)
    showToast('Manual deleted')
  }

  const toggleActive = (m) => {
    persist((prev) => ({ ...prev, manuals: prev.manuals.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)) }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Manuals</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 text-sm font-medium bg-accent text-white px-3.5 py-2 rounded-xl hover:bg-accent-700">
          <Plus size={15} /> New Manual
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {db.manuals.map((m) => {
          const cat = MANUAL_CATEGORIES[m.category]
          return (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{m.title}</span>
                  {m.active === false && <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Inactive</span>}
                </div>
                <span className="text-xs text-gray-500">{cat.label}</span>
              </div>
              <button onClick={() => toggleActive(m)} className="text-xs font-medium text-accent px-2">
                {m.active === false ? 'Activate' : 'Deactivate'}
              </button>
              <button onClick={() => openEdit(m)} className="text-gray-400 hover:text-accent p-1.5"><Pencil size={15} /></button>
              <button onClick={() => setConfirmDelete(m)} className="text-gray-400 hover:text-red-500 p-1.5"><Trash2 size={15} /></button>
            </div>
          )
        })}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'New Manual' : 'Edit Manual'} onClose={() => setEditing(null)} wide>
          <div className="flex flex-col gap-3">
            <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></Field>
            <Field label="Description"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input bg-white">
                {Object.entries(MANUAL_CATEGORIES).map(([key, c]) => (
                  <option key={key} value={key}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Content — one step per line">
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="input font-mono text-xs" />
            </Field>
            <Field label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" /></Field>
            <button onClick={save} className="mt-2 w-full bg-accent text-white rounded-xl py-2.5 font-semibold hover:bg-accent-700">Save</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete manual?" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-4">This will permanently remove <strong>{confirmDelete.title}</strong>.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium">Cancel</button>
            <button onClick={() => remove(confirmDelete)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-600">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  )
}
