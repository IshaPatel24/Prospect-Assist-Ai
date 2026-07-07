import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getDashboard, getFunnel } from '../utils/api'
import ScoreBadge from '../components/ScoreBadge'
import {
  TrendingUp, Users, Flame, CheckCircle,
  IndianRupee, Target, ArrowUpRight, RefreshCw,
  AlertTriangle, Info, Bell, Sparkles, MessageSquare
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

/* ── Color palette ─────────────────────────────────────── */
const PIE_COLORS = ['#02C39A', '#028090', '#0A2342']
const FUNNEL_COLORS = ['#0A2342', '#0C2D50', '#028090', '#029FA4', '#02C39A', '#34D399']

/* ── Skeleton card ─────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="skeleton h-9 w-9 rounded-xl mb-4" />
      <div className="skeleton h-7 w-20 mb-2" />
      <div className="skeleton h-4 w-28" />
    </div>
  )
}

/* ── KPI Card ──────────────────────────────────────────── */
function KpiCard({ label, value, icon: Icon, iconClass, trend, delay = 0 }) {
  return (
    <div className="card card-hover p-5 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}>
      <div className={`inline-flex p-2.5 rounded-xl mb-4 ${iconClass}`}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-black text-[#0A2342] tabular-nums">{value ?? '—'}</div>
      <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <TrendingUp size={11} /> {trend}
        </div>
      )}
    </div>
  )
}

