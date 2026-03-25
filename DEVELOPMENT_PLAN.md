# Development Plan — 7-Day MVP Sprint

> **Context**: Most of the codebase is already built. This plan maps what was done to a realistic solo-developer timeline, and covers remaining polish + deployment.

---

## Day 1: Foundation
**Focus**: Project setup + Supabase configuration

### Tasks
- [ ] Create Next.js project (`npx create-next-app@latest`)
- [ ] Install Supabase dependencies (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Create Supabase project (or restore existing one)
- [ ] Create `.env.local` with Supabase URL + publishable key
- [ ] Set up `lib/supabase/client.ts` (browser client)
- [ ] Set up `lib/supabase/server.ts` (server client)
- [ ] Set up `proxy.ts` (auth session refresh)
- [ ] Verify dev server starts with `npm run dev`

### Milestone
✅ **Next.js app runs locally, connected to Supabase**

### What works after Day 1
- `localhost:3000` loads without errors
- Supabase client can be imported without crashing

---

## Day 2: Database + Auth
**Focus**: Schema creation + login/signup flow

### Tasks
- [ ] Apply migration: `activities` table with RLS policies
- [ ] Apply migration: `progress_logs` table with RLS policies
- [ ] Verify tables in Supabase dashboard
- [ ] Build login page (`/login`) with email + password form
- [ ] Create server actions (`login()`, `signup()`)
- [ ] Create signout route handler (`/auth/signout`)
- [ ] Create email confirm handler (`/auth/confirm`)
- [ ] Test: sign up a user → check Supabase Auth dashboard

### Milestone
✅ **Full auth flow working: signup → login → protected redirect**

### What works after Day 2
- Users can sign up and log in
- Unauthenticated users are redirected to `/login`
- Database tables exist with proper security

---

## Day 3: Design System
**Focus**: CSS foundation + typography + design tokens

### Tasks
- [ ] Set up `globals.css` with CSS custom properties
- [ ] Implement dark theme (background, text, borders)
- [ ] Add glassmorphism card styles
- [ ] Create button variants (primary, ghost, danger, link)
- [ ] Create form styles (inputs, selects, textareas)
- [ ] Add alert styles (error, success)
- [ ] Import Google Font (Inter)
- [ ] Style the login page with the design system
- [ ] Test responsive breakpoints

### Milestone
✅ **Login page looks premium and polished**

### What works after Day 3
- Login page has dark theme, glassmorphism card, gradient button
- All design tokens defined and reusable
- Responsive on mobile and desktop

---

## Day 4: Dashboard
**Focus**: Activity list + stats + empty state

### Tasks
- [ ] Build `page.tsx` (server component) — fetch activities + aggregate progress
- [ ] Build `dashboard.tsx` (client component) — render UI
- [ ] Build `ActivityCard.tsx` — progress bar + motivational badge
- [ ] Implement stats bar (total activities, completed, avg progress)
- [ ] Implement empty state with CTA
- [ ] Add responsive grid layout
- [ ] Style everything with the design system

### Milestone
✅ **Dashboard shows user's activities with progress bars**

### What works after Day 4
- Authenticated users see dashboard at `/`
- Empty state shown for new users
- Activity cards render (even if just test data via Supabase dashboard)

---

## Day 5: Create Activity + Progress Logging
**Focus**: Write operations

### Tasks
- [ ] Build `NewActivityModal.tsx` — form with title, description, effort, unit
- [ ] Implement insert to Supabase + `router.refresh()`
- [ ] Build `LogProgressForm.tsx` — amount + note fields
- [ ] Implement insert to `progress_logs` + success feedback
- [ ] Test: create activity → see it on dashboard → log progress → see bar move

### Milestone
✅ **Users can create activities and log progress**

### What works after Day 5
- "+ New Activity" button opens modal, form submits correctly
- Activity appears on dashboard immediately after creation
- Progress can be logged, bar updates on next page load

---

## Day 6: Activity Detail Page
**Focus**: Detail view + progress visualization + log history

### Tasks
- [ ] Build `ProgressRing.tsx` — SVG circle with animation
- [ ] Build `activity/[id]/page.tsx` — fetch activity + logs
- [ ] Build `activity-detail.tsx` — two-column layout
- [ ] Implement milestone banner (emoji + text based on %)
- [ ] Implement progress history list
- [ ] Add delete activity functionality (with confirmation)
- [ ] Add delete individual log entries
- [ ] Style all components with design system

### Milestone
✅ **Activity detail page fully functional with progress ring**

### What works after Day 6
- Clicking a card → detail page with progress ring
- Milestone messages change based on progress tier
- Can log progress inline and see ring animate
- Can delete activities and individual log entries

---

## Day 7: Polish + Testing + Documentation
**Focus**: Bug fixes, edge cases, deployment prep

### Tasks
- [ ] Test all edge cases:
  - Empty states (no activities, no logs)
  - Over-completion (log more than total)
  - Rapid submissions (double-click protection)
  - Mobile responsiveness
- [ ] Add loading/disabled states to all buttons
- [ ] Run `npm run build` — fix any TypeScript errors
- [ ] Run Supabase security advisors — fix any warnings
- [ ] Write `README.md` with setup instructions
- [ ] Optional: add recommended DB indexes
- [ ] Optional: deploy to Vercel

### Milestone
✅ **MVP complete, tested, ready to demo or deploy**

### What works after Day 7
- All features work end-to-end without bugs
- App builds without errors
- Documentation complete for handoff or demo

---

## Progress Tracker

| Day | Focus | Status | Key Deliverable |
|-----|-------|--------|-----------------|
| 1 | Foundation | ✅ Done | App runs, Supabase connected |
| 2 | Database + Auth | ✅ Done | Login/signup works |
| 3 | Design System | ✅ Done | Premium dark theme |
| 4 | Dashboard | ✅ Done | Activity cards with progress |
| 5 | Create + Log | ✅ Done | CRUD operations work |
| 6 | Detail Page | ✅ Done | Progress ring + log history |
| 7 | Polish | 🔲 Open | Testing + deployment |

> **Current status**: Days 1-6 are complete (built in this session). Day 7 tasks remain for your final polish pass.

---

## Optional: Days 8-10 (If You Have Extra Time)

| Day | Enhancement |
|-----|-------------|
| 8 | **Streaks & Habits** — Track consecutive days of logging. Show 🔥 streak counter. |
| 9 | **Charts** — Add a simple bar chart showing daily/weekly progress over time. |
| 10 | **Export & Share** — Export progress as PDF/image. Share achievement on social media. |
