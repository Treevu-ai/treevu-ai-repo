import { useParams, useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/layout/PageHeader'
import { useEWAStore } from '@/store/useEWAStore'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n)
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function MovementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const transactions = useEWAStore((s) => s.transactions)
  const pendingTransfer = useEWAStore((s) => s.pendingTransfer)

  const allTx = pendingTransfer
    ? [{ ...pendingTransfer, type: 'advance', date: pendingTransfer.requestedAt, destination: pendingTransfer.wallet?.label }, ...transactions]
    : transactions

  const tx = allTx.find((t) => t.id === id)

  if (!tx) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <p className="text-[var(--color-on-surface-variant)]">Movimiento no encontrado</p>
        <button onClick={() => navigate(-1)} className="text-[var(--color-primary)] mt-4 text-sm font-medium">
          Volver
        </button>
      </div>
    )
  }

  const isCompleted = tx.status === 'completed'

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Detalle del movimiento" />

      <div className="px-4 pb-10 space-y-4">
        {/* Hero */}
        <div className="text-center py-6">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isCompleted ? 'bg-[var(--color-secondary-container)]' : 'bg-amber-50'
          }`}>
            <span className={`material-symbols-outlined text-4xl ${
              isCompleted ? 'text-[var(--color-secondary)]' : 'text-amber-500'
            }`} style={{ fontVariationSettings: '"FILL" 1' }}>
              {isCompleted ? 'check_circle' : 'pending'}
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">
            {isCompleted ? 'Adelanto completado' : 'En proceso'}
          </p>
          <span className={`font-bold ${isCompleted ? 'text-[var(--color-secondary)]' : 'text-amber-600'}`}
            style={{ fontFamily: 'var(--font-headline)', fontSize: '3rem', lineHeight: 1 }}>
            {formatCurrency(tx.amount)}
          </span>
        </div>

        {/* Details */}
        <Card className="divide-y divide-[var(--color-surface-container-low)]">
          {[
            { label: 'Tipo', value: 'Adelanto de sueldo' },
            { label: 'Fecha', value: formatDateTime(tx.date) },
            { label: 'Destino', value: tx.destination || '—' },
            tx.deductionDate && { label: 'Descuento en nómina', value: new Date(tx.deductionDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Comisión', value: 'S/ 0', green: true },
            { label: 'ID de transacción', value: tx.id, mono: true },
          ].filter(Boolean).map(({ label, value, green, mono }) => (
            <div key={label} className="flex items-start justify-between px-5 py-3.5 gap-4">
              <span className="text-sm text-[var(--color-on-surface-variant)] shrink-0">{label}</span>
              <span className={`text-sm font-medium text-right ${
                green ? 'text-[var(--color-secondary)]' :
                mono ? 'text-[var(--color-on-surface-variant)] font-mono text-xs' :
                'text-[var(--color-on-surface)]'
              }`}>
                {value}
              </span>
            </div>
          ))}
        </Card>

        <button
          onClick={() => navigate('/help')}
          className="w-full text-center text-sm text-[var(--color-primary)] font-medium py-3"
        >
          ¿Tienes algún problema con este movimiento?
        </button>
      </div>
    </div>
  )
}
