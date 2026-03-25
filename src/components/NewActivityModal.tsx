'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NewActivityModalProps {
  open: boolean
  onClose: () => void
}

export default function NewActivityModal({ open, onClose }: NewActivityModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const totalEffort = parseFloat(formData.get('totalEffort') as string)
    const unit = formData.get('unit') as string

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('activities').insert({
      user_id: user.id,
      title,
      description: description || null,
      total_effort: totalEffort,
      unit,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Activity</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="activity-title">Title</label>
            <input
              id="activity-title"
              name="title"
              type="text"
              placeholder="e.g., Learn TypeScript"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="activity-description">Description (optional)</label>
            <textarea
              id="activity-description"
              name="description"
              placeholder="What are you working towards?"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="activity-effort">Total Effort</label>
              <input
                id="activity-effort"
                name="totalEffort"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="30"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="activity-unit">Unit</label>
              <select id="activity-unit" name="unit" defaultValue="hours">
                <option value="hours">Hours</option>
                <option value="sessions">Sessions</option>
                <option value="pages">Pages</option>
                <option value="chapters">Chapters</option>
                <option value="tasks">Tasks</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Activity'}
          </button>
        </form>
      </div>
    </div>
  )
}
