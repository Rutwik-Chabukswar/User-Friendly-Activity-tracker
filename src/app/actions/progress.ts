'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateProgress } from '@/lib/progress'
import { createHash } from 'crypto'

interface LogProgressResponse {
  success: boolean
  error?: string
}

/**
 * Server Action: Log Progress for an activity
 * Features:
 * 1. Strict Over-logging prevention
 * 2. Deterministic 5-second bucket idempotency hashing
 * 3. Atomic database insertion
 */
export async function logProgress(
  activityId: string,
  amount: number,
  note?: string
): Promise<LogProgressResponse> {
  const supabase = await createClient()

  // 1. Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Authorization required.' }
  }

  // 2. Generate Idempotency Hash (5-second window, exclude note)
  const window = Math.floor(Date.now() / 5000)
  const hashSource = `${user.id}:${activityId}:${amount}:${window}`
  const dedupeHash = createHash('sha256').update(hashSource).digest('hex')

  try {
    // 3. Strict Check: Fetch current state
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('total_effort')
      .eq('id', activityId)
      .eq('user_id', user.id)
      .single()

    if (activityError || !activity) {
      return { success: false, error: 'Activity not found or permission denied.' }
    }

    const { data: logs } = await supabase
      .from('progress_logs')
      .select('amount')
      .eq('activity_id', activityId)

    const totalEffort = Number(activity.total_effort)
    const currentLogged = (logs || []).reduce((sum, log) => sum + Number(log.amount), 0)
    const stats = calculateProgress(totalEffort, currentLogged)

    // 4. Validate limit
    if (amount > stats.remaining_effort) {
      return {
        success: false,
        error: `Cannot log ${amount}. Only ${stats.remaining_effort} remaining.`,
      }
    }

    // 5. Atomic Insertion with Dedupe Hash
    const { error: insertError } = await supabase.from('progress_logs').insert({
      activity_id: activityId,
      user_id: user.id,
      amount,
      note: note || null,
      dedupe_hash: dedupeHash,
    })

    if (insertError) {
      // Check for Postgres Unique Violation (23505)
      if (insertError.code === '23505') {
        return {
          success: true, // Success because the previous attempt succeeded
          error: 'Duplicate request trapped. State preserved.',
        }
      }
      throw insertError
    }

    revalidatePath('/')
    revalidatePath(`/activity/${activityId}`)
    return { success: true }
  } catch (err: any) {
    console.error('Logging error:', err)
    return { success: false, error: 'An unexpected error occurred while logging progress.' }
  }
}
