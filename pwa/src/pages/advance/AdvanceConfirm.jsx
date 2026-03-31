import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { useEWAStore } from '@/store/useEWAStore'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n)
}

function getPaybackDate() {
  const today = new Date()
  const day = today.getDate()
  const nextQuincena = day <= 15
    ? new Date(today.getFullYear(), today.getMonth(), 15)
    : new Date(today.getFullYear(), today.getMonth() + 1, 1)
  return nextQuincena.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
}

function AdvanceSteps({ current }) {
  const steps = ['Monto', 'Confirmar', 'Listo']
  return (
    <div className="flex items-center justify-center px-6 py-3">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${done ? 'bg-[var(--color-secondary)] text-white' :
                    active ? 'bg-[var(--color-primary)] text-white' :
                    'bg-[var(--color-surface-container-high)] text-[var(--color-outline)]'}`}
              >
                {done
                  ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>
                  : i + 1}
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-300
                ${active ? 'text-[var(--color-primary)]' :
                  done ? 'text-[var(--color-secondary)]' :
                  'text-[var(--color-outline)]'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-1.5 mb-4 rounded-full transition-all duration-300
                ${done ? 'bg-[var(--color-secondary)]' : 'bg-[var(--color-surface-container-high)]'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const DETAIL_ROWS = [
  {
    label: 'Monto a recibir',
    icon: 'payments',
    iconBg: 'bg-[var(--color-secondary-container)]',
    iconColor: 'text-[var(--color-secondary)]',
    getValue: (amount) => ({ text: formatCurrency(amount), bold: true }),
  },
  {
    label: 'Comisión',
    icon: 'volunteer_activism',
    iconBg: 'bg-[var(--color-secondary-container)]',
    iconColor: 'text-[var(--color-secondary)]',
    getValue: () => ({ text: 'S/ 0 — gratis para ti', green: true }),
  },
  {
    label: 'Descuento en nómina',
    icon: 'calendar_month',
    iconBg: 'bg-[var(--color-primary-fixed)]',
    iconColor: 'text-[var(--color-primary)]',
    getValue: (amount) => ({ text: `${formatCurrency(amount)} el ${getPaybackDate()}` }),
  },
  {
    label: 'Destino',
    icon: 'account_balance_wallet',
    iconBg: 'bg-[var(--color-tertiary-container)]',
    iconColor: 'text-[var(--color-on-tertiary-container)]',
    getValue: (_, wallet) => ({ text: wallet ? `${wallet.label} · ${wallet.number}` : '—' }),
  },
  {
    label: 'Tiempo estimado',
    icon: 'schedule',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    getValue: () => ({ text: 'Menos de 24 horas' }),
  },
]

export default function AdvanceConfirm() {
  const navigate = useNavigate()
  const requestedAmount = useEWAStore((s) => s.requestedAmount)
  const selectedWallet = useEWAStore((s) => s.selectedWallet)
  const confirmAdvance = useEWAStore((s) => s.confirmAdvance)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    confirmAdvance(requestedAmount, selectedWallet)
    setLoading(false)
    navigate('/advance/success', { replace: true })
  }

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Confirmar adelanto" />

      <div className="px-4 pb-safe space-y-4">
        <AdvanceSteps current={1} />

        {/* Amount hero */}
        <div className="text-center py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">
            Recibirás
          </p>
          <span
            className="font-bold text-[var(--color-secondary)]"
            style={{ fontFamily: 'var(--font-headline)', fontSize: '3.5rem', lineHeight: 1 }}
          >
            {formatCurrency(requestedAmount)}
          </span>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
            en tu {selectedWallet?.label}
          </p>
        </div>

        {/* Detail card */}
        <Card className="divide-y divide-[var(--color-surface-container-low)]">
          {DETAIL_ROWS.map(({ label, icon, iconBg, iconColor, getValue }) => {
            const { text, bold, green } = getValue(requestedAmount, selectedWallet)
            return (
              <div key={label} className="flex items-center gap-3 px-4 py-3.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                  <span
                    className={`material-symbols-outlined text-base ${iconColor}`}
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    {icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-on-surface-variant)]">{label}</p>
                  <p className={`text-sm mt-0.5 truncate ${
                    green ? 'font-semibold text-[var(--color-secondary)]' :
                    bold  ? 'font-bold text-[var(--color-on-surface)]' :
                    'font-medium text-[var(--color-on-surface)]'
                  }`}>
                    {text}
                  </p>
                </div>
              </div>
            )
          })}
        </Card>

        {/* Notice */}
        <div className="flex items-start gap-3 px-4 py-3 bg-[var(--color-primary-fixed)] rounded-[var(--radius-xl)]">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-xl mt-0.5"
            style={{ fontVariationSettings: '"FILL" 1' }}>
            shield
          </span>
          <p className="text-xs text-[var(--color-on-primary-fixed)] leading-relaxed">
            Treevü no custodia tu dinero. La transferencia la realiza directamente tu empresa empleadora.
          </p>
        </div>

        <Button onClick={handleConfirm} loading={loading}>
          Confirmar y recibir dinero
        </Button>
        <Button variant="tertiary" onClick={() => navigate(-1)}>
          Editar monto
        </Button>
      </div>
    </div>
  )
}
