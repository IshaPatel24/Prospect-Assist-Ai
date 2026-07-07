import React from 'react'
import { Flame, Thermometer, Snowflake } from 'lucide-react'

export default function ScoreBadge({ score }) {
  if (score >= 80) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
      <Flame size={11} /> {score} Hot
    </span>
  )
  if (score >= 60) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
      <Thermometer size={11} /> {score} Warm
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
      <Snowflake size={11} /> {score} Cold
    </span>
  )
}
