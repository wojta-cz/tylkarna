import React, { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { AVATAR_PALETTE } from '../../data/seed'
import Modal from '../../components/Modal.jsx'

const emptyForm = { name: '', email: '', role: 'employee', pin: '', avatarEmoji: AVATAR_PALETTE[0] }

export default function AdminUsers() {
  const { db, persist, currentUser } = useApp()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(null) // user object or 'new' form
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState(null)

  if (!db) return null

  const openNew = () => {
    setForm(emptyForm)
    setEditing('new')
  }

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, role: u.role, pin: u.pin, avatarEmoji: u.avatarEmoji })
    setEditing(u)
  }

  const save = () => {
    if (!form.name.trim() || !/^\d{4}$/.test(form.pin)) {
      showToast('Name and a 4-digit PIN are required', { type: 'error' })
      return
    }
    if (editing === 'new') {
      const user = { id: `u_${Date.now()}`, ...form }
      persist((prev) => ({ ...prev, users: [...prev.users, user] }))
      showToast('User created')
    } else {
      persist((prev) => ({ ...prev, users: prev.users.map((u) => (u.id === editing.id ? { ...u, ...form } : u)) }))
      showToast('User updated')
    }
    setEditing(null)
  }

  const remove = (u) => {
    persist((prev) => ({ ...prev, users: prev.users.filter((x) => x.id !== u.id) }))
    setConfirmDelete(null)
    showToast('User deleted')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Users</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 text-sm font-medium bg-accent text-white px-3.5 py-2 rounded-xl hover:bg-accent-700">
          <Plus size={15} /> New User
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {db.users.map((u) => (
          <div key={u.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">{u.avatarEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{u.name}</span>
                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{u.role}</span>
              </div>
              <span className="text-xs text-gray-500">{u.email} · PIN ••{u.pin.slice(2)}</span>
            </div>
            <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-accent p-1.5">
              <Pencil size={15} />
            </button>
            <button
              onClick={() => (u.id === currentUser.id ? showToast("You can't delete your own account", { type: 'error' }) : setConfirmDelete(u))}
              className="text-gray-400 hover:text-red-500 p-1.5"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'New User' : 'Edit User'} onClose={() => setEditing(null)}>
          <div className="flex flex-col gap-3">
            <Field label="Name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </Field>
            <Field label="Role">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input bg-white">
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field label="4-digit PIN">
              <input
                value={form.pin}
                maxLength={4}
                onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
                className="input"
              />
            </Field>
            <Field label="Avatar">
              <div className="flex flex-wrap gap-2">
                {AVATAR_PALETTE.map((e) => (
                  <button
                    key={e}
                    onClick={() => setForm({ ...form, avatarEmoji: e })}
                    className={`text-xl w-10 h-10 rounded-xl border flex items-center justify-center ${
                      form.avatarEmoji === e ? 'border-accent bg-accent-50' : 'border-gray-200'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </Field>
            <button onClick={save} className="mt-2 w-full bg-accent text-white rounded-xl py-2.5 font-semibold hover:bg-accent-700">
              Save
            </button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete user?" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-4">
            This will permanently remove <strong>{confirmDelete.name}</strong>. This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium">
              Cancel
            </button>
            <button onClick={() => remove(confirmDelete)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-600">
              Delete
            </button>
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
