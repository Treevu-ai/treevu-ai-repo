/**
 * EWA business logic — shared with dashboard
 */

export function calcEarnedWage(baseSalary, daysWorked, totalDays) {
  if (!totalDays || totalDays === 0) return 0
  return (baseSalary * daysWorked) / totalDays
}

export function calcAvailable(earnedWage, limitPct = 50, alreadyUsed = 0) {
  const limit = earnedWage * (limitPct / 100)
  return Math.max(0, limit - alreadyUsed)
}

export function calcDaysWorked(periodStart, periodEnd, today = new Date()) {
  const start = new Date(periodStart)
  const end   = new Date(periodEnd)
  const cap   = today < end ? today : end
  const total = Math.round((end - start) / 86400000) + 1
  const worked = Math.max(0, Math.round((cap - start) / 86400000))
  return { daysWorked: worked, totalDays: total }
}
