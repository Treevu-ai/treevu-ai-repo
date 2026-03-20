import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, prefix, suffix, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-[var(--color-on-surface-variant)] text-sm font-medium select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full h-14 rounded-[var(--radius-xl)] px-4
            bg-[var(--color-surface-container-high)]
            text-[var(--color-on-surface)] text-[15px] font-medium
            placeholder:text-[var(--color-outline)]
            focus:outline-none focus:bg-[var(--color-surface-container-lowest)]
            focus:ring-1 focus:ring-[rgba(0,6,102,0.2)]
            transition-all duration-150
            ${prefix ? 'pl-10' : ''}
            ${suffix ? 'pr-12' : ''}
            ${error ? 'ring-1 ring-[var(--color-error)]' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 text-[var(--color-on-surface-variant)]">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-[var(--color-error)] px-1">{error}</p>
      )}
    </div>
  )
})

export default Input
