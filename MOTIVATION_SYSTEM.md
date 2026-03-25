# Motivation System — Activity Progress Tracker

## How It Works

The motivation system is **trigger-based**: messages appear automatically based on progress percentage, user activity patterns, and specific events. No configuration needed — it works out of the box.

---

## 1. Progress Tier Messages (Currently Implemented)

Triggered every time progress is displayed — on dashboard cards and detail page.

| Progress | Icon | Card Badge | Detail Page Milestone |
|----------|------|------------|----------------------|
| 0% | 🎯 | Get started | Ready to begin? Log your first progress! |
| 1–24% | ✨ | Keep going! | You've started! That's the hardest part. |
| 25–49% | 🚀 | Great start! | Great momentum! Keep it up! |
| 50–74% | 💪 | Halfway done! | Halfway done! Keep pushing! |
| 75–99% | 🔥 | Almost there! | Almost there! Final stretch! |
| 100% | 🎉 | Complete! | You did it! Activity complete! |

### Where in code

```ts
// ActivityCard.tsx — short badge
const getMotivation = () => {
  if (pct >= 100) return '🎉 Complete!'
  if (pct >= 75)  return '🔥 Almost there!'
  if (pct >= 50)  return '💪 Halfway done!'
  if (pct >= 25)  return '🚀 Great start!'
  if (pct > 0)    return '✨ Keep going!'
  return '🎯 Get started'
}

// activity-detail.tsx — detailed milestone
const getMilestone = () => {
  if (pct >= 100) return { icon: '🎉', text: "You did it! Activity complete!" }
  if (pct >= 75)  return { icon: '🔥', text: "Almost there! Final stretch!" }
  // ...
}
```

---

## 2. Event-Based Messages (Enhancement)

Triggered after specific user actions. These would appear as toast notifications.

### After Logging Progress

| Condition | Message |
|-----------|---------|
| First log ever | "🌟 First step taken! Every journey starts here." |
| Crossed 25% | "🚀 Quarter way there — you're building momentum!" |
| Crossed 50% | "💪 HALFWAY! You're officially unstoppable." |
| Crossed 75% | "🔥 75%! The finish line is in sight!" |
| Hit 100% | "🎉 COMPLETE! You crushed it! Time to celebrate." |
| Logged 3+ days in a row | "🔥 3-day streak! Consistency is your superpower." |
| Biggest single log | "💥 That's your biggest session yet!" |

### After Creating Activity

| Condition | Message |
|-----------|---------|
| First activity | "🎯 Your first goal! Let's make it happen." |
| 5th activity | "📚 5 goals and counting. You're a planner!" |

### Implementation pattern

```ts
// After successful insert:
const toastMessage = getEventMessage(newPct, prevPct, streakCount)
if (toastMessage) showToast(toastMessage)

function getEventMessage(newPct: number, prevPct: number, streak: number) {
  // Milestone crossing
  if (prevPct < 50 && newPct >= 50) return "💪 HALFWAY! You're officially unstoppable."
  if (prevPct < 100 && newPct >= 100) return "🎉 COMPLETE! You crushed it!"
  // Streak
  if (streak >= 3) return `🔥 ${streak}-day streak! Consistency is your superpower.`
  return null
}
```

---

## 3. Dashboard-Level Messages (Enhancement)

Shown at the top of the dashboard based on overall user state.

| Condition | Message |
|-----------|---------|
| All activities at 0% | "Every expert was once a beginner. Pick one and start!" |
| Average > 50% | "You're ahead of the curve — keep this energy!" |
| 1+ activity complete | "You've already proven you can finish. Do it again." |
| All activities complete | "🏆 Everything done! Time to set new goals?" |
| No activity logged today | "A little progress each day adds up to big results." |
| Logged today already | "✅ You've already made progress today. Legend." |

---

## 4. Progress Bar Color Psychology

The progress bar and ring change color as progress increases — a subtle but powerful motivational cue.

| Range | Color | Emotion |
|-------|-------|---------|
| 0–24% | `#64748b` (gray) | Neutral, no pressure |
| 25–49% | `#6366f1` (indigo) | Building, engaged |
| 50–74% | `#8b5cf6` (purple) | Momentum, pride |
| 75–99% | `#06b6d4` (cyan) | Energy, urgency |
| 100% | `#10b981` (green) | Success, satisfaction |

This is already implemented in `ProgressRing.tsx` and `ActivityCard.tsx`.

---

## 5. Personalization Ideas (Future)

### Easy to implement

| Feature | How |
|---------|-----|
| **Use activity title in messages** | "You're 75% through Learn TypeScript!" |
| **Time-based greetings** | "Good morning! Ready to make progress?" based on `new Date().getHours()` |
| **Completion count** | "You've completed 3 goals this month!" from a simple `COUNT` query |

### Medium effort

| Feature | How |
|---------|-----|
| **Streak tracking** | Add `last_logged_date` to activities or calculate from `progress_logs`. Show "🔥 5-day streak" |
| **Weekly summary** | Edge function that sends email: "You logged 8 hours across 3 activities this week" |
| **Personal bests** | Track biggest single session, most productive day |

### Ambitious (post-MVP)

| Feature | How |
|---------|-----|
| **AI-generated encouragement** | Call an LLM API with context: "User is 65% through 'Learn TypeScript' and logged 2hrs today" → personalized message |
| **Social proof** | "Users who are 50% done finish 80% of the time. You're on track!" (requires analytics) |
| **Milestone rewards** | Unlock badges/achievements at 25%, 50%, 75%, 100% — displayed on a profile page |

---

## System Logic Flowchart

```
User opens page
    │
    ├─→ Dashboard?
    │     ├─ Calculate avg progress → show dashboard message
    │     └─ For each activity card → show tier badge
    │
    ├─→ Activity Detail?
    │     ├─ Calculate progress % → show milestone banner
    │     ├─ Set ring color based on tier
    │     └─ Animate ring on load
    │
    └─→ User logs progress?
          ├─ Calculate new %
          ├─ Compare to previous %
          ├─ Did we cross a milestone? (25/50/75/100)
          │     └─ YES → show celebration toast
          ├─ Check streak count
          │     └─ 3+ days → show streak message  
          └─ Refresh page → ring animates to new %
```

---

## Message Writing Guidelines

When adding new messages, follow these principles:

1. **Use "you" not "user"** — "You're crushing it!" not "The user has made progress"
2. **Be specific when possible** — "75% through Learn TypeScript!" not just "75%!"
3. **Celebrate effort, not just completion** — "You showed up today" matters
4. **Avoid negativity** — Never "You're behind" or "You haven't logged in 5 days"
5. **Keep it short** — Under 10 words for badges, under 15 for milestones
6. **Use emoji sparingly** — One per message max, at the beginning
