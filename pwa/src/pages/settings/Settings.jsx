import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/layout/PageHeader'
import { useAuthStore } from '@/store/useAuthStore'
import { useEWAStore } from '@/store/useEWAStore'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n)
}

const MENU_SECTIONS = [
  {
    title: 'Cuenta',
    items: [
      { icon: 'account_balance_wallet', label: 'Mis cuentas y billeteras', to: '/accounts' },
      { icon: 'notifications', label: 'Notificaciones', to: '/notifications' },
    ],
  },
  {
    title: 'Seguridad',
    items: [
      { icon: 'lock', label: 'Cambiar PIN', to: '/pin/create' },
      { icon: 'fingerprint', label: 'Seguridad biométrica', to: '#' },
    ],
  },
  {
    title: 'Información',
    items: [
      { icon: 'help', label: 'Ayuda y soporte', to: '/help' },
      { icon: 'description', label: 'Términos y condiciones', to: '/terms' },
      { icon: 'feedback', label: 'Feedback del piloto', to: '/feedback' },
    ],
  },
]

export default function Settings() {
  const navigate = useNavigate()
  const employee = useEWAStore((s) => s.employee)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Mi perfil" back={false} />

      <div className="px-4 pb-safe space-y-5">
        {/* Profile card */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl editorial-gradient flex items-center justify-center text-white text-2xl font-bold"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="font-bold text-lg text-[var(--color-on-surface)]"
                style={{ fontFamily: 'var(--font-headline)' }}>
                {employee.name}
              </h2>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{employee.company}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
                <span className="text-xs text-[var(--color-secondary)] font-medium">Activo</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-primary)]"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {employee.daysWorked}
            </p>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">días trabajados</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-secondary)]"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {formatCurrency(employee.availableAdvance)}
            </p>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">disponible</p>
          </Card>
        </div>

        {/* Menu */}
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] px-1">
              {section.title}
            </p>
            <Card className="divide-y divide-[var(--color-surface-container-low)]">
              {section.items.map(({ icon, label, to }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 p-4 active:bg-[var(--color-surface-container-low)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container-low)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] text-lg">
                      {icon}
                    </span>
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-[var(--color-on-surface)]">
                    {label}
                  </span>
                  <span className="material-symbols-outlined text-[var(--color-outline)] text-xl">
                    chevron_right
                  </span>
                </button>
              ))}
            </Card>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }) }}
          className="w-full flex items-center justify-center gap-2 p-4 text-[var(--color-error)] font-medium text-sm"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
