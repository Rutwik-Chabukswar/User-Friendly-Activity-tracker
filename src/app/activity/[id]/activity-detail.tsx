'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProgressRing from '@/components/ProgressRing'
import LogProgressForm from '@/components/LogProgressForm'
import { createClient } from '@/lib/supabase/client'

import { ProgressResult } from '@/lib/progress'

interface Activity {
  id: string
  title: string
  description: string | null
  total_effort: number
  unit: string
  created_at: string
}

interface ProgressLog {
  id: string
  amount: number
  note: string | null
  logged_at: string
}

interface ActivityDetailProps {
  activity: Activity
  logs: ProgressLog[]
  progress: ProgressResult
}

export default function ActivityDetail({
  activity,
  logs,
  progress,
}: ActivityDetailProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const { progress_percentage, total_logged, remaining_effort } = progress

  const getMilestone = () => {
    if (progress_percentage >= 100) return { icon: '🎉', text: "You did it! Activity complete!" }
    if (progress_percentage >= 75) return { icon: '🔥', text: "Almost there! Final stretch!" }
    if (progress_percentage >= 50) return { icon: '💪', text: "Halfway done! Keep pushing!" }
    if (progress_percentage >= 25) return { icon: '🚀', text: "Great momentum! Keep it up!" }
    if (progress_percentage > 0) return { icon: '✨', text: "You've started! That's the hardest part." }
    return { icon: '🎯', text: "Ready to begin? Log your first progress!" }
  }

  const milestone = getMilestone()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity? All progress will be lost.')) return
    setDeleting(true)

    const supabase = createClient()
    await supabase.from('activities').delete().eq('id', activity.id)
    router.push('/')
    router.refresh()
  }

  const handleDeleteLog = async (logId: string) => {
    const supabase = createClient()
    await supabase.from('progress_logs').delete().eq('id', logId)
    router.refresh()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <Link href="/" className="back-link">
            ← Back
          </Link>
        </div>
        <div className="header-right">
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Activity'}
          </button>
        </div>
      </header>

      <main className="main-content detail-layout">
        {/* Progress section */}
        <div className="detail-progress-section">
          <div className="detail-progress-card glass-card">
            <ProgressRing percentage={progress_percentage} size={180} strokeWidth={14} />
            <div className="milestone-banner">
              <span className="milestone-icon">{milestone.icon}</span>
              <span className="milestone-text">{milestone.text}</span>
            </div>
            <div className="detail-stats">
              <div className="detail-stat">
                <span className="detail-stat-value">{total_logged}</span>
                <span className="detail-stat-label">{activity.unit} done</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-value">{remaining_effort}</span>
                <span className="detail-stat-label">{activity.unit} left</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-value">{activity.total_effort}</span>
                <span className="detail-stat-label">total {activity.unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail & Log section */}
        <div className="detail-info-section">
          <div className="glass-card">
            <h2>{activity.title}</h2>
            {activity.description && (
              <p className="detail-description">{activity.description}</p>
            )}
            <p className="detail-created">
              Created {formatDate(activity.created_at)}
            </p>
          </div>

          <LogProgressForm
            activityId={activity.id}
            unit={activity.unit}
            remaining={remaining_effort}
          />

          {/* Log history */}
          <div className="glass-card">
            <h3>Progress History</h3>
            {logs.length === 0 ? (
              <p className="empty-logs">No progress logged yet.</p>
            ) : (
              <ul className="log-list">
                {logs.map((log) => (
                  <li key={log.id} className="log-item">
                    <div className="log-info">
                      <span className="log-amount">
                        +{log.amount} {activity.unit}
                      </span>
                      {log.note && <span className="log-note">{log.note}</span>}
                      <span className="log-date">{formatDate(log.logged_at)}</span>
                    </div>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteLog(log.id)}
                      aria-label="Delete log"
                      title="Delete log"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
