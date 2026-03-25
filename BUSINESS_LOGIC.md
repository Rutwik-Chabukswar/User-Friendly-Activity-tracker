# Progress Calculation Logic — Production Standard

## 1. Single Source of Truth
The **Progress System** is a derived calculation engine. It treats the `progress_logs` table (raw entries) as the ultimate source of truth.

- **Storage**: Never store `progress_pct` or `remaining_effort` in the database for the MVP.
- **Computation**: All calculations are performed on-the-fly using the `src/lib/progress.ts` utility.

## 2. Core Formula

```ts
raw_percentage = (sum_of_logs / total_effort) * 100
```

### Refined Attributes:
- **Precision**: All monetary/effort values are rounded to exactly **2 decimal places** to prevent floating-point drift.
- **Capping**: `progress_percentage` is capped at **100.00%** for the UI, but `raw_percentage` is preserved to track over-achievement.
- **Safety**: Division-by-zero (if `total_effort` is 0) returns 0% immediately.
- **Non-Negative**: `remaining_effort` is guaranteed to never drop below **0.00**, even if logs exceed the goal.

## 3. Standardized Return Object

Every calculation returns a `ProgressResult` object:

| Field | Type | Description |
|-------|------|-------------|
| `progress_percentage` | `number` | 0.00 to 100.00 (Standard UI value) |
| `raw_percentage` | `number` | Actual % (can be > 100.00) |
| `total_logged` | `number` | Sum of all log amounts (2 decimals) |
| `remaining_effort` | `number` | `total_effort - total_logged` (min 0) |
| `is_completed` | `boolean` | `true` if `raw_percentage >= 100` |

## 4. Edge Case Matrix

| Scenario | Logic | Result |
|----------|-------|--------|
| **Goal changed** | Recalculate based on new `total_effort` | Correct % automatically |
| **Logs deleted** | Recalculate based on remaining `progress_logs` | Correct % automatically |
| **Negative input** | Rejected at API/DB level (`CHECK > 0`) | Data stays valid |
| **Over-logging** | Progress caps at 100%, Remaining caps at 0 | Correct UI state |

## 5. Implementation

All logic is encapsulated in `src/lib/progress.ts`.

```ts
import { calculateProgress } from '@/lib/progress';

const stats = calculateProgress(activity.total_effort, sum(logs));
// stats.progress_percentage
// stats.remaining_effort
// stats.is_completed
```
