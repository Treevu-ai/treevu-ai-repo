import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import { useEWAStore } from '@/store/useEWAStore'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n)
}

const QUICK_AMOUNTS = [100, 200, 300, 500]
const MIN_AMOUNT = 50

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

function AdvanceSkeleton() {
  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Solicitar adelanto" subtitle="Accede a tu sueldo devengado" />
      <div className="px-4 pb-safe space-y-4">
        <Skeleton className="h-10 w-full rounded-[var(--radius)] mx-auto" />
        <Card className="p-5 space-y-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-10 w-44 rounded-full" />
          <Skeleton className="h-3 w-48 rounded-full" />
        </Card>
        <Card className="p-5 space-y-5">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-14 w-32 rounded-full mx-auto" />
          <Skeleton className="h-6 w-full rounded-full" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="flex-1 h-9 rounded-full" />)}
          </div>
        </Card>
        <Card className="p-5 space-y-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-14 w-full rounded-[var(--radius-xl)]" />
        </Card>
        <Skeleton className="h-12 w-full rounded-[var(--radius-xl)]" />
      </div>
    </div>
  )
}

export default function AdvanceRequest() {
  const navigate = useNavigate()
  const employee = useEWAStore((s) => s.employee)
  const setRequestedAmount = useEWAStore((s) => s.setRequestedAmount)
  const setSelectedWallet = useEWAStore((s) => s.setSelectedWallet)
  const [loading, setLoading] = useState(true)

  const maxAmount = employee.availableAdvance
  const [amount, setAmount] = useState(Math.min(200, maxAmount))
  const [selectedW, setSelectedW] = useState(employee.wallets[0] || null)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <AdvanceSkeleton />

  const sliderPercent = maxAmount > MIN_AMOUNT
    ? ((amount - MIN_AMOUNT) / (maxAmount - MIN_AMOUNT)) * 100
    : 100

  const isValid = amount >= MIN_AMOUNT && amount <= maxAmount && !!selectedW

  const handleSlider = (e) => {
    setAmount(Number(e.target.value))
    setError('')
  }

  const handleContinue = () => {
    if (!selectedW) { setError('Selecciona un destino de pago'); return }
    setRequestedAmount(amount)
    setSelectedWallet(selectedW)
    navigate('/advance/confirm')
  }

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Solicitar adelanto" subtitle="Accede a tu sueldo devengado" />

      <div className="px-4 pb-safe space-y-4">
        <AdvanceSteps current={0} />

        {/* Available balance */}
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">
            Disponible ahora
          </p>
          <span
            className="font-bold text-[var(--color-secondary)] block"
            style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', lineHeight: 1 }}
          >
            {formatCurrency(employee.availableAdvance)}
          </span>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
            Máximo {formatCurrency(employee.maxAdvance)} · Descuento en quincena siguiente
          </p>
        </Card>

        {/* Amount slider */}
        <Card className="p-5 space-y-5">
          <p className="text-sm font-semibold text-[var(--color-on-surface)]"
            style={{ fontFamily: 'var(--font-headline)' }}>
            ¿Cuánto necesitas?
          </p>

          {/* Big amount display */}
          <div className="text-center py-1">
            <span
              className="font-bold text-[var(--color-primary)] transition-all duration-100"
              style={{ fontFamily: 'var(--font-headline)', fontSize: '3rem', lineHeight: 1 }}
            >
              {formatCurrency(amount)}
            </span>
          </div>

          {/* Slider */}
          <div className="px-1">
            <input
              type="range"
              min={MIN_AMOUNT}
              max={maxAmount}
              step={10}
              value={amount}
              onChange={handleSlider}
              style={{
                background: `linear-gradient(to right, var(--color-primary) ${sliderPercent}%, var(--color-surface-container-high) ${sliderPercent}%)`,
              }}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-[var(--color-outline)]">S/ {MIN_AMOUNT}</span>
              <span className="text-[10px] text-[var(--color-outline)]">{formatCurrency(maxAmount)}</span>
            </div>
          </div>

          {/* Quick select */}
          <div className="flex gap-2">
            {QUICK_AMOUNTS.filter((q) => q <= maxAmount).map((q) => (
              <button
                key={q}
                onClick={() => { setAmount(q); setError('') }}
                className={`
                  flex-1 h-9 rounded-full text-sm font-medium transition-all duration-150
                  ${amount === q
                    ? 'editorial-gradient text-white shadow-sm'
                    : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] active:bg-[var(--color-surface-container-highest)]'
                  }
                `}
              >
                S/ {q}
              </button>
            ))}
          </div>

          {error && <p className="text-[var(--color-error)] text-xs">{error}</p>}
        </Card>

        {/* Destination */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--color-on-surface)]"
              style={{ fontFamily: 'var(--font-headline)' }}>
              Destino del pago
            </p>
            <button
              onClick={() => navigate('/accounts/link-wallet')}
              className="text-xs text-[var(--color-primary)] font-medium"
            >
              + Agregar
            </button>
          </div>

          {employee.wallets.length === 0 ? (
            <button
              onClick={() => navigate('/accounts/link-wallet')}
              className="w-full h-14 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-outline-variant)] flex items-center justify-center gap-2 text-[var(--color-on-surface-variant)] text-sm"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              Agregar billetera o cuenta
            </button>
          ) : (
            <div className="space-y-2">
              {employee.wallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedW(w)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-[var(--radius-lg)] transition-all duration-150
                    ${selectedW?.id === w.id
                      ? 'bg-[var(--color-primary-fixed)] ring-1 ring-[var(--color-primary)]'
                      : 'bg-[var(--color-surface-container-low)] active:bg-[var(--color-surface-container)]'
                    }
                  `}
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-secondary-container)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--color-secondary)] text-lg"
                      style={{ fontVariationSettings: '"FILL" 1' }}>
                      account_balance_wallet
                    </span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-[var(--color-on-surface)]">{w.label}</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">{w.number}</p>
                  </div>
                  {selectedW?.id === w.id && (
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-xl"
                      style={{ fontVariationSettings: '"FILL" 1' }}>
                      check_circle
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Fee info */}
        <div className="flex items-start gap-3 px-4 py-3 bg-[var(--color-secondary-container)]/30 rounded-[var(--radius-xl)]">
          <span className="material-symbols-outlined text-[var(--color-secondary)] text-xl mt-0.5"
            style={{ fontVariationSettings: '"FILL" 1' }}>
            info
          </span>
          <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
            Sin intereses ni cargos para ti. El descuento de{' '}
            <span className="font-semibold text-[var(--color-on-surface)]">
              {formatCurrency(amount)}
            </span>{' '}
            se aplicará automáticamente en tu próxima quincena.
          </p>
        </div>

        <Button onClick={handleContinue} disabled={!isValid} className="mt-2">
          Continuar
        </Button>
      </div>
    </div>
  )
}
