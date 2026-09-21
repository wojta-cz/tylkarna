import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, PartyPopper, Frown } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { SESSION_TYPES } from '../data/seed'
import { findOpenSession, sessionTasksFor, todaysScheduledTasks, closeSession } from '../utils/sessionHelpers'
import ProgressCard from '../components/ProgressCard.jsx'

const REASONS = ['Nedostatek času', 'Dnes nás bylo málo', 'Úkol dnes nebyl relevantní', 'Problém s vybavením', 'Jiný důvod']

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function EndSession() {
  const { db, currentUser, persist } = useApp()
  const navigate = useNavigate()

  const [confirmName, setConfirmName] = useState(currentUser.name)
  const [sessionNote, setSessionNote] = useState('')
  const [c1, setC1] = useState(false)
  const [c2, setC2] = useState(false)
  const [c3, setC3] = useState(false)

  const [showEarlyForm, setShowEarlyForm] = useState(false)
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [earlyName, setEarlyName] = useState(currentUser.name)

  const [result, setResult] = useState(null)

  if (!db) return null
  const session = findOpenSession(db, currentUser.id)

  if (!session) {
    return (
      <div className="max-w-md mx-auto text-center pt-16">
        <div className="text-3xl mb-3">🕐</div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Žádná aktivní směna</h1>
        <p className="text-sm text-gray-500">Nejprve spusťte směnu na stránce Úkoly.</p>
      </div>
    )
  }

  const sType = SESSION_TYPES[session.type]
  const sessionTasks = sessionTasksFor(db, session.type)
  const scheduledTasks = todaysScheduledTasks(db)
  const todaysCompletions = db.dailyCompletions[todayKey()] || {}

  const requiredIncomplete = [
    ...sessionTasks.filter((t) => t.required && !session.completions[t.id]),
    ...scheduledTasks.filter((t) => t.required && !todaysCompletions[t.id])
  ]

  const doneCount =
    sessionTasks.filter((t) => session.completions[t.id]).length +
    scheduledTasks.filter((t) => todaysCompletions[t.id]).length
  const totalCount = sessionTasks.length + scheduledTasks.length
  const allDone = totalCount > 0 ? doneCount === totalCount : true
  const allRequiredDone = requiredIncomplete.length === 0

  const submitComplete = () => {
    const closure = {
      confirmedAt: new Date().toISOString(),
      confirmationName: confirmName,
      note: sessionNote,
      allTasksCompleted: allDone,
      endedEarly: false,
      reason: null,
      comment: ''
    }
    persist((prev) => closeSession(prev, session.id, closure))
    setResult({ endedEarly: false, closure })
  }

  const submitEarly = () => {
    if (!reason) return
    const closure = {
      confirmedAt: new Date().toISOString(),
      confirmationName: earlyName,
      note: sessionNote,
      allTasksCompleted: allDone,
      endedEarly: true,
      reason,
      comment
    }
    persist((prev) => closeSession(prev, session.id, closure))
    setResult({ endedEarly: true, closure })
  }

  if (result) {
    return (
      <div className="max-w-md mx-auto text-center pt-10">
        <div className="text-4xl mb-3">{result.endedEarly ? '⚠️' : '🎉'}</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          {result.endedEarly ? 'Směna ukončena předčasně' : 'Směna dokončena'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">{currentUser.name} · {sType.emoji} {sType.label}</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 text-left text-sm flex flex-col gap-2 mb-6">
          <Row label="Datum" value={session.date} />
          <Row label="Ukončeno v" value={new Date(result.closure.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          <Row label="Úkoly" value={`${doneCount} z ${totalCount} dokončeno`} />
          {result.endedEarly && <Row label="Důvod" value={result.closure.reason} />}
          {result.closure.note && <Row label="Poznámka" value={result.closure.note} />}
        </div>

        <button
          onClick={() => navigate('/tasks')}
          className="w-full bg-accent text-white rounded-2xl py-3 font-semibold hover:bg-accent-700 transition-colors"
        >
          Zpět na úkoly
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">🏁 Ukončit směnu</h1>
      <p className="text-sm text-gray-500 mb-5">{sType.emoji} {sType.label} · {currentUser.name}</p>

      <div className="mb-4">
        <ProgressCard done={doneCount} total={totalCount} />
      </div>

      {requiredIncomplete.length > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-2">
            <AlertTriangle size={16} /> {requiredIncomplete.length} povinn{requiredIncomplete.length === 1 ? 'ý úkol stále čeká' : 'é úkoly stále čekají'}
          </div>
          <ul className="text-sm text-amber-700 flex flex-col gap-1 list-disc list-inside">
            {requiredIncomplete.map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary path */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-3">Dokončit směnu</h2>
        <div className="flex flex-col gap-2.5 mb-4">
          <Checkbox disabled={!allRequiredDone} checked={c1} onChange={setC1} label="Dokončil/a jsem všechny povinné úkoly" />
          <Checkbox disabled={!allRequiredDone} checked={c2} onChange={setC2} label="Provedl/a jsem závěrečnou kontrolu" />
          <Checkbox disabled={!allRequiredDone} checked={c3} onChange={setC3} label="Dodržel/a jsem příslušné postupy" />
        </div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Jméno pro potvrzení</label>
        <input
          disabled={!allRequiredDone}
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent-200"
        />
        <label className="block text-xs font-medium text-gray-600 mb-1">Poznámka ke směně (volitelné)</label>
        <textarea
          disabled={!allRequiredDone}
          value={sessionNote}
          onChange={(e) => setSessionNote(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4 disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent-200"
        />
        <button
          disabled={!allRequiredDone || !c1 || !c2 || !c3 || !confirmName.trim()}
          onClick={submitComplete}
          className="w-full bg-accent text-white rounded-xl py-3 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-700 transition-colors flex items-center justify-center gap-2"
        >
          <PartyPopper size={16} /> Dokončit směnu
        </button>
      </div>

      {/* Secondary path — always available */}
      {!showEarlyForm ? (
        <button onClick={() => setShowEarlyForm(true)} className="text-sm text-gray-500 underline underline-offset-2 mx-auto block">
          Ukončit bez dokončení všech úkolů →
        </button>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
            <Frown size={16} /> Ukončit předčasně
          </div>
          <p className="text-xs text-red-600 mb-4">Tato skutečnost se uloží a bude viditelná administrátorům.</p>

          <label className="block text-xs font-medium text-gray-600 mb-1">Důvod</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-accent-200"
          >
            <option value="">Vyberte důvod…</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label className="block text-xs font-medium text-gray-600 mb-1">Komentář (volitelné)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent-200"
          />

          <label className="block text-xs font-medium text-gray-600 mb-1">Jméno pro potvrzení</label>
          <input
            value={earlyName}
            onChange={(e) => setEarlyName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent-200"
          />

          <label className="block text-xs font-medium text-gray-600 mb-1">Poznámka ke směně (volitelné)</label>
          <textarea
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-accent-200"
          />

          <button
            disabled={!reason || !earlyName.trim()}
            onClick={submitEarly}
            className="w-full bg-red-500 text-white rounded-xl py-3 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
          >
            Přesto ukončit směnu
          </button>
        </div>
      )}
    </div>
  )
}

function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label className={`flex items-center gap-2.5 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 accent-accent"
      />
      {label}
    </label>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  )
}
