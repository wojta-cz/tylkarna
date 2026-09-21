# Café Ops

An internal café operations app: Tasks, Scheduled Tasks, Manuals, Recipes, Ending a Session, and Admin. PIN-based login, no typed passwords.

## Quick start (local mode — zero setup)

```bash
npm install
npm run dev
```

Open the printed local URL. Data is stored in your browser's `localStorage` — nothing else to configure. Demo login PINs:

| Person | PIN | Role |
|---|---|---|
| John Smith 👑 | 1111 | Admin |
| Alex Johnson ☕ | 2222 | Employee |
| Emma Williams 🌿 | 3333 | Employee |
| Daniel Brown 🔥 | 4444 | Employee |

## Switching to a shared backend (API mode)

The frontend never talks to a database directly — every read/write goes through `src/lib/storage.js` (`storageGet` / `storageSet`). To move from per-browser `localStorage` to a real shared store:

1. Copy `.env.example` to `.env` and set:
   ```
   VITE_STORAGE_MODE=api
   VITE_API_BASE_URL=   # leave blank to use the Vite dev proxy, or set a deployed URL
   ```
2. Run the included stand-in backend alongside the frontend:
   ```bash
   npm run dev:all
   ```
   This starts the Express server (`server/index.js`, port 4000) and Vite together. The server persists to a single `server/data.json` file and exposes exactly `GET /api/store/:key` and `PUT /api/store/:key`.
3. To move off the JSON-file stand-in to Postgres/Supabase/Firebase later, you only need to rewrite `readStore` / `writeStore` in `server/index.js` — the routes and the frontend contract don't change.

## Building for deployment

```bash
npm run build      # outputs static site to dist/
npm run preview    # preview the production build locally
```

`dist/` can be deployed to any static host (Vercel, Netlify, GitHub Pages, etc). If you're using API mode, deploy `server/` separately to any Node host (Render, Railway, Fly.io, a VPS) and point `VITE_API_BASE_URL` at it before building.

## Installing on an iPhone/iPad ("Add to Home Screen")

The app ships a web manifest and a basic offline-capable service worker (`public/manifest.webmanifest`, `public/sw.js`). Once deployed over HTTPS, open it in Safari on iOS and use Share → Add to Home Screen — it installs as a standalone app with no browser chrome.

## Project structure

```
src/
  lib/storage.js          storage abstraction (local/API modes) — the only place touching the backing store
  utils/schedule.js        scheduled-task pattern matching (taskAppliesOnDate)
  utils/sessionHelpers.js  session start/complete/close logic
  data/seed.js              demo data + constants (session types, tags, categories)
  context/                  AppContext (global state) and ToastContext
  components/                shared UI: Layout, TaskRow, Modal, TaskEditorModal, etc.
  pages/                     Tasks, Manuals, Recipes, EndSession, Profile, SessionDetail
  pages/admin/                Dashboard, Users, Tasks, Scheduled Tasks, Manuals, Recipes, Sessions
server/index.js             stand-in Express + JSON-file backend for API storage mode
```
