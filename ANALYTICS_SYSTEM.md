# Analytics System — Progress Trends

## 3 Core Metrics

### 1. Weekly Progress

**Definition**: How much effort was logged each day over the past 7 days.

**SQL Query**:
```sql
SELECT
  DATE(logged_at) AS day,
  SUM(amount) AS daily_total
FROM progress_logs
WHERE user_id = $1
  AND logged_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(logged_at)
ORDER BY day;
```

**Supabase SDK**:
```ts
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

const { data } = await supabase
  .from('progress_logs')
  .select('amount, logged_at')
  .eq('user_id', userId)
  .gte('logged_at', sevenDaysAgo)
  .order('logged_at')

// Aggregate in JS
const dailyTotals = data.reduce((acc, log) => {
  const day = new Date(log.logged_at).toLocaleDateString()
  acc[day] = (acc[day] || 0) + Number(log.amount)
  return acc
}, {} as Record<string, number>)
```

**Display**: Horizontal bar chart, one bar per day.

```
Mon  ████████░░░░  4.0h
Tue  ██████░░░░░░  3.0h
Wed  ░░░░░░░░░░░░  0.0h  ← gap highlighted
Thu  ████░░░░░░░░  2.0h
Fri  ██████████░░  5.0h
Sat  ██░░░░░░░░░░  1.0h
Sun  ████████████  6.0h  ← best day ⭐
```

---

### 2. Completion Rate

**Definition**: Percentage of activities that reached 100%.

**Formula**:
```
completion_rate = (completed_activities / total_activities) × 100
```

**SQL Query**:
```sql
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (
    WHERE (SELECT COALESCE(SUM(amount), 0) FROM progress_logs pl WHERE pl.activity_id = a.id) >= a.total_effort
  ) AS completed
FROM activities a
WHERE user_id = $1;
```

**Simpler approach** (in app code):
```ts
// Already have activities with progress from dashboard query
const total = activities.length
const completed = activities.filter(a => a.progress_pct >= 100).length
const rate = total > 0 ? Math.round((completed / total) * 100) : 0
```

**Display**: Single large metric + comparison text.

```
┌──────────────────────┐
│      33%             │
│  Completion Rate     │
│  1 of 3 activities   │
└──────────────────────┘
```

---

### 3. Consistency Score

**Definition**: How many of the last 7 days had at least one progress log.

**Formula**:
```
consistency = (days_with_logs / 7) × 100
```

**Calculation**:
```ts
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

const { data } = await supabase
  .from('progress_logs')
  .select('logged_at')
  .eq('user_id', userId)
  .gte('logged_at', sevenDaysAgo)

const uniqueDays = new Set(
  data.map(log => new Date(log.logged_at).toDateString())
)

const consistency = Math.round((uniqueDays.size / 7) * 100)
```

**Display**: 7 dots showing active/inactive days.

```
Consistency: 71% (5/7 days)
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 ●    ●    ○    ●    ●    ○    ●
```

---

## Dashboard Analytics Section

All three metrics combined into a single analytics bar:

```
┌─────────────────────────────────────────────────────┐
│  📊 This Week                                       │
│                                                     │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  21.0h  │  │    33%      │  │  ● ● ○ ● ● ○ ● │ │
│  │ logged  │  │ completion  │  │   71% consistent │ │
│  │ this wk │  │     rate    │  │     5/7 days     │ │
│  └─────────┘  └─────────────┘  └─────────────────┘ │
│                                                     │
│  Mon ████████   4.0h                                │
│  Tue ██████     3.0h                                │
│  Wed              —                                 │
│  Thu ████       2.0h                                │
│  Fri ██████████ 5.0h  ⭐ best day                   │
│  Sat ██         1.0h                                │
│  Sun            (today)                             │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Blueprint

### New component: `AnalyticsBar.tsx`

```ts
interface AnalyticsBarProps {
  weeklyLogs: { day: string; total: number }[]   // 7 entries
  completionRate: number                          // 0-100
  completedCount: number
  totalCount: number
  consistencyDays: boolean[]                      // [true, true, false, ...]
}
```

### Data fetching: add to `page.tsx`

```ts
// In the dashboard server component, add:
const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

const { data: weekLogs } = await supabase
  .from('progress_logs')
  .select('amount, logged_at')
  .eq('user_id', user.id)
  .gte('logged_at', sevenDaysAgo)

// Pass aggregated data to <Dashboard weeklyAnalytics={...} />
```

### No new DB tables needed
All metrics are derived from existing `progress_logs` and `activities` tables.

---

## Metric Definitions Summary

| Metric | Formula | Source | Update Frequency |
|--------|---------|--------|-----------------|
| Weekly Progress | `SUM(amount) GROUP BY day` | `progress_logs` | Every page load |
| Completion Rate | `completed / total × 100` | `activities` + `progress_logs` | Every page load |
| Consistency | `active_days / 7 × 100` | `progress_logs` | Every page load |
| Total This Week | `SUM(amount) last 7 days` | `progress_logs` | Every page load |
| Best Day | `MAX(daily_total)` | Derived from weekly | Every page load |
