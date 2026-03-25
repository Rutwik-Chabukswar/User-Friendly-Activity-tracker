# API Design — Activity Progress Tracker

## Architecture Note

This app uses **two patterns** for data operations, not traditional REST API routes:

| Pattern | Used For | Where |
|---------|----------|-------|
| **Supabase Client SDK** | CRUD operations | Client & server components |
| **Server Actions** | Form submissions | `actions.ts` files |

Supabase exposes a RESTful PostgREST API automatically. You call it via the SDK — no custom `/api` routes needed.

---

## Endpoint Reference

### 1. Get All Activities (with progress)

**Where**: `src/app/page.tsx` (server component)

```
SDK Call:  supabase.from('activities').select('*').eq('user_id', uid).order('created_at', { ascending: false })
Equiv:    GET /rest/v1/activities?user_id=eq.<uid>&order=created_at.desc
Auth:     Bearer token (auto-handled by SDK)
```

**Response:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "user_id": "u1...",
    "title": "Learn TypeScript",
    "description": "Complete the TS handbook",
    "total_effort": 30,
    "unit": "hours",
    "created_at": "2026-03-25T10:00:00Z"
  }
]
```

**Progress enrichment** (second query + JS aggregation):
```
SDK Call:  supabase.from('progress_logs').select('activity_id, amount').in('activity_id', [...ids])
```

**Final shape passed to UI:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "title": "Learn TypeScript",
    "description": "Complete the TS handbook",
    "total_effort": 30,
    "unit": "hours",
    "created_at": "2026-03-25T10:00:00Z",
    "logged_effort": 7.5,
    "progress_pct": 25.0
  }
]
```

---

### 2. Create Activity

**Where**: `src/components/NewActivityModal.tsx` (client component)

```
SDK Call:  supabase.from('activities').insert({ ... })
Equiv:    POST /rest/v1/activities
Auth:     Bearer token
```

**Request body:**
```json
{
  "user_id": "u1...",
  "title": "Learn TypeScript",
  "description": "Complete the TS handbook",
  "total_effort": 30,
  "unit": "hours"
}
```

**Response (success):**
```json
{
  "status": 201,
  "statusText": "Created"
}
```

**Response (error):**
```json
{
  "error": {
    "message": "new row violates check constraint \"activities_total_effort_check\"",
    "code": "23514"
  }
}
```

**Validation rules** (enforced by DB):
- `title` — required, non-empty
- `total_effort` — required, must be > 0
- `unit` — defaults to `'hours'` if omitted
- `user_id` — must match `auth.uid()` (RLS policy)

---

### 3. Add Progress Log

**Where**: `src/components/LogProgressForm.tsx` (client component)

```
SDK Call:  supabase.from('progress_logs').insert({ ... })
Equiv:    POST /rest/v1/progress_logs
Auth:     Bearer token
```

**Request body:**
```json
{
  "activity_id": "a1b2c3d4-...",
  "user_id": "u1...",
  "amount": 2.5,
  "note": "Finished generics chapter"
}
```

**Response (success):**
```json
{
  "status": 201,
  "statusText": "Created"
}
```

**Validation rules** (enforced by DB):
- `activity_id` — required, must reference existing activity
- `amount` — required, must be > 0
- `note` — optional
- `user_id` — must match `auth.uid()` (RLS policy)

---

### 4. Get Activity Detail (with logs + progress %)

**Where**: `src/app/activity/[id]/page.tsx` (server component)

**Query 1 — Activity:**
```
SDK Call:  supabase.from('activities').select('*').eq('id', id).eq('user_id', uid).single()
Equiv:    GET /rest/v1/activities?id=eq.<id>&user_id=eq.<uid>
```

**Query 2 — Logs:**
```
SDK Call:  supabase.from('progress_logs').select('*').eq('activity_id', id).order('logged_at', { ascending: false })
Equiv:    GET /rest/v1/progress_logs?activity_id=eq.<id>&order=logged_at.desc
```

**Final shape passed to UI:**
```json
{
  "activity": {
    "id": "a1b2c3d4-...",
    "title": "Learn TypeScript",
    "description": "Complete the TS handbook",
    "total_effort": 30,
    "unit": "hours",
    "created_at": "2026-03-25T10:00:00Z"
  },
  "logs": [
    {
      "id": "p1...",
      "amount": 2.5,
      "note": "Finished generics chapter",
      "logged_at": "2026-03-25T18:00:00Z"
    },
    {
      "id": "p2...",
      "amount": 1.0,
      "note": "Type narrowing",
      "logged_at": "2026-03-24T20:30:00Z"
    }
  ],
  "logged_effort": 3.5,
  "progress_pct": 11.7
}
```

---

### 5. Delete Activity

**Where**: `src/app/activity/[id]/activity-detail.tsx` (client component)

```
SDK Call:  supabase.from('activities').delete().eq('id', id)
Equiv:    DELETE /rest/v1/activities?id=eq.<id>
Auth:     Bearer token
```

**Response:** `{ "status": 200 }`

Cascades: All `progress_logs` for this activity are auto-deleted (FK `ON DELETE CASCADE`).

---

### 6. Delete Progress Log

**Where**: `src/app/activity/[id]/activity-detail.tsx` (client component)

```
SDK Call:  supabase.from('progress_logs').delete().eq('id', logId)
Equiv:    DELETE /rest/v1/progress_logs?id=eq.<id>
Auth:     Bearer token
```

**Response:** `{ "status": 200 }`

---

### 7. Auth — Login

**Where**: `src/app/login/actions.ts` (server action)

```
SDK Call:  supabase.auth.signInWithPassword({ email, password })
Equiv:    POST /auth/v1/token?grant_type=password
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (success):**
```json
{
  "user": { "id": "u1...", "email": "user@example.com" },
  "session": { "access_token": "eyJ...", "refresh_token": "..." }
}
```

---

### 8. Auth — Signup

**Where**: `src/app/login/actions.ts` (server action)

```
SDK Call:  supabase.auth.signUp({ email, password })
Equiv:    POST /auth/v1/signup
```

**Request/Response:** Same shape as login. On success, user receives confirmation email.

---

## Summary Table

| # | Operation | Method | SDK Call | Auth |
|---|-----------|--------|----------|------|
| 1 | List activities | SELECT | `from('activities').select()` | RLS: user_id |
| 2 | Create activity | INSERT | `from('activities').insert()` | RLS: user_id |
| 3 | Log progress | INSERT | `from('progress_logs').insert()` | RLS: user_id |
| 4 | Activity detail | SELECT | `from('activities').select().single()` | RLS: user_id |
| 5 | Delete activity | DELETE | `from('activities').delete()` | RLS: user_id |
| 6 | Delete log | DELETE | `from('progress_logs').delete()` | RLS: user_id |
| 7 | Login | Auth | `auth.signInWithPassword()` | Public |
| 8 | Signup | Auth | `auth.signUp()` | Public |

> **Why no `/api` routes?** Supabase auto-generates a REST API from your schema. The SDK wraps it with type safety and auth handling. Custom API routes add complexity without benefit for CRUD operations.
