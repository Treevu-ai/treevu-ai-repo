import { NavLink } from 'react-router-dom'
import { haptics } from '@/utils/haptic'

const NAV_ITEMS = [
  { to: '/home',      icon: 'home',          label: 'Inicio' },
  { to: '/advance',   icon: 'payments',      label: 'Adelanto' },
  { to: '/history',   icon: 'receipt_long',  label: 'Historial' },
  { to: '/education', icon: 'school',        label: 'Aprende' },
  { to: '/settings',  icon: 'person',        label: 'Perfil' },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
    >
      <div className="glass-panel border-t border-[var(--color-outline-variant)]/30 px-2 pb-safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => haptics.tap()}
              aria-label={label}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[56px] transition-all duration-200
                ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-outline)]'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`
                      relative flex items-center justify-center w-14 h-7 rounded-full
                      transition-all duration-300 ease-out
                      ${isActive ? 'bg-[var(--color-primary-fixed)]' : 'bg-transparent'}
                    `}
                  >
                    <span
                      className={`material-symbols-outlined text-2xl transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                      style={{
                        fontVariationSettings: isActive
                          ? '"FILL" 1, "wght" 600, "GRAD" 0, "opsz" 24'
                          : '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24',
                      }}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] leading-none transition-all duration-200 ${
                      isActive ? 'font-semibold text-[var(--color-primary)]' : 'font-medium'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
