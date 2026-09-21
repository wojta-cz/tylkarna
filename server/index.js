// Minimal, dependency-light backend for API storage mode.
//
// This is a stand-in store: a single JSON file on disk, exposing exactly the
// GET/PUT /api/store/:key routes the frontend's storage module expects.
// It's trivial to swap for a real database later — only storageGet/storageSet
// below need to change; the routes and the frontend contract stay the same.
//
// Run with: npm run server   (or npm run dev:all to run it alongside Vite)

import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, 'data.json')
const PORT = process.env.PORT || 4000

const app = express()
app.use(express.json())

// CORS for local dev (Vite runs on a different port)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

async function readStore() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeStore(store) {
  await fs.writeFile(DB_FILE, JSON.stringify(store, null, 2))
}

app.get('/api/store/:key', async (req, res) => {
  const store = await readStore()
  const key = req.params.key
  if (!(key in store)) return res.status(404).json({ error: 'not found' })
  res.json({ key, value: store[key] })
})

app.put('/api/store/:key', async (req, res) => {
  const store = await readStore()
  store[req.params.key] = req.body.value
  await writeStore(store)
  res.json({ key: req.params.key, value: req.body.value })
})

app.listen(PORT, () => {
  console.log(`Café Ops storage API — swap-in stand-in store — running on http://localhost:${PORT}`)
  console.log('Data persists to server/data.json. Replace readStore/writeStore to move to Postgres/Supabase/Firebase.')
})
