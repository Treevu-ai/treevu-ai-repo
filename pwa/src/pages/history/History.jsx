import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import PulseBar from '@/components/ui/PulseBar'
import PageHeader from '@/components/layout/PageHeader'
import { useEWAStore } from '@/store/useEWAStore'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusMap = {
  completed: { label: 'Completado', color: 'text-[var(--color-secondary)]', bg: 'bg-[var(--color-secondary-container)]' },
  processing: { label: 'En proceso', color: 'text-amber-600', bg: 'bg-amber-50' },
  pending: { label: 'Pendiente', color: 'text-[var(--color-outline)]', bg: 'bg-[var(--color-surface-container-high)]' },
}

export default function History() {
  const navigate = useNavigate()
  const employee = useEWAStore((s) => s.employee)
  const transactions = useEWAStore((s) => s.transactions)
  const pendingTransfer = useEWAStore((s) => s.pendingTransfer)

  const allTx = pendingTransfer
    ? [{ ...pendingTransfer, type: 'advance', date: pendingTransfer.requestedAt, destination: pendingTransfer.wallet?.label }, ...transactions]
    : transactions

  const totalAdvanced = transactions.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Historial y Bienestar" back={false} />

      <div className="px-4 pb-safe space-y-4">
        {/* Wellness summary */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Salud financiera
              </p>
              <p className="font-bold text-2xl text-[var(--color-on-surface)] mt-0.5"
                style={{ fontFamily: 'var(--font-headline)' }}>
                Buena 💚
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-on-surface-variant)]">Adelantado este mes</p>
              <p className="font-bold text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-headline)' }}>
                {formatCurrency(totalAdvanced)}
              </p>
            </div>
          </div>
          <PulseBar
            value={employee.daysWorked}
            max={employee.totalDays}
            label="Ciclo actual"
            sublabel={`${employee.daysWorked}/${employee.totalDays} días`}
          />
        </Card>

        {/* Transactions list */}
        <div>
          <h2 className="font-semibold text-[var(--color-on-surface)] text-sm px-1 mb-3"
            style={{ fontFamily: 'var(--font-headline)' }}>
            Todos los movimientos
          </h2>

          {allTx.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-on-surface-variant)]">
              <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">receipt_long</span>
              <p className="text-sm">Aún no tienes movimientos</p>
            </div>
          ) : (
            <Card className="divide-y divide-[var(--color-surface-container-low)]">
              {allTx.map((tx) => {
                const s = statusMap[tx.status] || statusMap.completed
                return (
                  <button
                    key={tx.id}
                    onClick={() => navigate(`/history/${tx.id}`)}
                    className="w-full flex items-center gap-3 p-4 active:bg-[var(--color-surface-container-low)] transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                      <span className={`material-symbols-outlined text-lg ${s.color}`}
                        style={{ fontVariationSettings: '"FILL" 1' }}>
                        payments
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">
                        Adelanto de sueldo
                      </p>
                      <p className="text-xs text-[var(--color-on-surface-variant)]">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${s.color}`}>
                        +{formatCurrency(tx.amount)}
                      </p>
                      <span className={`text-[10px] font-medium ${s.color}`}>
                        {s.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
