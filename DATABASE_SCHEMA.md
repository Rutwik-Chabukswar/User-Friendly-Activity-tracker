# Database Schema — Activity Progress Tracker

## Relationships Diagram

```
┌──────────────────┐
│   auth.users     │  (managed by Supabase Auth)
│──────────────────│
│  id        uuid  │───┐
│  email     text  │   │
│  ...             │   │
└──────────────────┘   │
                       │ 1:N
                       ▼
┌──────────────────────────────────────────────┐
│                 activities                    │
│──────────────────────────────────────────────│
│  id             uuid  PK  (auto-generated)   │
│  user_id        uuid  FK → auth.users(id)    │───┐
│  title          text  NOT NULL                │   │
│  description    text  (nullable)              │   │
│  total_effort   numeric  NOT NULL (> 0)       │   │
│  unit           text  NOT NULL  DEFAULT 'hrs' │   │
│  created_at     timestamptz  DEFAULT now()    │   │
└──────────────────────────────────────────────┘   │
                       │ 1:N                       │
                       ▼                           │
┌──────────────────────────────────────────────┐   │
│               progress_logs                   │   │
│──────────────────────────────────────────────│   │
│  id             uuid  PK  (auto-generated)   │   │
│  activity_id    uuid  FK → activities(id)    │   │
│  user_id        uuid  FK → auth.users(id)  ◄─┘  │
│  amount         numeric  NOT NULL (> 0)       │
│  note           text  (nullable)              │
│  logged_at      timestamptz  DEFAULT now()    │
└──────────────────────────────────────────────┘
```

---

## Table Schemas

### `activities`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, auto `gen_random_uuid()` | Unique identifier |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | Owner of the activity |
| `title` | `text` | NOT NULL | e.g., "Learn TypeScript" |
| `description` | `text` | nullable | Optional details |
| `total_effort` | `numeric` | NOT NULL, CHECK > 0 | Goal amount (e.g., 30) |
| `unit` | `text` | NOT NULL, DEFAULT `'hours'` | Measurement unit |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When created |

### `progress_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, auto `gen_random_uuid()` | Unique identifier |
| `activity_id` | `uuid` | FK → `activities(id)` ON DELETE CASCADE, NOT NULL | Which activity this log belongs to |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | Who logged it (for RLS) |
| `amount` | `numeric` | NOT NULL, CHECK > 0 | Effort done (e.g., 2.5) |
| `note` | `text` | nullable | Optional description |
| `logged_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When progress was logged |

---

## Example Rows

### `activities`

| id | user_id | title | description | total_effort | unit | created_at |
|----|---------|-------|-------------|-------------|------|------------|
| `a1b2c3...` | `u1...` | Learn TypeScript | Complete TS handbook | 30 | hours | 2026-03-25 |
| `d4e5f6...` | `u1...` | Read Clean Code | All 17 chapters | 17 | chapters | 2026-03-20 |
| `g7h8i9...` | `u1...` | Gym Sessions | 3x/week for 3 months | 36 | sessions | 2026-03-01 |

### `progress_logs`

| id | activity_id | user_id | amount | note | logged_at |
|----|-------------|---------|--------|------|-----------|
| `p1...` | `a1b2c3...` | `u1...` | 2.5 | Generics chapter | 2026-03-25 18:00 |
| `p2...` | `a1b2c3...` | `u1...` | 1.0 | Type narrowing | 2026-03-24 20:30 |
| `p3...` | `d4e5f6...` | `u1...` | 3 | Chapters 1-3 | 2026-03-25 09:00 |
| `p4...` | `g7h8i9...` | `u1...` | 1 | Upper body day | 2026-03-25 07:00 |

**Calculated progress** (from joining the tables):
- Learn TypeScript: 3.5 / 30 hours = **11.7%**
- Read Clean Code: 3 / 17 chapters = **17.6%**
- Gym Sessions: 1 / 36 sessions = **2.8%**

---

## Indexing Suggestions

```sql
-- Already created automatically by Supabase:
-- • PK index on activities(id)
-- • PK index on progress_logs(id)
-- • FK index on activities(user_id)   — auto-created by FK constraint

-- Recommended additions for query performance:
CREATE INDEX idx_progress_logs_activity_id ON progress_logs(activity_id);
CREATE INDEX idx_progress_logs_user_id ON progress_logs(user_id);
CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC);
```

| Index | Why |
|-------|-----|
| `idx_progress_logs_activity_id` | Fast lookup of all logs for one activity (detail page) |
| `idx_progress_logs_user_id` | RLS policy evaluation — filters by `auth.uid()` |
| `idx_activities_user_created` | Dashboard query — user's activities sorted by newest |

---

## RLS Policies (Row Level Security)

Both tables have RLS enabled. Users can only access their own data:

| Table | Operation | Policy |
|-------|-----------|--------|
| `activities` | SELECT | `auth.uid() = user_id` |
| `activities` | INSERT | `auth.uid() = user_id` |
| `activities` | UPDATE | `auth.uid() = user_id` |
| `activities` | DELETE | `auth.uid() = user_id` |
| `progress_logs` | SELECT | `auth.uid() = user_id` |
| `progress_logs` | INSERT | `auth.uid() = user_id` |
| `progress_logs` | DELETE | `auth.uid() = user_id` |

---

## Design Decisions

| Decision | Why |
|----------|-----|
| **`uuid` for PKs** | Supabase convention, works with `auth.users(id)`, no sequential leaking |
| **`numeric` for effort** | Supports decimals (2.5 hours) unlike `integer` |
| **`user_id` on `progress_logs`** | Denormalized for RLS — policies can check ownership without joining `activities` |
| **`ON DELETE CASCADE` on FKs** | Deleting a user removes their activities; deleting an activity removes its logs |
| **No `updated_at` on activities** | MVP simplicity — add later if edit functionality is needed |
| **Progress calculated at query time** | No stored `current_progress` column avoids sync bugs. Simply `SUM(amount)` from logs |
| **`unit` as free text** | Flexible for any unit type. Could be an enum later if you want strict validation |
| **`logged_at` with DEFAULT `now()`** | Auto-timestamps, but users could backdate entries if needed |
