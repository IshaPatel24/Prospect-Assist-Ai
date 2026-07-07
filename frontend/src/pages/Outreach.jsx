import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { outreachAPI, prospectsAPI } from '../utils/api'
import { MessageSquare, Copy, CheckCheck, ChevronDown, User, Sparkles } from 'lucide-react'

const LANGS = ['english', 'hindi', 'marathi', 'tamil']

function ScriptBlock({ title, content, field, copied, onCopy }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100/50">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-[#028090] uppercase tracking-wider">{title}</span>
        <button onClick={() => onCopy(content, field)}
          className="flex items-center gap-1 text-xs font-semibold text-[#028090] hover:text-[#026d7a]">
          {copied === field ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <p className="text-sm text-[#0A2342] leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}

export default function Outreach() {
  const [searchParams] = useSearchParams()
  const urlProspectId = searchParams.get('prospectId')

  const [prospects, setProspects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [script, setScript] = useState(null)
  const [prospect, setProspect] = useState(null)
  const [language, setLanguage] = useState('english')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    prospectsAPI.list({ limit: 50 })
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : r.data.prospects || []
        setProspects(list)
        
        // If there's an ID in search parameters, select it. Else default to first item.
        const initialId = urlProspectId || (list.length > 0 ? list[0].id : '')
        if (initialId) setSelectedId(initialId)
      })
  }, [urlProspectId])

  const generate = (id, lang) => {
    if (!id) return
    setLoading(true)
    setScript(null)

    if (id === 'LIVE') {
      const liveName = searchParams.get('prospectName') || ' Rahul Mehta'
      const liveProduct = searchParams.get('product') || 'Fixed Deposit'
      const liveScore = parseFloat(searchParams.get('score') || '75')
      const liveIncome = parseFloat(searchParams.get('income') || '500000')
      const liveCreditScore = parseInt(searchParams.get('creditScore') || '700')
      const liveOccupation = searchParams.get('occupation') || 'IT Professional'

      setProspect({
        id: 'LIVE',
        name: liveName,
        recommended_product: liveProduct,
        prospect_score: liveScore,
        occupation: liveOccupation,
        income: liveIncome,
        credit_score: liveCreditScore
      })

      outreachAPI.generateLive({
        prospect_id: 'LIVE',
        prospect_name: liveName,
        credit_score: liveCreditScore,
        income: liveIncome,
        recommended_product: liveProduct,
        language: lang,
        officer_name: 'your IDBI advisor'
      }).then(res => {
        setScript(res.data)
      }).catch(err => {
        console.error(err)
      }).finally(() => setLoading(false))
    } else {
      Promise.all([
        outreachAPI.generate(id, lang),
        prospectsAPI.get(id),
      ]).then(([s, p]) => {
        setScript(s.data)
        setProspect(p.data)
      }).catch(err => {
        console.error(err)
      }).finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    if (selectedId) generate(selectedId, language)
  }, [selectedId])

  const handleLang = (lang) => {
    setLanguage(lang)
    generate(selectedId, lang)
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#0A2342]">Outreach AI</h1>
        <p className="text-gray-500 text-sm mt-1">Generate personalised call scripts and email drafts</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="appearance-none text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-[#028090] bg-white font-medium text-gray-700"
          >
            {selectedId === 'LIVE' && (
              <option value="LIVE">{searchParams.get('prospectName') || 'Live Prospect'} (Custom Scored)</option>
            )}
            {prospects.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.recommended_product}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex gap-2">
          {LANGS.map(lang => (
            <button key={lang} onClick={() => handleLang(lang)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-150
                ${language === lang 
                  ? 'bg-[#028090] text-white shadow-sm border border-[#028090]' 
                  : 'bg-white text-[#0A2342] border border-gray-200 hover:border-gray-300'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {prospect && (
        <div className="bg-[#0A2342] rounded-2xl p-5 text-white flex items-center gap-4 border border-gray-800 shadow-sm relative overflow-hidden">
          {/* Subtle logo vector */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-white/5 skew-x-12 transform origin-top pointer-events-none" />
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#028090] to-[#02C39A] flex items-center justify-center font-bold text-white shadow-sm">
            {prospect.name?.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-1.5">
              {prospect.name}
              {prospect.id === 'LIVE' && (
                <span className="text-[9px] bg-emerald-500 text-white font-bold py-0.5 px-2 rounded-full flex items-center gap-0.5">
                  <Sparkles size={8} /> LIVE
                </span>
              )}
            </div>
            <div className="text-[11px] text-white/70 mt-1 font-medium">
              {prospect.occupation} · {prospect.recommended_product} · AI Score: <span className="font-extrabold text-[#02C39A]">{prospect.prospect_score}</span>
            </div>
          </div>
          {prospect.id !== 'LIVE' ? (
            <Link to={`/prospects/${prospect.id}`} className="ml-auto text-xs text-[#02C39A] font-semibold hover:underline">
              View Profile →
            </Link>
          ) : (
            <Link to="/scorer" className="ml-auto text-xs text-[#02C39A] font-semibold hover:underline">
              Adjust Parameters →
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
          <div className="w-9 h-9 border-4 border-[#028090] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-semibold">✨ AI Co-pilot compiling personalized outreach templates...</p>
        </div>
      ) : script ? (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-[#028090]" />
                <h3 className="font-bold text-sm text-[#0A2342]">📞 Sales Call Script</h3>
              </div>
              <ScriptBlock title="1. Professional Opening" content={script.opening} field="opening" copied={copied} onCopy={copy} />
              <ScriptBlock title="2. Value Hook & Pitch" content={script.hook} field="hook" copied={copied} onCopy={copy} />
              <ScriptBlock title="3. Handle Common Objection" content={script.objection_handler} field="objection" copied={copied} onCopy={copy} />
              <ScriptBlock title="4. Call to Action (CTA)" content={script.cta} field="cta" copied={copied} onCopy={copy} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#0A2342] mb-4">📧 Email Correspondence Draft</h3>
              <ScriptBlock
                title={`Subject: ${script.email_subject}`}
                content={script.email_body}
                field="email"
                copied={copied}
                onCopy={copy}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
