const variants = {
  primary:   'bg-[#000666] text-white hover:bg-[#0008aa] active:bg-[#00044d]',
  secondary: 'bg-white text-[#000666] border border-[#000666] hover:bg-[#eef0ff]',
  ghost:     'bg-transparent text-[#4b5563] hover:bg-[#f1f3f7]',
  danger:    'bg-[#dc2626] text-white hover:bg-[#b91c1c]',
  success:   'bg-[#16a34a] text-white hover:bg-[#15803d]',
}

const sizes = {
  sm:  'h-8  px-3 text-sm  gap-1.5 rounded-[6px]',
  md:  'h-9  px-4 text-sm  gap-2   rounded-[8px]',
  lg:  'h-11 px-5 text-base gap-2  rounded-[10px]',
  icon:'h-9  w-9  rounded-[8px] justify-center',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center font-medium
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
        : icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>
      }
      {children}
    </button>
  )
}
