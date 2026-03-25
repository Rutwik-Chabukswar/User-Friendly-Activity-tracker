'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LogProgressFormProps {
  activityId: string
  unit: string
  remaining: number
}

export default function LogProgressForm({
  activityId,
  unit,
  remaining,
}: LogProgressFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)
    const note = formData.get('note') as string

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('progress_logs').insert({
      activity_id: activityId,
      user_id: user.id,
      amount,
      note: note || null,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      const form = e.currentTarget
      form.reset()
      router.refresh()
      setTimeout(() => setSuccess(false), 2000)
    }

    setLoading(false)
  }

  return (
    <div className="log-progress-form">
      <h3>Log Progress</h3>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Progress logged! 🎉</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="log-amount">
              Amount ({unit})
              {remaining > 0 && (
                <span className="form-hint"> · {remaining} remaining</span>
              )}
            </label>
            <input
              id="log-amount"
              name="amount"
              type="number"
              min="0.1"
              step="0.1"
              placeholder={`e.g., 2`}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="log-note">Note (optional)</label>
          <input
            id="log-note"
            name="note"
            type="text"
            placeholder="What did you work on?"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Logging...' : `Log ${unit}`}
        </button>
      </form>
    </div>
  )
}
