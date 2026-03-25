'use client'

import { useEffect, useState } from 'react'

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
}

export default function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 12,
  label,
}: ProgressRingProps) {
  const [animatedPct, setAnimatedPct] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedPct / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPct(Math.min(percentage, 100))
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const getColor = () => {
    if (animatedPct >= 100) return '#10b981'
    if (animatedPct >= 75) return '#06b6d4'
    if (animatedPct >= 50) return '#8b5cf6'
    if (animatedPct >= 25) return '#6366f1'
    return '#64748b'
  }

  return (
    <div className="progress-ring-container">
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: getColor() }}
        />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-ring-pct">{Math.round(animatedPct)}%</span>
        {label && <span className="progress-ring-label">{label}</span>}
      </div>
    </div>
  )
}
