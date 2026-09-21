import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { storageGet, storageSet } from '../lib/storage'
import { buildSeed } from '../data/seed'

const STORE_KEY = 'cafe-ops-db'
const AUTH_KEY = 'cafe-ops-auth'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [db, setDb] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      let data = await storageGet(STORE_KEY)
      if (!data) {
        data = buildSeed()
        await storageSet(STORE_KEY, data)
      }
      setDb(data)
      const auth = await storageGet(AUTH_KEY)
      if (auth?.userId) setCurrentUserId(auth.userId)
      setLoading(false)
    })()
  }, [])

  const persist = useCallback(async (updater) => {
    setDb((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      storageSet(STORE_KEY, next)
      return next
    })
  }, [])

  const login = useCallback(async (userId) => {
    setCurrentUserId(userId)
    await storageSet(AUTH_KEY, { userId })
  }, [])

  const logout = useCallback(async () => {
    setCurrentUserId(null)
    await storageSet(AUTH_KEY, { userId: null })
  }, [])

  const currentUser = db?.users.find((u) => u.id === currentUserId) || null

  const value = {
    db,
    loading,
    persist,
    currentUser,
    login,
    logout
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
