/**
 * EWA business logic — shared with PWA but used server-side for validation
 */

/**
 * Calculate earned wage for an employee based on days worked in cycle.
 */
export function calcEarnedWage(baseSalary, daysWorked, totalDays) {
  if (!totalDays || totalDays === 0) return 0
  return (baseSalary * daysWorked) / totalDays
}

/**
 * Calculate available advance amount.
 * @param {number} earnedWage
 * @param {number} limitPct  - company EWA limit (default 50)
 * @param {number} alreadyUsed - sum of approved/processing advances this cycle
 */
export function calcAvailable(earnedWage, limitPct = 50, alreadyUsed = 0) {
  const limit = earnedWage * (limitPct / 100)
  return Math.max(0, limit - alreadyUsed)
}

/**
 * Auto-approve decision: returns true if amount is within limits.
 */
export function shouldAutoApprove({ amount, earnedWage, limitPct = 50, maxPct = 75, alreadyUsed = 0 }) {
  const available = calcAvailable(earnedWage, limitPct, alreadyUsed)
  const absoluteMax = earnedWage * (maxPct / 100)
  return amount <= available && amount <= absoluteMax && amount > 0
}

/**
 * Days worked in current cycle up to today.
 */
export function calcDaysWorked(periodStart, periodEnd, today = new Date()) {
  const start = new Date(periodStart)
  const end   = new Date(periodEnd)
  const cap   = today < end ? today : end
  const total = Math.round((end - start) / 86400000) + 1
  const worked = Math.max(0, Math.round((cap - start) / 86400000))
  return { daysWorked: worked, totalDays: total }
}
