import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Tasks from './pages/Tasks.jsx'
import Manuals from './pages/Manuals.jsx'
import Recipes from './pages/Recipes.jsx'
import EndSession from './pages/EndSession.jsx'
import Profile from './pages/Profile.jsx'
import SessionDetail from './pages/SessionDetail.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const { loading, currentUser } = useApp()

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F7F7F8]">
        <div className="text-3xl animate-pulse">☕</div>
      </div>
    )
  }

  if (!currentUser) {
    return <Login />
  }

  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/manuals" element={<Manuals />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/end-session" element={<EndSession />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/session/:id" element={<SessionDetail />} />
          {currentUser.role === 'admin' && <Route path="/admin/*" element={<Admin />} />}
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}
