/** Format currency — default PEN */
export function currency(amount, curr = 'PEN') {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 2,
  }).format(amount ?? 0)
}

/** Short date: 15 mar 2026 */
export function dateShort(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/** Date + time: 15 mar 2026, 14:32 */
export function dateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Relative time: "hace 3 min" */
export function relativeTime(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)   return 'ahora'
  if (min < 60)  return `hace ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24)  return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

/** Initials from full name */
export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

/** Capitalize first letter */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
