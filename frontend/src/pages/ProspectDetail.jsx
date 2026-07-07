import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { prospectsAPI } from '../utils/api'
import ScoreBadge from '../components/ScoreBadge'
import { ArrowLeft, MessageSquare, Phone, Mail, Briefcase, MapPin, CreditCard } from 'lucide-react'

export default function ProspectDetail() {
  const { id } = useParams()
  const [prospect, setProspect] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    prospectsAPI.get(id)
      .then(r => setProspect(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#028090] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!prospect) return (
    <div className="text-center py-16 text-gray-400">Prospect not found.</div>
  )

  const details = [
    { icon: Briefcase, label: 'Occupation',       value: prospect.occupation },
    { icon: MapPin,     label: 'Location',         value: prospect.location },
    { icon: Phone,      label: 'Phone',            value: prospect.phone },
    { icon: Mail,       label: 'Email',            value: prospect.email },
    { icon: CreditCard, label: 'Credit Score',     value: prospect.credit_score },
    { icon: null,       label: 'Age',              value: `${prospect.age} years` },
    { icon: null,       label: 'Annual Income',    value: `₹${(prospect.income / 100000).toFixed(1)}L` },
    { icon: null,       label: 'Existing Products',value: (prospect.existing_products || []).join(', ') || '—' },
  ]

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/prospects')}
        className="flex items-center gap-2 text-sm text-[#028090] font-semibold hover:underline">
        <ArrowLeft size={15} /> Back to Prospects
      </button>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Left: Profile card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#028090]/10 flex items-center justify-center text-[#028090] font-bold text-xl">
                {prospect.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0A2342]">{prospect.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{prospect.occupation}</p>
              </div>
            </div>
            <ScoreBadge score={prospect.prospect_score} />
          </div>

          <div className="divide-y divide-gray-50">
            {details.map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2.5 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-[#0A2342] text-right max-w-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Recommendation */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#0A2342] mb-3">🎯 Recommended Product</h3>
            <div className="text-2xl font-bold text-[#028090] mb-4">{prospect.recommended_product}</div>

            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Why this score?</h4>
            <div className="space-y-2">
              {(prospect.score_reasons || []).map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#02C39A] font-bold mt-0.5">✓</span>
                  <span className="text-sm text-[#0A2342]">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <Link to={`/outreach?prospectId=${prospect.id}`}
            className="flex items-center justify-center gap-2 w-full bg-[#028090] hover:bg-[#026d7a] text-white py-3.5 rounded-xl font-semibold transition">
            <MessageSquare size={18} />
            Generate AI Outreach Script
          </Link>
        </div>
      </div>
    </div>
  )
}
