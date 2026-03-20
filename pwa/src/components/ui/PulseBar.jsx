// Signature component: the "Pulse" progress bar for Earned Wage Access
export default function PulseBar({ value = 0, max = 100, label, sublabel }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="flex flex-col gap-2">
      {(label || sublabel) && (
        <div className="flex items-baseline justify-between">
          {label && (
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-xs text-[var(--color-secondary)] font-semibold">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <div className="h-3 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-secondary)] pulse-glow transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
