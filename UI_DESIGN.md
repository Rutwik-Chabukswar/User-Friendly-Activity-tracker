# UI Design — Activity Progress Tracker

## Design Philosophy

| Principle | Implementation |
|-----------|---------------|
| **Motivate** | Emoji badges, milestone messages, animated progress ring |
| **Clarity** | Progress always visible — bar on cards, ring on detail |
| **Minimal** | Dark theme reduces noise, glassmorphism creates depth without clutter |
| **Modern** | Gradient accents, smooth transitions, responsive grid |

---

## Screen 1: Dashboard

![Dashboard mockup](/Users/myaccount/.gemini/antigravity/brain/dcb458d3-4d73-4039-9b8a-91809a9b11d8/dashboard_mockup_1774463110972.png)

### Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (sticky)                             │
│  Logo + Title          Email | Sign Out     │
├─────────────────────────────────────────────┤
│ STATS BAR (3 cards in a row)                │
│  [ Activities ]  [ Completed ]  [ Avg % ]  │
├─────────────────────────────────────────────┤
│ SECTION HEADER                              │
│  "Your Activities"        [+ New Activity]  │
├─────────────────────────────────────────────┤
│ ACTIVITY GRID (auto-fill, min 320px)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Card     │  │ Card     │  │ Card     │  │
│  │ ████░░ % │  │ ██████ % │  │ █░░░░░ % │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| **Header** | `dashboard.tsx` | Logo, user email, sign out |
| **StatsBar** | `dashboard.tsx` | 3 aggregate metrics |
| **ActivityCard** | `ActivityCard.tsx` | Title, badge, progress bar, stats |
| **EmptyState** | `dashboard.tsx` | Shown when no activities exist |
| **NewActivityModal** | `NewActivityModal.tsx` | Triggered by "+ New Activity" |

### UX Decisions

- **Stats bar at top**: Gives instant overview without scrolling. User sees total, completed, and average progress immediately.
- **Cards as links**: Entire card is clickable → reduces cognitive load (no "View Details" button needed).
- **Motivational badges per card**: Each card shows a contextual emoji message based on progress tier. This is the primary motivation driver.
- **Auto-fill grid**: Cards flow naturally, 1 column on mobile → 2-3 on desktop.
- **Empty state with CTA**: When no activities exist, the empty state isn't just a message — it has a prominent "Create Activity" button.

### Motivation Tiers (on cards)

| Progress | Badge | Why |
|----------|-------|-----|
| 0% | 🎯 Get started | Invites action |
| 1-24% | ✨ Keep going! | Acknowledges effort |
| 25-49% | 🚀 Great start! | Builds momentum |
| 50-74% | 💪 Halfway done! | Major milestone |
| 75-99% | 🔥 Almost there! | Creates urgency |
| 100% | 🎉 Complete! | Celebrates |

---

## Screen 2: Create Activity (Modal)

![Create Activity mockup](/Users/myaccount/.gemini/antigravity/brain/dcb458d3-4d73-4039-9b8a-91809a9b11d8/create_activity_mockup_1774463126634.png)

### Layout Structure

