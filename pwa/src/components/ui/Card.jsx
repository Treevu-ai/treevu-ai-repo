export default function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--color-surface-container-lowest)]
        rounded-[var(--radius-xl)]
        shadow-ambient
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
