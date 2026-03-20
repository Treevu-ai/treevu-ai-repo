const variants = {
  primary:
    'editorial-gradient text-white font-semibold shadow-ambient active:opacity-90',
  secondary:
    'bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)] font-semibold active:opacity-90',
  tertiary:
    'bg-transparent text-[var(--color-primary)] font-semibold active:opacity-70',
  danger:
    'bg-[var(--color-error-container)] text-[var(--color-on-error-container)] font-semibold active:opacity-90',
  ghost:
    'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-medium active:opacity-80',
}

const sizes = {
  sm: 'h-10 px-4 text-sm rounded-[var(--radius-lg)]',
  md: 'h-12 px-6 text-sm rounded-[var(--radius-xl)]',
  lg: 'h-14 px-8 text-base rounded-[var(--radius-xl)]',
  full: 'h-14 w-full text-base rounded-[var(--radius-xl)]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'full',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="material-symbols-outlined text-xl">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
