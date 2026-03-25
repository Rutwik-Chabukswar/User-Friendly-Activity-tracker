import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Dashboard from '@/app/dashboard'
import { aggregateByActivity, calculateProgress } from '@/lib/progress'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get progress for all activities
  const activityIds = (activities || []).map((a) => a.id)
  let progressMap: Record<string, number> = {}

  if (activityIds.length > 0) {
    const { data: logs } = await supabase
      .from('progress_logs')
      .select('activity_id, amount')
      .in('activity_id', activityIds)

    if (logs) {
      progressMap = aggregateByActivity(logs)
    }
  }

  const activitiesWithProgress = (activities || []).map((a) => {
    const loggedEffort = progressMap[a.id] || 0
    const progress = calculateProgress(Number(a.total_effort), loggedEffort)
    
    return {
      ...a,
      logged_effort: progress.total_logged,
      progress_pct: progress.progress_percentage,
      is_completed: progress.is_completed,
      remaining_effort: progress.remaining_effort
    }
  })

  return <Dashboard activities={activitiesWithProgress} userEmail={user.email || ''} />
}
