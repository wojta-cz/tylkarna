import React, { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let idCounter = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, opts = {}) => {
    const id = idCounter++
    const toast = { id, message, type: opts.type || 'success', emoji: opts.emoji }
    setToasts((prev) => [...prev, toast])
    setTimeout(() => dismiss(id), opts.duration || 3200)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center px-4 w-full max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-slide-enter w-full flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-2xl px-4 py-3 text-sm text-gray-800"
          >
            {t.emoji ? (
              <span className="text-lg leading-none">{t.emoji}</span>
            ) : t.type === 'error' ? (
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
            ) : t.type === 'info' ? (
              <Info size={18} className="text-accent shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
