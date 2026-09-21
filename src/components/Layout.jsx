import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, LogOut, LogOutIcon } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const NAV_TOP = [
  { to: '/tasks', label: 'Úkoly', emoji: '✅' },
  { to: '/manuals', label: 'Manuály', emoji: '📖' },
  { to: '/recipes', label: 'Recepty', emoji: '☕' }
]

const MOBILE_TABS = [
  { to: '/tasks', label: 'Úkoly', emoji: '✅' },
  { to: '/manuals', label: 'Manuály', emoji: '📖' },
  { to: '/recipes', label: 'Recepty', emoji: '☕' },
  { to: '/end-session', label: 'Ukončit', emoji: '🏁' }
]

function NavItem({ to, label, emoji, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? 'bg-accent-50 text-accent-700' : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      <span className="text-lg leading-none">{emoji}</span>
      {label}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const { currentUser, logout } = useApp()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-[#F7F7F8]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-gray-200 bg-white safe-top">
        <div className="px-5 py-6 flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <span className="font-semibold text-gray-900">Café Ops</span>
        </div>
        <nav className="flex-1 px-3 flex flex-col gap-1">
          {NAV_TOP.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="px-3 pb-4 flex flex-col gap-1 border-t border-gray-100 pt-3">
          {currentUser.role === 'admin' && <NavItem to="/admin" label="Admin" emoji="🛠️" />}
          <NavItem to="/profile" label="Profil" emoji={currentUser.avatarEmoji} />
          <NavItem to="/end-session" label="Ukončit směnu" emoji="🏁" />
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 mt-1"
          >
            <LogOut size={18} />
            Odhlásit
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-200 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setDrawerOpen(true)} className="text-gray-600">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-1.5 font-semibold text-gray-900">
            <span>☕</span> Café Ops
          </div>
          <NavLink to="/profile" className="text-xl">{currentUser.avatarEmoji}</NavLink>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-xl flex flex-col safe-top safe-bottom fade-slide-enter">
            <div className="px-5 py-6 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <span className="text-2xl">☕</span> Café Ops
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 flex flex-col gap-1">
              {NAV_TOP.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setDrawerOpen(false)} />
              ))}
              {currentUser.role === 'admin' && <NavItem to="/admin" label="Admin" emoji="🛠️" onClick={() => setDrawerOpen(false)} />}
              <NavItem to="/profile" label="Profil" emoji={currentUser.avatarEmoji} onClick={() => setDrawerOpen(false)} />
              <NavItem to="/end-session" label="Ukončit směnu" emoji="🏁" onClick={() => setDrawerOpen(false)} />
            </nav>
            <button
              onClick={() => { setDrawerOpen(false); logout() }}
              className="mx-3 mb-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100"
            >
              <LogOutIcon size={18} />
              Odhlásit
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-20 md:pb-0 safe-bottom">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-bottom">
        <div className="grid grid-cols-4">
          {MOBILE_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`
              }
            >
              <span className="text-lg leading-none">{tab.emoji}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
