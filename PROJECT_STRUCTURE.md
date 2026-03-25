# Project Structure Guide

## Folder Tree

```
src/
├── app/                          # Routes & Pages (Next.js App Router)
│   ├── globals.css               #   Global styles & design tokens
│   ├── layout.tsx                #   Root layout (wraps every page)
│   ├── page.tsx                  #   Home route "/" — server component, fetches data
│   ├── dashboard.tsx             #   Dashboard UI — client component, handles interactions
│   │
│   ├── login/
│   │   ├── page.tsx              #   Login/Signup form UI
│   │   └── actions.ts            #   Server Actions — login() and signup() business logic
│   │
│   ├── activity/[id]/
│   │   ├── page.tsx              #   Activity detail — server component, fetches data
│   │   └── activity-detail.tsx   #   Activity detail UI — client component
│   │
│   ├── auth/
│   │   ├── confirm/route.ts      #   API route — handles email verification redirects
│   │   └── signout/route.ts      #   API route — handles sign-out
│   │
│   └── error/page.tsx            #   Error fallback page
│
├── components/                   # Reusable UI Components (all client components)
│   ├── ActivityCard.tsx          #   Card widget for dashboard grid
│   ├── ProgressRing.tsx          #   Animated SVG circular progress
│   ├── NewActivityModal.tsx      #   Modal form — create new activity
│   └── LogProgressForm.tsx       #   Inline form — log progress entry
│
├── lib/                          # Shared Utilities & Config
│   └── supabase/
│       ├── client.ts             #   Browser Supabase client (for client components)
│       ├── server.ts             #   Server Supabase client (for server components)
│       └── proxy.ts              #   Auth session refresh logic
│
└── proxy.ts                      # Auth guard — redirects unauthenticated users

Root files:
├── .env.local                    # Supabase URL + API key (never commit this)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript settings
└── package.json                  # Dependencies & scripts
```

---

## Folder Explanations

### `app/` — Routes & Pages
Each folder inside `app/` becomes a URL route. The `page.tsx` file is what renders at that URL.

- **Convention**: `page.tsx` = route entry, `actions.ts` = server actions, `route.ts` = API handler
- **Rule**: Keep pages thin — they fetch data and delegate to components

### `components/` — Reusable UI Pieces
Pure presentation components. They receive data via **props** and never fetch data themselves.

- **Convention**: `PascalCase.tsx` (e.g., `ActivityCard.tsx`)
- **Rule**: Components render, they don't fetch. Keep them "dumb."

### `lib/` — Utilities & Configuration
Shared code used across the app. Currently holds Supabase client factories.

- **Convention**: `camelCase.ts` (e.g., `client.ts`, `server.ts`)
- **Rule**: Only put truly shared, reusable code here

---

## Where Business Logic Lives

| What | Where | Example |
|------|-------|---------|
| **Form submissions** | `actions.ts` (Server Actions) | `login()`, `signup()` |
| **Data mutations from UI** | Client component → Supabase browser client | Creating activity, logging progress |
| **Data fetching** | `page.tsx` (Server Components) | Loading activities list, activity detail |
| **Auth redirects** | `proxy.ts` | Redirect to `/login` if not authenticated |
| **Webhooks / API endpoints** | `route.ts` (Route Handlers) | Email confirmation, sign-out |

**Simple rule**: If it's a form → Server Action. If it's interactive UI → client component with Supabase browser client. If it's initial page data → server component.

---

## Where API Calls Are Handled

```
┌─────────────────────────────────────────────────────────┐
│  SERVER (runs on Node.js, secure)                       │
│                                                         │
│  page.tsx ──────── reads data via server client         │
│  actions.ts ────── writes data (form submissions)       │
│  route.ts ──────── handles redirects, webhooks          │
│  proxy.ts ──────── refreshes auth tokens                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CLIENT (runs in browser)                               │
│                                                         │
│  components/*.tsx ── writes data via browser client      │
│                      (create activity, log progress)    │
│                      then calls router.refresh()        │
└─────────────────────────────────────────────────────────┘
```

**Key pattern — the server/client split:**

```tsx
// page.tsx — SERVER: fetches data securely
export default async function Page() {
  const supabase = await createClient()       // server client
  const { data } = await supabase.from('activities').select('*')
  return <Dashboard activities={data} />      // pass to client
}

// dashboard.tsx — CLIENT: handles UI interactions
'use client'
export default function Dashboard({ activities }) {
  const [showModal, setShowModal] = useState(false)
  // interactive UI here...
}
```

---

## State Management Approach

**No external state library needed.** Next.js + React built-ins handle everything:

| State Type | How It's Managed | Example |
|-----------|-----------------|---------|
| **Server data** | Fetched in server components, passed as props | Activity list, user info |
| **UI state** | `useState` in client components | Modal open/close, loading spinners |
| **Form state** | Native HTML forms + Server Actions | Login form, create activity form |
| **Refresh after mutation** | `router.refresh()` | After creating activity, re-fetches server data |

**Why no Redux/Zustand?** For an MVP, server components already handle data fetching, and `useState` covers UI state. Adding a state library would be overengineering.

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Route pages | `page.tsx` | `app/login/page.tsx` |
| Server actions | `actions.ts` | `app/login/actions.ts` |
| API routes | `route.ts` | `app/auth/signout/route.ts` |
| React components | `PascalCase.tsx` | `components/ActivityCard.tsx` |
| Utilities | `camelCase.ts` | `lib/supabase/client.ts` |
| Client components split | `kebab-descriptive.tsx` | `activity-detail.tsx` |
| Styles | `globals.css` | Single file with CSS custom properties |
