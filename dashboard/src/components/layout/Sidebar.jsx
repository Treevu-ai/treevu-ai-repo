import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../ui/Toast'

const NAV = [
  { to: '/',            icon: 'dashboard',     label: 'Resumen'    },
  { to: '/employees',   icon: 'group',         label: 'Empleados'  },
  { to: '/advances',     icon: 'payments',      label: 'Avances'        },
  { to: '/predictions',  icon: 'psychology',    label: 'Predicciones'   },
  { to: '/settings',     icon: 'settings',      label: 'Configuración'  },
]

export default function Sidebar() {
  const { company, employerUser, logout } = useAuthStore()
  const { show } = useToast()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
    show({ message: 'Sesión cerrada', type: 'info' })
  }

  return (
    <aside className="w-[240px] h-screen bg-[#000666] flex flex-col shrink-0 fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center shrink-0">
            <span className="text-[#000666] font-display font-bold text-sm">T</span>
          </div>
          <div>
            <p className="text-white font-display font-bold text-sm leading-tight">Treevü</p>
            <p className="text-white/50 text-[10px] font-medium">Dashboard Empleador</p>
          </div>
        </div>
      </div>

      {/* Company */}
      {company && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-[10px] bg-white/8">
          <p className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Empresa</p>
          <p className="text-white text-sm font-semibold truncate mt-0.5">{company.name}</p>
          <p className="text-white/50 text-[11px]">RUC {company.ruc}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
              transition-colors duration-150
              ${isActive
                ? 'bg-white text-[#000666]'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'icon-filled' : ''}`}>
                  {icon}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-white/10 mt-auto">
        {employerUser && (
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {employerUser.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{employerUser.name}</p>
              <p className="text-white/50 text-[10px] capitalize">{employerUser.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-white/60 hover:bg-white/10 hover:text-white text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
