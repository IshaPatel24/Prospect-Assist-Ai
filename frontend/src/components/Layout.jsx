import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calculator, MessageSquare, LogOut,
  Brain, Menu, X, ChevronRight, Bell
} from 'lucide-react'

const NAV = [
  { to: '/',          label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/prospects', label: 'Prospects',   icon: Users },
  { to: '/scorer',    label: 'AI Scorer',   icon: Calculator },
  { to: '/outreach',  label: 'Outreach AI', icon: MessageSquare },
]

export default function Layout({ children, officer, onLogout }) {
  const [open, setOpen] = useState(false)

  const initials = officer?.name
    ? officer.name.split(' ').map(w => w[0]).slice(0, 2).join('')
    : 'OF'

  return (
    <div className="flex min-h-screen bg-[#F4F7FA]">

      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-250 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}
        style={{
          width: 240,
          background: 'linear-gradient(180deg, #071829 0%, #0A2342 50%, #0c2d50 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#028090,#02C39A)', boxShadow: '0 4px 12px rgba(2,128,144,0.4)' }}>
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Prospect Assist</div>
              <div className="text-[10px] font-medium" style={{ color: '#02C39A' }}>AI · Bugspire</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Main Menu
          </p>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={13} className="opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* Officer card */}
        <div className="px-4 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#028090,#02C39A)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {officer?.name || 'Officer'}
              </div>
              <div className="text-[11px] truncate" style={{ color: '#02C39A' }}>
                {officer?.branch || 'IDBI Bank'}
              </div>
            </div>
          </div>
          <button onClick={onLogout}
            className="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)} />
      )}

      {/* ── Main area ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white/80 backdrop-blur-md"
          style={{ borderBottom: '1px solid rgba(10,35,66,0.07)', boxShadow: '0 1px 4px rgba(10,35,66,0.06)' }}>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-[#0A2342] hover:bg-gray-100 transition-colors">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Page title / breadcrumb area (empty — pages set their own h1) */}
          <div className="hidden md:block" />

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-[#0A2342] hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse-glow"
                style={{ background: '#02C39A' }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#028090,#02C39A)' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-5 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
