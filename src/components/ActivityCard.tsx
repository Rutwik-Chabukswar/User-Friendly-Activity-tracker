'use client'

import Link from 'next/link'

interface ActivityCardProps {
  id: string
  title: string
  description: string | null
  totalEffort: number
  loggedEffort: number
  unit: string
  progressPct: number
  isCompleted: boolean
}

export default function ActivityCard({
  id,
  title,
  description,
  totalEffort,
  loggedEffort,
  unit,
  progressPct,
  isCompleted,
}: ActivityCardProps) {
  const getMotivation = () => {
    if (isCompleted) return '🎉 Complete!'
    if (progressPct >= 75) return '🔥 Almost there!'
    if (progressPct >= 50) return '💪 Halfway done!'
    if (progressPct >= 25) return '🚀 Great start!'
    if (progressPct > 0) return '✨ Keep going!'
    return '🎯 Get started'
  }

  const getBarColor = () => {
    if (isCompleted) return 'var(--color-success)'
    if (progressPct >= 75) return 'var(--color-accent-cyan)'
    if (progressPct >= 50) return 'var(--color-accent-purple)'
    return 'var(--color-accent-indigo)'
  }

  return (
    <Link href={`/activity/${id}`} className="activity-card" id={`activity-${id}`}>
      <div className="activity-card-header">
        <h3 className="activity-card-title">{title}</h3>
        <span className="activity-card-badge">{getMotivation()}</span>
      </div>

      {description && (
        <p className="activity-card-desc">{description}</p>
      )}

      <div className="activity-card-progress">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPct}%`,
              background: getBarColor(),
            }}
          />
        </div>
        <div className="progress-stats">
          <span className="progress-pct">{Math.round(progressPct)}%</span>
          <span className="progress-detail">
            {loggedEffort} / {totalEffort} {unit}
          </span>
        </div>
      </div>
    </Link>
  )
}
