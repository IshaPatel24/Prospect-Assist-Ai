import React, { useState } from 'react'
import { login } from '../utils/api'
import { Brain, Eye, EyeOff, TrendingUp, Users, Shield, Zap } from 'lucide-react'

const FEATURES = [
  { icon: TrendingUp, title: 'AI-Powered Scoring', desc: 'XGBoost model ranks prospects by conversion probability in real-time' },
  { icon: Users,      title: '50+ Live Prospects',  desc: 'Auto-enriched from CBS, CRM & CIBIL data feeds' },
  { icon: Zap,        title: 'Instant Outreach',    desc: 'GPT-4o generates personalised scripts in seconds' },
  { icon: Shield,     title: 'Bank-Grade Security', desc: 'JWT auth with role-based access control' },
]

export default function Login({ onLogin }) {
  const [email, setEmail]     = useState('isha.patel@idbi.co.in')
  const [password, setPassword] = useState('demo123')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      onLogin(data.access_token, data)
    } catch {
      setError('Invalid credentials. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (brand) ─────────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #071829 0%, #0A2342 40%, #0d3060 70%, #0a4060 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #02C39A, transparent)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #028090, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #02C39A, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #028090, #02C39A)' }}>
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">Prospect Assist AI</div>
              <div className="text-xs" style={{ color: '#02C39A' }}>by Team Bugspire</div>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Smarter Banking<br />
              <span style={{ background: 'linear-gradient(90deg,#02C39A,#028090)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Starts Here
              </span>
            </h1>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
              AI-powered sales intelligence for IDBI Bank field officers. Score, rank, and convert prospects with machine learning.
            </p>
          </div>

          <div className="space-y-4 stagger">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 animate-fade-in">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(2,195,154,0.15)', border: '1px solid rgba(2,195,154,0.25)' }}>
                  <Icon size={16} style={{ color: '#02C39A' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: '#02C39A' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>IDBI Bank · Hackathon Demo · Team Bugspire</span>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F4F7FA]">
        <div className="w-full max-w-[400px] animate-fade-in" style={{ animationDelay: '0.15s' }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#028090,#02C39A)' }}>
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-[#0A2342]">Prospect Assist AI</div>
              <div className="text-xs text-gray-400">IDBI Bank Portal</div>
            </div>
          </div>

          <div className="card p-8 rounded-2xl">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-[#0A2342]">Welcome back 👋</h2>
              <p className="text-sm text-gray-500 mt-1">Sign in to your officer portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-field"
                  placeholder="you@idbi.co.in"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} required
                    className="input-field pr-11"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm text-red-600"
                  style={{ background: '#FFF1F2', border: '1px solid #FECDD3' }}>
                  <span className="text-base">⚠️</span> {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base mt-2"
                style={{ borderRadius: 10 }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      style={{ animation: 'spin-smooth 0.7s linear infinite' }} />
                    Signing in…
                  </span>
                ) : 'Sign in →'}
              </button>
            </form>

            {/* Demo credentials pill */}
            <div className="mt-5 rounded-xl p-4"
              style={{ background: 'linear-gradient(135deg,#EFF6FF,#F0FDFA)', border: '1px solid rgba(2,128,144,0.15)' }}>
              <p className="text-xs font-bold text-[#028090] mb-2 uppercase tracking-wide">🔑 Demo Credentials</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Email</span>
                  <button
                    onClick={() => setEmail('isha.patel@idbi.co.in')}
                    className="font-mono text-[#028090] font-medium hover:underline">
                    isha.patel@idbi.co.in
                  </button>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Password</span>
                  <button
                    onClick={() => setPassword('demo123')}
                    className="font-mono text-[#028090] font-medium hover:underline">
                    demo123
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
