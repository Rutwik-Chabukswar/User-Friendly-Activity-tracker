# Progress Calculation System — Production Design (Refined)

## 1. Core Logic & Precision
The system now uses a standardized utility module (`src/lib/progress.ts`) for all calculations.

- **Precision**: Elevated to **2 decimal places** (from 1) for all effort and percentage values.
- **Rounding**: Uses `Math.round(value * 100) / 100` to prevent floating-point drift.
- **Single Source of Truth**: The `progress_logs` table remains the source. All percentages and remaining values are derived dynamically.

## 2. Standardized Return Object (`ProgressResult`)

All calculation paths now return a uniform interface:

```ts
interface ProgressResult {
  progress_percentage: number // Capped [0, 100]
  raw_percentage: number      // Not capped (for over-completion)
  total_logged: number        // Sum of logs (2 decimals)
  remaining_effort: number    // total - logged (min 0)
  is_completed: boolean       // raw_percentage >= 100
}
```

## 3. Capping & Safety Guards

| Field | Guard | Rationale |
|-------|-------|-----------|
| `progress_percentage` | `Math.min(val, 100)` | Prevents UI overflow |
| `remaining_effort` | `Math.max(val, 0)` | Prevents negative "hours left" |
| `total_effort` | `if (!total || total <= 0)` | Prevents Division-by-Zero errors |
| `logged_effort` | `Math.max(val, 0)` | Prevents negative progress from invalid logs |

---

## 4. Implementation Blueprint

### Function: `calculateProgress(total, logged)`

1. **Round** both inputs to 2 decimals.
2. **Calculate** `raw_percentage`.
3. **Derive** `remaining_effort` and `is_completed`.
4. **Return** the standardized object.

### Dashboard Performance

- **Aggregation**: `aggregateByActivity(logs)` groups flat log entries into a Map for O(1) lookup during activity list mapping.
- **Scale Path**: The transition to a materialized `cached_progress` column (Option B) remains the recommended path once logs exceed 1,000 per activity.

---

## 5. Summary of Refinements

- ✅ **Precision**: 2 decimal places everywhere.
- ✅ **Capping**: Logic ensures non-negative remaining effort and capped UI percentages.
- ✅ **Consistency**: Every part of the app now uses the exact same calculation logic.
- ✅ **Type Safety**: Full TypeScript interface for calculation results.
