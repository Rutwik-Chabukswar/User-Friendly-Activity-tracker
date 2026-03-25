/**
 * Progress Calculation System — Single Source of Truth
 *
 * All progress calculations MUST go through this module.
 * Never calculate progress inline in components or pages.
 *
 * Source of truth: progress_logs table (raw log entries)
 * This module: derived calculations with precision + safety guarantees
 */

export interface ProgressResult {
  /** Percentage capped at 100.00 for display */
  progress_percentage: number
  /** Raw percentage (can exceed 100 for over-completion tracking) */
  raw_percentage: number
  /** Total effort logged so far */
  total_logged: number
  /** Remaining effort (never negative) */
  remaining_effort: number
  /** Whether the activity has reached 100% */
  is_completed: boolean
}

/**
 * Round a number to exactly 2 decimal places.
 * Uses Math.round to avoid floating-point drift.
 *
 * Examples:
 *   round2(0.1 + 0.2)  → 0.30  (not 0.30000000000000004)
 *   round2(33.33333)   → 33.33
 *   round2(100)        → 100
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Calculate progress for an activity.
 *
 * @param totalEffort  - The goal amount (e.g., 30 hours). Must be > 0.
 * @param loggedEffort - Sum of all progress log amounts. Can be 0.
 * @returns Standardized ProgressResult with all derived values.
 *
 * Guarantees:
 * - progress_percentage is always in [0, 100]
 * - remaining_effort is always >= 0
 * - All numbers are rounded to 2 decimal places
 * - Division by zero is safely handled
 */
export function calculateProgress(
  totalEffort: number,
  loggedEffort: number
): ProgressResult {
  // Guard: invalid or zero total effort
  if (!totalEffort || totalEffort <= 0) {
    return {
      progress_percentage: 0,
      raw_percentage: 0,
      total_logged: 0,
      remaining_effort: 0,
      is_completed: false,
    }
  }

  // Guard: ensure logged effort is non-negative
  const safeLogged = round2(Math.max(loggedEffort, 0))
  const safeTotal = round2(totalEffort)

  // Core calculation
  const rawPct = round2((safeLogged / safeTotal) * 100)
  const displayPct = Math.min(rawPct, 100)
  const remaining = round2(Math.max(safeTotal - safeLogged, 0))

  return {
    progress_percentage: displayPct,
    raw_percentage: rawPct,
    total_logged: safeLogged,
    remaining_effort: remaining,
    is_completed: rawPct >= 100,
  }
}

/**
 * Aggregate progress logs into total logged effort.
 * Use this when you have an array of log entries.
 *
 * @param logs - Array of objects with an `amount` field
 * @returns Rounded sum of all amounts
 */
export function sumLoggedEffort(
  logs: { amount: number | string }[]
): number {
  if (!logs || logs.length === 0) return 0

  const total = logs.reduce((sum, log) => {
    const amount = typeof log.amount === 'string' ? parseFloat(log.amount) : log.amount
    return sum + (isNaN(amount) ? 0 : Math.max(amount, 0))
  }, 0)

  return round2(total)
}

/**
 * Aggregate progress for multiple activities at once (dashboard).
 * Takes a flat array of logs and groups by activity_id.
 *
 * @param logs - Array of { activity_id, amount } from progress_logs
 * @returns Map of activity_id → total logged effort
 */
export function aggregateByActivity(
  logs: { activity_id: string; amount: number | string }[]
): Record<string, number> {
  if (!logs || logs.length === 0) return {}

  return logs.reduce((acc, log) => {
    const amount = typeof log.amount === 'string' ? parseFloat(log.amount) : log.amount
    const safeAmount = isNaN(amount) ? 0 : Math.max(amount, 0)
    acc[log.activity_id] = round2((acc[log.activity_id] || 0) + safeAmount)
    return acc
  }, {} as Record<string, number>)
}
