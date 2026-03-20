export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-surface-container-high)] rounded-[var(--radius)] ${className}`}
    />
  )
}
