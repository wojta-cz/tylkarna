import { supabase } from './supabaseClient'

// Výchozí režim určí proměnná prostředí (local, api, supabase)
const MODE = import.meta.env.VITE_STORAGE_MODE || 'local'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// Storage abstraction — the ONLY place that talks to the backing store.
// Swap the backing store (Postgres/Supabase/Firebase/etc.) by rewriting
// storageGet/storageSet below; nothing else in the app needs to change.
//
// Modes (set via env vars, see .env.example):
//   VITE_STORAGE_MODE=local   -> browser localStorage (default, zero setup)
//   VITE_STORAGE_MODE=api     -> fetch-based adapter hitting the Express
//                                 backend's GET/PUT /api/store/:key routes

async function storageGetLocal(key) {
  const raw = window.localStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

async function storageSetLocal(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
  return true
}

async function storageGetApi(key) {
  const res = await fetch(`${API_BASE}/api/store/${encodeURIComponent(key)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`storageGet failed for ${key}: ${res.status}`)
  const body = await res.json()
  return body.value
}

async function storageSetApi(key, value) {
  const res = await fetch(`${API_BASE}/api/store/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  })
  if (!res.ok) throw new Error(`storageSet failed for ${key}: ${res.status}`)
  return true
}


async function storageGetSupabase(key) {
  const { data, error } = await supabase
    .from('app_storage')
    .select('value')
    .eq('key', key)
    .single()

  // Kód PGRST116 znamená, že klíč v DB zatím neexistuje (vracíme null jako localStorage)
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Supabase get failed for ${key}: ${error.message}`)
  }
  return data ? data.value : null
}

async function storageSetSupabase(key, value) {
  const { error } = await supabase
    .from('app_storage')
    .upsert({ key, value }) // upsert automaticky vloží nový nebo přepíše existující klíč

  if (error) {
    throw new Error(`Supabase set failed for ${key}: ${error.message}`)
  }
  return true
}

export async function storageGet(key) {
  try {
    if (MODE === 'supabase') return await storageGetSupabase(key)
    if (MODE === 'api') return await storageGetApi(key)
    return await storageGetLocal(key)
  } catch (err) {
    console.error('storageGet error', key, err)
    return null
  }
}

export async function storageSet(key, value) {
  try {
    if (MODE === 'supabase') return await storageSetSupabase(key, value)
    if (MODE === 'api') return await storageSetApi(key, value)
    return await storageSetLocal(key, value)
  } catch (err) {
    console.error('storageSet error', key, err)
    return false
  }
}

export const STORAGE_MODE = MODE