/* ── Custom Tooltip ────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl px-4 py-2.5 shadow-card-md border border-gray-100 text-xs">
      {label && <div className="font-semibold text-[#0A2342] mb-1">{label}</div>}
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-gray-500">{p.name || p.dataKey}:</span>
          <span className="font-bold text-[#0A2342]">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [funnelData, setFunnelData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    try {
      const [d, f] = await Promise.all([
        getDashboard(),
        getFunnel()
      ])
      setData(d)
      setFunnelData(f.stages || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const kpis = data?.kpis || {}
  const topProspects = data?.top_prospects || []

  const scoreDist = Object.entries(data?.score_distribution || {})
    .map(([name, value]) => ({ name, value }))

  const productDist = Object.entries(data?.product_distribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const kpiCards = [
    { label: 'Total Prospects', value: kpis.total_prospects, icon: Users,       iconClass: 'icon-blue',   trend: '+5 this week' },
    { label: 'Hot Leads',       value: kpis.hot_leads,      icon: Flame,       iconClass: 'icon-green',  trend: `${kpis.hot_leads} ready to close` },
    { label: 'Converted',       value: kpis.converted,      icon: CheckCircle, iconClass: 'icon-teal' },
    { label: 'Conv. Rate',      value: kpis.conversion_rate != null ? `${kpis.conversion_rate}%` : null, icon: Target, iconClass: 'icon-purple' },
    { label: 'Pipeline Value',  value: kpis.pipeline_value  != null ? `₹${(kpis.pipeline_value/100000).toFixed(1)}L` : null, icon: IndianRupee, iconClass: 'icon-orange' },
    { label: 'Contacted',       value: kpis.contacted,      icon: TrendingUp,  iconClass: 'icon-pink' },
  ]

  const getAlerts = () => {
    if (!data || !data.top_prospects) return []
    const alerts = []
    
    // Alert 1: Hot Lead alert
    const hotLead = data.top_prospects[0]
    if (hotLead) {
      alerts.push({
        id: 'alert-1',
        type: 'success',
        title: 'Priority Lead Follow-up',
        message: `Execute outreach for ${hotLead.name} (${hotLead.recommended_product}) with a high score of ${hotLead.prospect_score}.`,
        link: `/outreach?prospectId=${hotLead.id}`
      })
    }
    
    // Alert 2: Personal Loan warning
    alerts.push({
      id: 'alert-2',
      type: 'warning',
      title: 'Credit Enquiries Warning',
      message: 'PROS1014 (Sanjay Patil) has 4 enquiries in 6M. Review details in portfolio.',
      link: '/prospects/PROS1014'
    })
    
    // Alert 3: Campaign info
    alerts.push({
      id: 'alert-3',
      type: 'info',
      title: 'Mutual Fund SIP Drive',
      message: 'Active campaign for salaried individuals. Use AI Scorer for matching.',
      link: '/scorer'
    })
    
    return alerts
  }

  const alerts = getAlerts()

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0A2342]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time prospect intelligence overview</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#028090] bg-white border border-gray-200 hover:border-[#028090] transition-all"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── KPI Grid ───────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger">
          {kpiCards.map(({ label, value, icon, iconClass, trend }, i) => (
            <KpiCard key={label} label={label} value={value} icon={icon}
              iconClass={iconClass} trend={trend} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* ── Charts Row ─────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Pie Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0A2342]">Lead Score Distribution</h3>
            {!loading && (
              <span className="badge" style={{ background: '#F0FDFA', color: '#028090', border: '1px solid rgba(2,128,144,0.2)' }}>
                {kpis.total_prospects} total
              </span>
            )}
          </div>
          {loading ? (
            <div className="skeleton h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={scoreDist} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {scoreDist.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={v => <span style={{ fontSize: 11, color: '#64748B' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0A2342]">Recommended Products</h3>
          </div>
          {loading ? (
            <div className="skeleton h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productDist} layout="vertical" barSize={10} margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category" dataKey="name" width={110}
                  tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter, sans-serif' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}
                  fill="url(#barGrad)"
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#028090" />
                    <stop offset="100%" stopColor="#02C39A" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Funnel and Alerts Row ──────────────── */}
      <div className="grid lg:grid-cols-12 gap-5">
        
        {/* Sales Funnel Chart */}
        <div className="card p-5 lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0A2342] flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#028090]" />
              Conversion Funnel Analysis
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#028090]">
              CRM Pipeline
            </span>
          </div>

          {loading ? (
            <div className="skeleton h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} layout="vertical" barSize={12} margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category" dataKey="stage" width={120}
                  tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dynamic Alerts */}
        <div className="card p-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#0A2342] mb-3 flex items-center gap-1.5">
              <Bell size={16} className="text-orange-500" />
              Copilot Key Actions
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(a => {
                  let icon = <Info size={14} className="text-blue-500" />
                  let bg = 'bg-blue-50/50'
                  let border = 'border-blue-100'
                  
                  if (a.type === 'success') {
                    icon = <Flame size={14} className="text-emerald-500 animate-pulse" />
                    bg = 'bg-emerald-50/50'
                    border = 'border-emerald-100'
                  } else if (a.type === 'warning') {
                    icon = <AlertTriangle size={14} className="text-amber-500" />
                    bg = 'bg-amber-50/50'
                    border = 'border-amber-100'
                  }
                  
                  return (
                    <div
                      key={a.id}
                      onClick={() => navigate(a.link)}
                      className={`p-3 rounded-xl border ${bg} ${border} cursor-pointer hover:bg-white hover:shadow-sm transition-all flex gap-2.5 items-start`}
                    >
                      <div className="mt-0.5">{icon}</div>
                      <div>
                        <div className="text-xs font-bold text-[#0A2342]">{a.title}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{a.message}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
          <Link
            to="/scorer"
            className="w-full py-2.5 mt-4 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            Calculate Live ML Score
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Top Prospects ───────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(10,35,66,0.06)' }}>
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-[#028090]" />
            <h3 className="font-bold text-[#0A2342]">Top Hot Prospects</h3>
          </div>
          <Link to="/prospects"
            className="flex items-center gap-1 text-sm font-semibold text-[#028090] hover:text-[#026d7a] transition-colors">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-48" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {topProspects.map((p, i) => (
              <Link key={p.id} to={`/prospects/${p.id}`}
                className="table-row flex items-center justify-between px-5 py-3.5"
                style={{
                  borderBottom: i < topProspects.length - 1 ? '1px solid rgba(10,35,66,0.04)' : 'none',
                  animationDelay: `${i * 0.04}s`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', color: '#2563EB' }}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                      style={{ background: '#02C39A' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#0A2342]">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p.recommended_product} · {p.city}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreBadge score={p.prospect_score} />
                  <ArrowUpRight size={14} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