```
┌─ OVERLAY (dark blur) ──────────────────┐
│                                        │
│   ┌─ MODAL CARD ──────────────────┐    │
│   │ "New Activity"           [✕]  │    │
│   │                               │    │
│   │ Title        [_______________]│    │
│   │ Description  [_______________]│    │
│   │              [_______________]│    │
│   │ Effort [___]   Unit [Hours ▾] │    │
│   │                               │    │
│   │ [████ Create Activity ████]   │    │
│   └───────────────────────────────┘    │
│                                        │
└────────────────────────────────────────┘
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| **ModalOverlay** | `NewActivityModal.tsx` | Dark backdrop, click-to-close |
| **ModalCard** | `NewActivityModal.tsx` | Form container with slide-up animation |
| **FormFields** | `NewActivityModal.tsx` | Title, description, effort, unit |
| **UnitSelector** | `NewActivityModal.tsx` | Dropdown: hours, sessions, pages, chapters, tasks |

### UX Decisions

- **Modal, not a separate page**: Keeps user in context. They can see their dashboard behind the overlay, reducing "where am I?" disorientation.
- **Click overlay to close**: Standard pattern, reduces friction.
- **Unit selector**: Predefined options prevent typos. "hours" as default covers most use cases.
- **Effort + Unit split**: Side-by-side layout saves vertical space and makes the relationship between number and unit obvious.
- **Slide-up animation**: 300ms cubic-bezier entry feels natural and premium.
- **Full-width gradient CTA**: Impossible to miss. Gradient makes it feel actionable.

---

## Screen 3: Activity Detail

![Activity Detail mockup](/Users/myaccount/.gemini/antigravity/brain/dcb458d3-4d73-4039-9b8a-91809a9b11d8/activity_detail_mockup_1774463141865.png)

### Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER                                      │
│  ← Back                    [Delete Activity]│
├──────────────────────┬──────────────────────┤
│ PROGRESS SECTION     │ INFO SECTION         │
│ (sticky on scroll)   │                      │
│                      │ ┌──────────────────┐ │
│ ┌──────────────────┐ │ │ Title            │ │
│ │                  │ │ │ Description      │ │
│ │   ╭──────╮       │ │ │ Created date     │ │
│ │   │ 65%  │       │ │ └──────────────────┘ │
│ │   ╰──────╯       │ │                      │
│ │                  │ │ ┌──────────────────┐ │
│ │ 💪 Halfway done! │ │ │ LOG PROGRESS     │ │
│ │                  │ │ │ Amount [__] Note  │ │
│ │ 19.5  10.5  30   │ │ │ [Log hours]      │ │
│ │ done  left total │ │ └──────────────────┘ │
│ └──────────────────┘ │                      │
│                      │ ┌──────────────────┐ │
│                      │ │ PROGRESS HISTORY │ │
│                      │ │ +2.5h - note  ✕  │ │
│                      │ │ +1.0h - note  ✕  │ │
│                      │ └──────────────────┘ │
└──────────────────────┴──────────────────────┘
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| **ProgressRing** | `ProgressRing.tsx` | Large animated SVG circle (180px) |
| **MilestoneBanner** | `activity-detail.tsx` | Emoji + motivational text pill |
| **DetailStats** | `activity-detail.tsx` | Three metric columns (done/left/total) |
| **InfoCard** | `activity-detail.tsx` | Title, description, created date |
| **LogProgressForm** | `LogProgressForm.tsx` | Amount input + note + submit |
| **LogList** | `activity-detail.tsx` | Chronological log entries with delete |

### UX Decisions

- **Two-column layout**: Progress visualization on left (the "reward"), actions on right (the "work"). Mirrors the motivation loop: see progress → log more → see progress grow.
- **Sticky progress panel**: As the user scrolls through their log history, the progress ring stays visible — constant visual reinforcement.
- **Large progress ring**: 180px ring is the visual centerpiece. The animated fill (1s ease) creates a satisfying moment when the page loads.
- **Color shifts by progress**: Ring color transitions from gray → indigo → purple → cyan → green as progress increases. Subtle visual reward.
- **Milestone banner**: A rounded pill below the ring with an emoji and encouraging text. Changes dynamically — user sees a new message at each tier.
- **Log form inline**: No modal — reducing friction to log progress is critical. The form is always visible and ready.
- **"Remaining" hint on form**: Shows "10.5 remaining" next to the amount field — helps users plan without mental math.
- **Delete buttons are subtle**: Small "✕" in muted gray. No accidental deletions, but still accessible.
- **Responsive collapse**: On mobile, left column stacks above right column. Progress ring still loads first.

---

## Component Summary

| Component | Type | Reusable | File |
|-----------|------|----------|------|
| ActivityCard | Client | ✅ | `components/ActivityCard.tsx` |
| ProgressRing | Client | ✅ | `components/ProgressRing.tsx` |
| NewActivityModal | Client | ✅ | `components/NewActivityModal.tsx` |
| LogProgressForm | Client | ✅ | `components/LogProgressForm.tsx` |
| Dashboard | Client | ❌ | `app/dashboard.tsx` |
| ActivityDetail | Client | ❌ | `app/activity/[id]/activity-detail.tsx` |

---

## Design Tokens (CSS Variables)

```css
--color-bg:             #0a0a0f          /* Deep dark background */
--color-bg-card:        rgba(255,255,255, 0.04)  /* Glassmorphism */
--color-accent-cyan:    #06b6d4          /* Primary accent */
--color-accent-purple:  #8b5cf6          /* Secondary accent */
--color-success:        #10b981          /* 100% completion */
--glass-blur:           blur(20px)       /* Frosted glass effect */
--radius-lg:            16px             /* Card corners */
--transition:           0.25s cubic-bezier(0.4, 0, 0.2, 1)
```

The cyan→purple gradient is used consistently for: button fills, progress bar fills, stat numbers, header title, and the progress ring percentage text. This creates a strong visual identity with just two colors.
