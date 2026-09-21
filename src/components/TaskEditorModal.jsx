import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import Modal from './Modal.jsx'
import { SESSION_TYPES, TAGS } from '../data/seed'
import { WEEKDAYS, ORDINALS } from '../utils/schedule'

const emptySchedule = { type: 'everyday', days: [], monthly: [], dates: [] }

export function blankTaskForm(presetScheduled) {
  return {
    title: '',
    description: '',
    imageUrl: '',
    sessionType: presetScheduled ? [] : ['opening'],
    recurring: !!presetScheduled,
    schedule: presetScheduled ? { ...emptySchedule } : null,
    required: false,
    active: true,
    tags: []
  }
}

export default function TaskEditorModal({ initial, onSave, onClose, lockScheduled }) {
  const [form, setForm] = useState(initial)
  const [dateInput, setDateInput] = useState('')

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const toggleTag = (key) => {
    set({ tags: form.tags.includes(key) ? form.tags.filter((t) => t !== key) : [...form.tags, key] })
  }

  const toggleWeekday = (day) => {
    const days = form.schedule.days.includes(day) ? form.schedule.days.filter((d) => d !== day) : [...form.schedule.days, day]
    set({ schedule: { ...form.schedule, days } })
  }

  const addMonthlyRule = () => {
    set({ schedule: { ...form.schedule, monthly: [...form.schedule.monthly, { nth: 1, weekday: 'Mon' }] } })
  }
  const updateMonthlyRule = (i, patch) => {
    const monthly = form.schedule.monthly.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    set({ schedule: { ...form.schedule, monthly } })
  }
  const removeMonthlyRule = (i) => {
    set({ schedule: { ...form.schedule, monthly: form.schedule.monthly.filter((_, idx) => idx !== i) } })
  }

  const addDate = () => {
    if (!dateInput) return
    if (!form.schedule.dates.includes(dateInput)) {
      set({ schedule: { ...form.schedule, dates: [...form.schedule.dates, dateInput] } })
    }
    setDateInput('')
  }
  const removeDate = (d) => {
    set({ schedule: { ...form.schedule, dates: form.schedule.dates.filter((x) => x !== d) } })
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    onSave(form)
  }

  return (
    <Modal title={form.recurring ? 'Scheduled Task' : 'Task'} onClose={onClose} wide>
      <div className="flex flex-col gap-3">
        <Field label="Title">
          <input value={form.title} onChange={(e) => set({ title: e.target.value })} className="input" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={2} className="input" />
        </Field>
        <Field label="Image URL">
          <input value={form.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} className="input" placeholder="https://…" />
          {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 w-16 h-16 rounded-xl object-cover border border-gray-200" />}
        </Field>

        {!lockScheduled && (
          <label className="flex items-center justify-between gap-4 py-1">
            <span className="text-sm font-medium text-gray-700">Scheduled task</span>
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) =>
                set({
                  recurring: e.target.checked,
                  sessionType: e.target.checked ? [] : form.sessionType.length ? form.sessionType : ['opening'],
                  schedule: e.target.checked ? (form.schedule || { ...emptySchedule }) : null
                })
              }
              className="w-4 h-4 accent-accent"
            />
          </label>
        )}

        {!form.recurring ? (
          <Field label="Session type">
            <select
              value={form.sessionType[0] || 'opening'}
              onChange={(e) => set({ sessionType: [e.target.value] })}
              className="input bg-white"
            >
              {Object.values(SESSION_TYPES).map((st) => (
                <option key={st.key} value={st.key}>{st.emoji} {st.label}</option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="border border-gray-200 rounded-xl p-3.5">
            <Field label="Schedule type">
              <select
                value={form.schedule.type}
                onChange={(e) => set({ schedule: { ...emptySchedule, type: e.target.value } })}
                className="input bg-white"
              >
                <option value="everyday">Every day</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="dates">Specific dates</option>
              </select>
            </Field>

            {form.schedule.type === 'weekly' && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleWeekday(d)}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border ${
                      form.schedule.days.includes(d) ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
                <span className="text-[11px] text-gray-400 self-center ml-1">Empty = every day</span>
              </div>
            )}

            {form.schedule.type === 'monthly' && (
              <div className="mt-2 flex flex-col gap-2">
                {form.schedule.monthly.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select value={rule.nth} onChange={(e) => updateMonthlyRule(i, { nth: Number(e.target.value) })} className="input bg-white flex-1">
                      {ORDINALS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <select value={rule.weekday} onChange={(e) => updateMonthlyRule(i, { weekday: e.target.value })} className="input bg-white flex-1">
                      {WEEKDAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <button onClick={() => removeMonthlyRule(i)} className="text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={addMonthlyRule} className="flex items-center gap-1 text-xs font-medium text-accent">
                  <Plus size={13} /> Add rule
                </button>
              </div>
            )}

            {form.schedule.type === 'dates' && (
              <div className="mt-2">
                <div className="flex gap-2 mb-2">
                  <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="input bg-white flex-1" />
                  <button onClick={addDate} className="text-xs font-medium text-white bg-accent px-3 rounded-xl">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.schedule.dates.map((d) => (
                    <span key={d} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                      {d}
                      <button onClick={() => removeDate(d)}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Field label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {Object.values(TAGS).map((tag) => (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-full border ${
                  form.tags.includes(tag.key) ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.required} onChange={(e) => set({ required: e.target.checked })} className="w-4 h-4 accent-accent" />
            Required
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.active} onChange={(e) => set({ active: e.target.checked })} className="w-4 h-4 accent-accent" />
            Active
          </label>
        </div>

        <button onClick={handleSubmit} className="mt-2 w-full bg-accent text-white rounded-xl py-2.5 font-semibold hover:bg-accent-700">
          Save Task
        </button>
      </div>
    </Modal>
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
