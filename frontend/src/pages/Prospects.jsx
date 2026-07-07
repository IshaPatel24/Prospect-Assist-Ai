import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProspects } from '../utils/api'
import ScoreBadge from '../components/ScoreBadge'
import { Search, SlidersHorizontal, MessageSquare, ArrowUpRight, ChevronUp, ChevronDown } from 'lucide-react'

const STATUS_STYLE = {
  new:       { bg: '#EFF6FF', color: '#2563EB', label: 'New' },
  contacted: { bg: '#FFFBEB', color: '#D97706', label: 'Contacted' },
  converted: { bg: '#F0FDF4', color: '#16A34A', label: 'Converted' },
  lost:      { bg: '#FFF1F2', color: '#E11D48', label: 'Lost' },
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array(7).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="skeleton h-4 rounded" style={{ width: i === 0 ? 140 : i === 1 ? 60 : 90 }} />
        </td>
      ))}
    </tr>
  )
}

export default function Prospects() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey]     = useState('prospect_score')
  const [sortDir, setSortDir]     = useState('desc')

  useEffect(() => {
    getProspects({ sort_by: 'prospect_score', limit: 50 })
      .then(d => setProspects(d.prospects || []))
      .finally(() => setLoading(false))
  }, [])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = prospects
    .filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q
        || p.name.toLowerCase().includes(q)
        || (p.city || p.location || '').toLowerCase().includes(q)
        || (p.recommended_product || '').toLowerCase().includes(q)
        || (p.occupation || '').toLowerCase().includes(q)
      const matchStatus = !statusFilter || p.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="opacity-20" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-[#028090]" />
      : <ChevronDown size={12} className="text-[#028090]" />
  }

  const Th = ({ col, label }) => (
    <th
      className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 cursor-pointer select-none hover:text-[#028090] transition-colors"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">{label}<SortIcon col={col} /></span>
    </th>
  )

  /* Score mini-bar */
  const ScoreBar = ({ score }) => {
    const pct = Math.round(score)
    const color = score >= 75 ? '#02C39A' : score >= 50 ? '#F59E0B' : '#94A3B8'
    return (
      <div className="flex items-center gap-2">
        <div className="score-bar w-16">
          <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0A2342]">Prospects</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-ranked by conversion probability</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/scorer" className="btn-primary py-2 px-4 text-xs">
            <SlidersHorizontal size={12} /> Score Live Prospect
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl bg-[#F0FDFA] text-[#028090] border border-[rgba(2,128,144,0.15)]">
            {loading ? '—' : filtered.length} prospects
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-56">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search name, city, product, occupation…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 bg-white"
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input-field w-auto bg-white"
          style={{ paddingLeft: 12, paddingRight: 32 }}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-500 font-medium hover:border-[#028090] hover:text-[#028090] transition-colors">
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {/* ── Table card ──────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(10,35,66,0.06)' }}>
              <tr>
                <Th col="name"            label="Prospect" />
                <Th col="prospect_score"  label="Score" />
                <Th col="recommended_product" label="Product" />
                <Th col="income"          label="Income" />
                <Th col="cibil_score"     label="CIBIL" />
                <Th col="city"            label="City" />
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400">
                        <div className="text-3xl mb-2">🔍</div>
                        No prospects match your search
                      </td>
                    </tr>
                  )
                  : filtered.map((p, i) => {
                    const st = STATUS_STYLE[p.status] || { bg: '#F8FAFC', color: '#64748B', label: p.status || 'New' }
                    return (
                      <tr key={p.id} className="table-row"
                        style={{ borderBottom: '1px solid rgba(10,35,66,0.04)', animationDelay: `${i * 0.02}s` }}>

                        {/* Prospect name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', color: '#2563EB' }}>
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <Link to={`/prospects/${p.id}`}
                                className="font-semibold text-[#0A2342] hover:text-[#028090] transition-colors">
                                {p.name}
                              </Link>
                              <div className="text-xs text-gray-400 mt-0.5">{p.occupation}</div>
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <ScoreBadge score={p.prospect_score} />
                            <ScoreBar score={p.prospect_score} />
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                            style={{ background: '#F0FDFA', color: '#028090' }}>
                            {p.recommended_product}
                          </span>
                        </td>

                        {/* Income */}
                        <td className="px-4 py-3.5 text-gray-600 font-medium text-xs">
                          ₹{(p.income / 1000).toFixed(0)}K
                        </td>

                        {/* CIBIL */}
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-bold ${
                            (p.cibil_score || p.credit_score) >= 750 ? 'text-emerald-600' :
                            (p.cibil_score || p.credit_score) >= 700 ? 'text-amber-600' : 'text-red-500'
                          }`}>
                            {p.cibil_score || p.credit_score}
                          </span>
                        </td>

                        {/* City */}
                        <td className="px-4 py-3.5 text-gray-500 text-xs">
                          📍 {p.city || p.location}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className="badge"
                            style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}22` }}>
                            {st.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Link to={`/prospects/${p.id}`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#028090] hover:bg-[#F0FDFA] transition-all"
                              title="View profile">
                              <ArrowUpRight size={14} />
                            </Link>
                            <Link to={`/outreach?prospectId=${p.id}`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#028090] hover:bg-[#F0FDFA] transition-all"
                              title="Generate script">
                              <MessageSquare size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
