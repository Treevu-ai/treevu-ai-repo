export default function Input({
  label,
  error,
  icon,
  suffix,
  className = '',
  containerClass = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${containerClass}`}>
      {label && (
        <label className="text-sm font-medium text-[#374151]">{label}</label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#9ca3af] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full h-10 rounded-[8px] border border-[#d1d5db]
            bg-white px-3 text-sm text-[#111827]
            placeholder:text-[#9ca3af]
            focus:outline-none focus:ring-2 focus:ring-[#000666]/20 focus:border-[#000666]
            disabled:bg-[#f9fafb] disabled:cursor-not-allowed
            transition-colors
            ${icon    ? 'pl-9'  : ''}
            ${suffix  ? 'pr-16' : ''}
            ${error   ? 'border-[#dc2626] focus:ring-[#dc2626]/20 focus:border-[#dc2626]' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-[#6b7280] font-medium">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', containerClass = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${containerClass}`}>
      {label && <label className="text-sm font-medium text-[#374151]">{label}</label>}
      <select
        className={`
          h-10 rounded-[8px] border border-[#d1d5db] bg-white
          px-3 text-sm text-[#111827]
          focus:outline-none focus:ring-2 focus:ring-[#000666]/20 focus:border-[#000666]
          transition-colors
          ${error ? 'border-[#dc2626]' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  )
}
