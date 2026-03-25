'use client'

import { useState } from 'react'
import ActivityCard from '@/components/ActivityCard'
import NewActivityModal from '@/components/NewActivityModal'

interface Activity {
  id: string
  title: string
  description: string | null
  total_effort: number
  unit: string
  logged_effort: number
  progress_pct: number
  is_completed: boolean
  remaining_effort: number
  created_at: string
}

interface DashboardProps {
  activities: Activity[]
  userEmail: string
}

export default function Dashboard({ activities, userEmail }: DashboardProps) {
  const [showModal, setShowModal] = useState(false)

  const totalActivities = activities.length
  const completedActivities = activities.filter((a) => a.is_completed).length
  const avgProgress =
    totalActivities > 0
      ? Math.round(
          activities.reduce((sum, a) => sum + a.progress_pct, 0) /
            totalActivities
        )
      : 0

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="url(#hgrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="80 33" />
              <circle cx="20" cy="20" r="8" fill="url(#hgrad)" />
              <defs>
                <linearGradient id="hgrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="header-title">Activity Tracker</h1>
        </div>
        <div className="header-right">
          <span className="header-email">{userEmail}</span>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost" type="submit">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="main-content">
        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{totalActivities}</span>
            <span className="stat-label">Activities</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{completedActivities}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{avgProgress}%</span>
            <span className="stat-label">Avg Progress</span>
          </div>
        </div>

        {/* Activity grid */}
        <div className="section-header">
          <h2>Your Activities</h2>
          <button
            className="btn btn-primary"
            id="new-activity-btn"
            onClick={() => setShowModal(true)}
          >
            + New Activity
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No activities yet</h3>
            <p>Create your first activity to start tracking progress!</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              + Create Activity
            </button>
          </div>
        ) : (
          <div className="activity-grid">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                description={activity.description}
                totalEffort={Number(activity.total_effort)}
                loggedEffort={activity.logged_effort}
                unit={activity.unit}
                progressPct={activity.progress_pct}
                isCompleted={activity.is_completed}
              />
            ))}
          </div>
        )}
      </main>

      <NewActivityModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
