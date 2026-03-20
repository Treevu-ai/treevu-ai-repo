import { useToastStore } from '@/store/useToastStore'

const TYPE_STYLES = {
  success: { bg: 'bg-[var(--color-secondary)]', icon: 'check_circle' },
  error:   { bg: 'bg-[var(--color-error)]',     icon: 'error' },
  info:    { bg: 'bg-[var(--color-primary)]',   icon: 'info' },
  warning: { bg: 'bg-amber-500',                icon: 'warning' },
}

export default function ToastContainer() {
  const toasts  = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[390px] px-4 space-y-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info
        return (
          <div
            key={toast.id}
            role="alert"
            onClick={() => dismiss(toast.id)}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3.5
              rounded-[var(--radius-xl)] shadow-lg text-white text-sm font-medium
              animate-toast-in cursor-pointer
              ${style.bg}
            `}
          >
            <span
              className="material-symbols-outlined text-xl shrink-0"
              style={{ fontVariationSettings: '"FILL" 1' }}
              aria-hidden="true"
            >
              {style.icon}
            </span>
            <span className="flex-1 leading-snug">{toast.message}</span>
            <span className="material-symbols-outlined text-base opacity-70" aria-hidden="true">close</span>
          </div>
        )
      })}
    </div>
  )
}
