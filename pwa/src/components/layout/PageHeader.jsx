import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, back = true, action }) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center gap-3 px-5 pt-14 pb-4">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[var(--color-surface-container-low)] flex items-center justify-center active:scale-95 transition-transform shrink-0"
        >
          <span className="material-symbols-outlined text-xl text-[var(--color-on-surface)]">
            arrow_back
          </span>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1
          className="font-headline font-bold text-xl text-[var(--color-on-surface)] truncate"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
