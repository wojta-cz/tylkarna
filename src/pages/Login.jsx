import React, { useState } from 'react'
import { Delete } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function Login() {
  const { db, login } = useApp()
  const [selected, setSelected] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  if (!db) return null

  const handleDigit = (d) => {
    if (pin.length >= 4) return
    const next = pin + d
    setError(false)
    setPin(next)
    if (next.length === 4) {
      if (next === selected.pin) {
        setTimeout(() => login(selected.id), 120)
      } else {
        setTimeout(() => {
          setError(true)
          setPin('')
        }, 300)
      }
    }
  }

  const backspace = () => setPin((p) => p.slice(0, -1))

  if (!selected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F8] px-6 safe-top safe-bottom">
        <div className="text-4xl mb-2">☕</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Kavrána TYL</h1>
        <p className="text-gray-500 mb-8">Kdo dneska pracuje?</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {db.users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u)}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:border-accent-200 transition-all"
            >
              <span className="text-3xl">{u.avatarEmoji}</span>
              <span className="font-medium text-gray-800 text-sm text-center">{u.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F8] px-6 safe-top safe-bottom">
      <button onClick={() => { setSelected(null); setPin(''); setError(false) }} className="text-accent text-sm mb-6 self-start ml-2">
        ← Zpět
      </button>
      <div className="text-4xl mb-2">{selected.avatarEmoji}</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{selected.name}</h2>
      <p className={`text-sm mb-6 ${error ? 'text-red-500' : 'text-gray-500'}`}>
        {error ? 'Nesprávný PIN — zkuste to znovu' : 'Zadejte čtyřmístný PIN'}
      </p>

      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-2 ${
              i < pin.length ? (error ? 'bg-red-500 border-red-500' : 'bg-accent border-accent') : 'border-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="aspect-square rounded-2xl bg-white border border-gray-200 text-xl font-medium text-gray-800 shadow-sm active:bg-gray-100"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleDigit('0')}
          className="aspect-square rounded-2xl bg-white border border-gray-200 text-xl font-medium text-gray-800 shadow-sm active:bg-gray-100"
        >
          0
        </button>
        <button onClick={backspace} className="aspect-square rounded-2xl flex items-center justify-center text-gray-500 active:bg-gray-100">
          <Delete size={20} />
        </button>
      </div>
    </div>
  )
}
