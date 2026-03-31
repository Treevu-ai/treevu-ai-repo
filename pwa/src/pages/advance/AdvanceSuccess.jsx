import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useEWAStore } from '@/store/useEWAStore'
import { useToastStore } from '@/store/useToastStore'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n)
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
                  ${done || active ? 'bg-[var(--color-secondary)] text-white' :
                    'bg-[var(--color-surface-container-high)] text-[var(--color-outline)]'}`}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-300 ${done || active ? 'text-[var(--color-secondary)]' : 'text-[var(--color-outline)]'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-16 h-0.5 mx-1.5 mb-4 rounded-full bg-[var(--color-secondary)]" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AdvanceSuccess() {
  const navigate = useNavigate()
  const pendingTransfer = useEWAStore((s) => s.pendingTransfer)
  const showToast = useToastStore((s) => s.show)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger staggered entrance
    const t1 = setTimeout(() => setVisible(true), 80)

    // Toast notification
    const t2 = setTimeout(() => {
      showToast({ message: '¡Adelanto enviado exitosamente!', type: 'success', duration: 4000 })
    }, 700)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="app-container flex flex-col min-h-dvh bg-[var(--color-surface)]">
      <AdvanceSteps current={2} />

      {/* Success hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">

        {/* Celebration rings + icon */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Animated outer rings */}
          <div
            className="absolute w-52 h-52 rounded-full border-2 border-[var(--color-secondary)]/20 animate-ring-out"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="absolute w-40 h-40 rounded-full border-2 border-[var(--color-secondary)]/30 animate-ring-out"
            style={{ animationDelay: '0.4s' }}
          />

          {/* Main circle */}
          <div
            className={`w-28 h-28 rounded-full bg-[var(--color-secondary-container)] flex items-center justify-center transition-all duration-500
              ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <span
              className="material-symbols-outlined text-[var(--color-secondary)] pulse-glow"
              style={{ fontSize: '3.5rem', fontVariationSettings: '"FILL" 1' }}
            >
              check_circle
            </span>
          </div>
        </div>

        <h1
          className={`text-[var(--color-on-surface)] font-bold text-2xl text-center mb-2 animate-fade-up
            ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ fontFamily: 'var(--font-headline)', animationDelay: '0.35s' }}
        >
          ¡Adelanto solicitado!
        </h1>
        <p
          className={`text-[var(--color-on-surface-variant)] text-sm text-center leading-relaxed max-w-xs animate-fade-up
            ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ animationDelay: '0.5s' }}
        >
          Tu solicitud fue enviada exitosamente. Recibirás el dinero en menos de 24 horas.
        </p>

        {/* Detail card */}
        {pendingTransfer && (
          <Card
            className={`w-full mt-6 divide-y divide-[var(--color-surface-container-low)] animate-fade-up
              ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ animationDelay: '0.65s' }}
          >
            {[
              { icon: 'payments', iconBg: 'bg-[var(--color-secondary-container)]', iconColor: 'text-[var(--color-secondary)]', label: 'Monto transferido', value: formatCurrency(pendingTransfer.amount), valueStyle: 'font-bold text-[var(--color-secondary)]' },
              { icon: 'account_balance_wallet', iconBg: 'bg-[var(--color-tertiary-container)]', iconColor: 'text-[var(--color-on-tertiary-container)]', label: 'Destino', value: pendingTransfer.wallet?.label, valueStyle: 'font-medium text-[var(--color-on-surface)]' },
              { icon: 'schedule', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', label: 'Estado', value: 'En proceso', badge: true },
            ].map(({ icon, iconBg, iconColor, label, value, valueStyle, badge }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                  <span className={`material-symbols-outlined text-base ${iconColor}`}
                    style={{ fontVariationSettings: '"FILL" 1' }}>
                    {icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-on-surface-variant)]">{label}</p>
                  {badge ? (
                    <span className="inline-flex items-center gap-1.5 mt-0.5 text-sm font-medium text-amber-600">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      {value}
                    </span>
                  ) : (
                    <p className={`text-sm mt-0.5 ${valueStyle}`}>{value}</p>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Actions */}
      <div
        className={`px-6 pb-10 space-y-3 animate-fade-up ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ animationDelay: '0.8s' }}
      >
        <Button onClick={() => navigate('/home', { replace: true })}>
          Volver al inicio
        </Button>
        <Button variant="tertiary" onClick={() => navigate('/history')}>
          Ver historial
        </Button>
      </div>
    </div>
  )
}
