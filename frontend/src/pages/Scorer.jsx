import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { scoreProspect } from '../utils/api'
import { Brain, Sparkles, AlertCircle, ArrowRight, RefreshCw, Calculator, HelpCircle } from 'lucide-react'

const OCCUPATION_OPTIONS = [
  "Salaried Engineer",
  "IT Professional",
  "Government Employee",
  "Doctor",
  "Teacher",
  "PSU Officer",
  "CA/Lawyer",
  "Business Owner",
  "Self-Employed",
  "Retired Government"
]

const PRODUCT_LIST = [
  "Savings Account",
  "Current Account",
  "Fixed Deposit",
  "Home Loan",
  "Personal Loan",
  "Mutual Fund",
  "Credit Card",
  "Insurance"
]

export default function Scorer() {
  const navigate = useNavigate()
  const [name, setName] = useState('Rahul Mehta')
  const [age, setAge] = useState(32)
  const [income, setIncome] = useState(650000)
  const [creditScore, setCreditScore] = useState(725)
  const [occupation, setOccupation] = useState('IT Professional')
  const [monthlyTxnCount, setMonthlyTxnCount] = useState(18)
  const [avgTxnValue, setAvgTxnValue] = useState(7500)
  const [bureauEnquiries, setBureauEnquiries] = useState(1)
  const [dpdHistory, setDpdHistory] = useState(0)
  const [existingProducts, setExistingProducts] = useState(['Savings Account'])

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleProductToggle = (prod) => {
    setExistingProducts(prev =>
      prev.includes(prod) ? prev.filter(p => p !== prod) : [...prev, prod]
    )
  }

  const handleReset = () => {
    setName('Rahul Mehta')
    setAge(32)
    setIncome(650000)
    setCreditScore(725)
    setOccupation('IT Professional')
    setMonthlyTxnCount(18)
    setAvgTxnValue(7500)
    setBureauEnquiries(1)
    setDpdHistory(0)
    setExistingProducts(['Savings Account'])
    setResult(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = {
        age: parseInt(age),
        income: parseFloat(income),
        credit_score: parseInt(creditScore),
        existing_products: existingProducts,
        occupation: occupation,
        monthly_txn_count: parseInt(monthlyTxnCount),
        avg_txn_value: parseFloat(avgTxnValue),
        bureau_enquiries_6m: parseInt(bureauEnquiries),
        dpd_history: parseInt(dpdHistory)
      }

      const res = await scoreProspect(data)
      setResult(res)
    } catch (err) {
      console.error(err)
      setError('Failed to compute score. Please check your inputs and backend connection.')
    } finally {
      setLoading(false)
    }
  }

  // Visual score categories
  const getScoreColor = (score) => {
    if (score >= 75) return { text: '#02C39A', bg: 'rgba(2,195,154,0.1)', border: '#02C39A', label: 'Hot Lead' }
    if (score >= 50) return { text: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: '#F59E0B', label: 'Warm Lead' }
    return { text: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: '#94A3B8', label: 'Cold Lead' }
  }

  const scoreTheme = result ? getScoreColor(result.score) : null

  // SVG parameters for circular score progress
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = result ? circumference - (result.score / 100) * circumference : circumference

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0A2342] flex items-center gap-2">
          <Calculator className="text-[#028090]" />
          AI Prospect Scorer
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Score new prospects on-the-fly and find recommended cross-sell bank products</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <span className="text-sm font-bold text-[#0A2342]">Prospect Demographics & Financial Indicators</span>
            <button
              onClick={handleReset}
              className="text-xs text-[#028090] font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw size={11} /> Reset Defaults
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Prospect Name
                </label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="input-field" placeholder="e.g. Aarav Sharma"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Age (Years)
                </label>
                <input
                  type="number" value={age} onChange={e => setAge(e.target.value)} required min={18} max={90}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Annual Income */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Annual Income (₹)
                </label>
                <input
                  type="number" value={income} onChange={e => setIncome(e.target.value)} required min={10000} step={10000}
                  className="input-field font-medium text-gray-800"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  ₹{(income / 100000).toFixed(2)} Lakhs per annum
                </span>
              </div>

              {/* Credit Score */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  CIBIL / Credit Score
                </label>
                <input
                  type="number" value={creditScore} onChange={e => setCreditScore(e.target.value)} required min={300} max={900}
                  className="input-field font-bold"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Occupation */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Occupation Profile
                </label>
                <select
                  value={occupation} onChange={e => setOccupation(e.target.value)}
                  className="input-field"
                >
                  {OCCUPATION_OPTIONS.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              {/* DPD History */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  Payment History (DPD)
                  <span className="group relative cursor-pointer text-gray-300 hover:text-gray-500">
                    <HelpCircle size={12} />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-gray-800 text-[10px] text-white rounded p-1.5 leading-normal shadow-lg">
                      Days Past Due (DPD). 0 means clean, 30/60 means minor default history.
                    </span>
                  </span>
                </label>
                <select
                  value={dpdHistory} onChange={e => setDpdHistory(parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={0}>0 DPD (No Overdue)</option>
                  <option value={30}>30 DPD (Minor Delay)</option>
                  <option value={60}>60+ DPD (Significant Delinquency)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-3">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Account Transaction Profile
              </span>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Monthly Txns */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Monthly Txn Count
                  </label>
                  <input
                    type="number" value={monthlyTxnCount} onChange={e => setMonthlyTxnCount(e.target.value)} required min={0}
                    className="input-field text-xs"
                  />
                </div>

                {/* Avg Txn Value */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Avg Txn Value (₹)
                  </label>
                  <input
                    type="number" value={avgTxnValue} onChange={e => setAvgTxnValue(e.target.value)} required min={0}
                    className="input-field text-xs"
                  />
                </div>

                {/* Bureau Enquiries */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Enquiries (6 Months)
                  </label>
                  <input
                    type="number" value={bureauEnquiries} onChange={e => setBureauEnquiries(e.target.value)} required min={0}
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Existing products */}
            <div className="border-t border-gray-50 pt-3">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Existing Bank Products
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PRODUCT_LIST.map(prod => {
                  const active = existingProducts.includes(prod)
                  return (
                    <button
                      key={prod} type="button" onClick={() => handleProductToggle(prod)}
                      className={`text-xs px-2.5 py-2 rounded-lg text-left border transition-all ${
                        active
                          ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-semibold'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {prod}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3 text-sm mt-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Prospect Credit Profile...
                </span>
              ) : (
                <>Score Prospect & Recommend Product <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>

        {/* Right: ML Output */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-50/50 rounded-tr-full pointer-events-none" />

            {!result && !loading && (
              <div className="text-center max-w-sm space-y-4">
                <div className="w-16 h-16 bg-[#028090]/10 rounded-2xl flex items-center justify-center mx-auto text-[#028090]">
                  <Brain size={32} />
                </div>
                <h3 className="font-extrabold text-[#0A2342] text-lg">Scoring Predictions Awaiting</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Enter the prospect's demographics, CIBIL, repayment indicators, and current holdings, then run the algorithm to analyze lead quality.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <Sparkles size={10} className="text-[#02C39A]" /> XGBoost ML Rules Powered
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto relative">
                  <div className="w-12 h-12 border-4 border-[#028090] border-t-transparent rounded-full animate-spin" />
                  <Brain size={18} className="absolute text-[#028090]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0A2342] text-sm">Evaluating Conversion Metrics</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Applying scoring logic & rules...</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="w-full h-full flex flex-col justify-between space-y-6 animate-fade-in">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Live Score Result
                  </span>
                  <h3 className="font-extrabold text-[#0A2342] text-xl mt-1">{name}</h3>
                </div>

                {/* Score circular gauge */}
                <div className="relative flex justify-center py-2">
                  <svg className="w-36 h-36 transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="72" cy="72" r={radius}
                      stroke="#F1F5F9" strokeWidth="10" fill="transparent"
                    />
                    {/* Active Circle */}
                    <circle
                      cx="72" cy="72" r={radius}
                      stroke={scoreTheme.text} strokeWidth="10" fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-3xl font-black text-[#0A2342]">{result.score}</span>
                    <span className="text-[10px] text-gray-400 block font-semibold mt-0.5">Out of 100</span>
                  </div>
                </div>

                <div className="text-center">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
                    style={{
                      background: scoreTheme.bg,
                      color: scoreTheme.text,
                      borderColor: `${scoreTheme.text}33`
                    }}
                  >
                    {scoreTheme.label}
                  </span>
                </div>

                {/* Recommendation */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Recommended Cross-Sell Product
                  </span>
                  <span className="text-lg font-black text-[#028090]">
                    {result.recommended_product}
                  </span>
                </div>

                {/* score reasons */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    AI Scoring Factors
                  </span>
                  {(result.reasons || []).map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-[#02C39A] font-bold">✓</span>
                      <span className="text-gray-600">{reason}</span>
                    </div>
                  ))}
                </div>

                {/* generate outreach script button */}
                <button
                  onClick={() => {
                    // Navigate to outreach with query param containing name, score, and recommended product
                    navigate(`/outreach?prospectId=LIVE&prospectName=${encodeURIComponent(name)}&score=${result.score}&product=${encodeURIComponent(result.recommended_product)}&income=${income}&creditScore=${creditScore}&occupation=${encodeURIComponent(occupation)}`)
                  }}
                  className="w-full py-3 px-4 bg-[#028090] hover:bg-[#026d7a] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  Generate AI Outreach Script
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
