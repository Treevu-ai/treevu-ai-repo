import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import PulseBar from '@/components/ui/PulseBar'
import Button from '@/components/ui/Button'
import { useEWAStore } from '@/store/useEWAStore'
import { useAuthStore } from '@/store/useAuthStore'

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
}

export default function Home() {
  const navigate = useNavigate()
  const employee = useEWAStore((s) => s.employee)
  const transactions = useEWAStore((s) => s.transactions)
  const user = useAuthStore((s) => s.user)

  const progress = (employee.daysWorked / employee.totalDays) * 100
  const recentTx = transactions.slice(0, 3)

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      {/* ── Header ── */}
      <div className="editorial-gradient px-6 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[var(--color-secondary)]/10" />

        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Buenos días</p>
              <h1
                className="text-white font-bold text-xl mt-0.5"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {employee.name.split(' ')[0]} 👋
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/notifications')}
                className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative"
              >
                <span className="material-symbols-outlined text-white text-xl">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-secondary-fixed)] rounded-full" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-white text-xl">person</span>
              </button>
            </div>
          </div>

          {/* Earned wage hero */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
              Sueldo devengado
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="text-white font-bold"
                style={{ fontFamily: 'var(--font-headline)', fontSize: '3rem', lineHeight: 1 }}
              >
                {formatCurrency(employee.earnedWage)}
              </span>
            </div>
            <p className="text-white/60 text-xs mb-4">
              de {formatCurrency(employee.baseSalary)} · {employee.daysWorked} de {employee.totalDays} días
            </p>
            <PulseBar
              value={employee.daysWorked}
              max={employee.totalDays}
              label="Progreso del mes"
              sublabel={`Pago: ${formatDate(employee.nextPayday)}`}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 py-4 space-y-4">

        {/* Available advance card */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">
                Disponible ahora
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-bold text-[var(--color-secondary)]"
                  style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', lineHeight: 1 }}
                >
                  {formatCurrency(employee.availableAdvance)}
                </span>
              </div>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                Máximo: {formatCurrency(employee.maxAdvance)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-secondary-container)] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[var(--color-secondary)] text-2xl"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                payments
              </span>
            </div>
          </div>
          <Button onClick={() => navigate('/advance')}>
            Solicitar adelanto
          </Button>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-fixed)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-lg"
                style={{ fontVariationSettings: '"FILL" 1' }}>
                trending_up
              </span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)]">Adelantos este mes</p>
            <p className="font-bold text-xl text-[var(--color-on-surface)] mt-0.5"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {employee.advanceCount}
            </p>
          </Card>
          <Card className="p-4" onClick={() => navigate('/education')}>
            <div className="w-9 h-9 rounded-xl bg-[var(--color-tertiary-container)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[var(--color-on-tertiary-container)] text-lg"
                style={{ fontVariationSettings: '"FILL" 1' }}>
                school
              </span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)]">Educación financiera</p>
            <p className="font-bold text-sm text-[var(--color-on-tertiary-container)] mt-0.5">
              Ver lecciones →
            </p>
          </Card>
        </div>

        {/* Recent transactions */}
        {recentTx.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-3">
              <h2 className="font-semibold text-[var(--color-on-surface)] text-sm"
                style={{ fontFamily: 'var(--font-headline)' }}>
                Movimientos recientes
              </h2>
              <button
                onClick={() => navigate('/history')}
                className="text-[var(--color-primary)] text-xs font-medium"
              >
                Ver todos
              </button>
            </div>
            <Card className="divide-y divide-[var(--color-surface-container-low)]">
              {recentTx.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => navigate(`/history/${tx.id}`)}
                  className="w-full flex items-center gap-3 p-4 active:bg-[var(--color-surface-container-low)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary-container)] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[var(--color-secondary)] text-lg"
                      style={{ fontVariationSettings: '"FILL" 1' }}>
                      payments
                    </span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">
                      Adelanto de sueldo
                    </p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                      {formatDate(tx.date)} · {tx.destination}
                    </p>
                  </div>
                  <span className="text-[var(--color-secondary)] font-semibold text-sm shrink-0">
                    +{formatCurrency(tx.amount)}
                  </span>
                </button>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
