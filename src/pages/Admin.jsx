import React from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './admin/AdminDashboard.jsx'
import AdminUsers from './admin/AdminUsers.jsx'
import AdminTasks from './admin/AdminTasks.jsx'
import AdminScheduled from './admin/AdminScheduled.jsx'
import AdminManuals from './admin/AdminManuals.jsx'
import AdminRecipes from './admin/AdminRecipes.jsx'
import AdminSessions from './admin/AdminSessions.jsx'

const TABS = [
  { to: '/admin', label: 'Přehled', emoji: '📊', end: true },
  { to: '/admin/users', label: 'Uživatelé', emoji: '👥' },
  { to: '/admin/tasks', label: 'Úkoly', emoji: '✅' },
  { to: '/admin/scheduled', label: 'Naplánované úkoly', emoji: '📆' },
  { to: '/admin/manuals', label: 'Manuály', emoji: '📖' },
  { to: '/admin/recipes', label: 'Recepty', emoji: '☕' },
  { to: '/admin/sessions', label: 'Směny', emoji: '🗂️' }
]

export default function Admin() {
  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">🛠️ Administrace</h1>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                isActive ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200'
              }`
            }
          >
            {t.emoji} {t.label}
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="scheduled" element={<AdminScheduled />} />
        <Route path="manuals" element={<AdminManuals />} />
        <Route path="recipes" element={<AdminRecipes />} />
        <Route path="sessions" element={<AdminSessions />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  )
}
