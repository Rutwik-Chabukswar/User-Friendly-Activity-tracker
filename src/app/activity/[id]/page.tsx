import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ActivityDetail from '@/app/activity/[id]/activity-detail'
import { sumLoggedEffort, calculateProgress } from '@/lib/progress'

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!activity) {
    notFound()
  }

  const { data: logs } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('activity_id', id)
    .order('logged_at', { ascending: false })

  const safeLogs = logs || []
  const loggedEffort = sumLoggedEffort(safeLogs)
  const progress = calculateProgress(Number(activity.total_effort), loggedEffort)

  return (
    <ActivityDetail
      activity={{
        ...activity,
        total_effort: Number(activity.total_effort),
      }}
      logs={safeLogs.map((l) => ({
        ...l,
        amount: Number(l.amount),
      }))}
      progress={progress}
    />
  )
}
