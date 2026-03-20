import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useEWAStore } from '@/store/useEWAStore'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n)
}

export default function AdvanceSuccess() {
  const navigate = useNavigate()
  const pendingTransfer = useEWAStore((s) => s.pendingTransfer)
  const circleRef = useRef(null)

  useEffect(() => {
    // Animate circle
    const el = circleRef.current
    if (!el) return
    el.style.transform = 'scale(0)'
    el.style.opacity = '0'
    setTimeout(() => {
      el.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
      el.style.transform = 'scale(1)'
      el.style.opacity = '1'
    }, 100)
  }, [])

  return (
    <div className="app-container flex flex-col min-h-dvh bg-[var(--color-surface)]">
      {/* Success hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-6">
        <div ref={circleRef} className="w-28 h-28 rounded-full bg-[var(--color-secondary-container)] flex items-center justify-center mb-6">
          <span
            className="material-symbols-outlined text-[var(--color-secondary)] pulse-glow"
            style={{ fontSize: '3.5rem', fontVariationSettings: '"FILL" 1' }}
          >
            check_circle
          </span>
        </div>

        <h1
          className="text-[var(--color-on-surface)] font-bold text-2xl text-center mb-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          ¡Adelanto solicitado!
        </h1>
        <p className="text-[var(--color-on-surface-variant)] text-sm text-center leading-relaxed max-w-xs">
          Tu solicitud fue enviada exitosamente. Recibirás el dinero en menos de 24 horas.
        </p>

        {/* Amount */}
        {pendingTransfer && (
          <Card className="w-full mt-8 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Monto solicitado</span>
              <span className="font-bold text-[var(--color-secondary)] text-lg"
                style={{ fontFamily: 'var(--font-headline)' }}>
                {formatCurrency(pendingTransfer.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Destino</span>
              <span className="text-sm font-medium text-[var(--color-on-surface)]">
                {pendingTransfer.wallet?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Estado</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                En proceso
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 space-y-3">
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
