import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Prospects from './pages/Prospects'
import ProspectDetail from './pages/ProspectDetail'
import Scorer from './pages/Scorer'
import Outreach from './pages/Outreach'
import Layout from './components/Layout'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [officer, setOfficer] = useState(JSON.parse(localStorage.getItem('officer') || 'null'))

  const handleLogin = (tok, data) => {
    const officerData = data.user || data
    localStorage.setItem('token', tok)
    localStorage.setItem('officer', JSON.stringify(officerData))
    setToken(tok)
    setOfficer(officerData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('officer')
    setToken(null)
    setOfficer(null)
  }

  if (!token) return <Login onLogin={handleLogin} />

  return (
    <Layout officer={officer} onLogout={handleLogout}>
      <Routes>
        <Route path="/"           element={<Dashboard />} />
        <Route path="/prospects"  element={<Prospects />} />
        <Route path="/prospects/:id" element={<ProspectDetail />} />
        <Route path="/scorer"     element={<Scorer />} />
        <Route path="/outreach"   element={<Outreach />} />
        <Route path="*"           element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
