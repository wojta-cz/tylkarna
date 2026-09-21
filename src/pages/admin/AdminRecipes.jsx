import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { RECIPE_CATEGORIES } from '../../data/seed'
import Modal from '../../components/Modal.jsx'

const emptyForm = { title: '', category: 'coffee', ingredients: [{ name: '', qty: '', unit: '' }], preparation: '', notes: '' }

export default function AdminRecipes() {
  const { db, persist } = useApp()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState(null)

  if (!db) return null

  const openNew = () => { setForm(emptyForm); setEditing('new') }
  const openEdit = (r) => {
    setForm({ title: r.title, category: r.category, ingredients: r.ingredients.length ? r.ingredients : [{ name: '', qty: '', unit: '' }], preparation: r.preparation.join('\n'), notes: r.notes || '' })
    setEditing(r)
  }

  const updateIng = (i, patch) => {
    setForm((f) => ({ ...f, ingredients: f.ingredients.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)) }))
  }
  const addIng = () => setForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: '', qty: '', unit: '' }] }))
  const removeIng = (i) => setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))

  const save = () => {
    if (!form.title.trim()) { showToast('Title required', { type: 'error' }); return }
    const preparation = form.preparation.split('\n').map((s) => s.trim()).filter(Boolean)
    const ingredients = form.ingredients.filter((i) => i.name.trim())
    if (editing === 'new') {
      const recipe = { id: `recipe_${Date.now()}`, ...form, preparation, ingredients }
      persist((prev) => ({ ...prev, recipes: [...prev.recipes, recipe] }))
      showToast('Recipe created')
    } else {
      persist((prev) => ({ ...prev, recipes: prev.recipes.map((r) => (r.id === editing.id ? { ...r, ...form, preparation, ingredients } : r)) }))
      showToast('Recipe updated')
    }
    setEditing(null)
  }

  const remove = (r) => {
    persist((prev) => ({ ...prev, recipes: prev.recipes.filter((x) => x.id !== r.id) }))
    setConfirmDelete(null)
    showToast('Recipe deleted')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Recipes</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 text-sm font-medium bg-accent text-white px-3.5 py-2 rounded-xl hover:bg-accent-700">
          <Plus size={15} /> New Recipe
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {db.recipes.map((r) => {
          const cat = RECIPE_CATEGORIES[r.category]
          return (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900">{r.title}</span>
                <span className="block text-xs text-gray-500">{cat.label}</span>
              </div>
              <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-accent p-1.5"><Pencil size={15} /></button>
              <button onClick={() => setConfirmDelete(r)} className="text-gray-400 hover:text-red-500 p-1.5"><Trash2 size={15} /></button>
            </div>
          )
        })}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'New Recipe' : 'Edit Recipe'} onClose={() => setEditing(null)} wide>
          <div className="flex flex-col gap-3">
            <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input bg-white">
                {Object.entries(RECIPE_CATEGORIES).map(([key, c]) => (
                  <option key={key} value={key}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Ingredients">
              <div className="flex flex-col gap-2">
                {form.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <input placeholder="Name" value={ing.name} onChange={(e) => updateIng(i, { name: e.target.value })} className="input flex-1" />
                    <input placeholder="Qty" value={ing.qty} onChange={(e) => updateIng(i, { qty: e.target.value })} className="input w-20" />
                    <input placeholder="Unit" value={ing.unit} onChange={(e) => updateIng(i, { unit: e.target.value })} className="input w-20" />
                    <button onClick={() => removeIng(i)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                  </div>
                ))}
                <button onClick={addIng} className="flex items-center gap-1 text-xs font-medium text-accent"><Plus size={13} /> Add ingredient</button>
              </div>
            </Field>
            <Field label="Preparation — one step per line">
              <textarea value={form.preparation} onChange={(e) => setForm({ ...form, preparation: e.target.value })} rows={5} className="input font-mono text-xs" />
            </Field>
            <Field label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" /></Field>
            <button onClick={save} className="mt-2 w-full bg-accent text-white rounded-xl py-2.5 font-semibold hover:bg-accent-700">Save</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete recipe?" onClose={() => setConfirmDelete(null)}>
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
