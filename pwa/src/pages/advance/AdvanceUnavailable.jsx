import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function AdvanceUnavailable() {
  const navigate = useNavigate()
  return (
    <div className="app-container flex flex-col items-center justify-center min-h-dvh px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-[var(--color-error-container)] flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[var(--color-error)]"
          style={{ fontSize: '3rem', fontVariationSettings: '"FILL" 1' }}>
          money_off
        </span>
      </div>
      <h1 className="font-bold text-xl text-[var(--color-on-surface)] mb-2"
        style={{ fontFamily: 'var(--font-headline)' }}>
        Adelanto no disponible
      </h1>
      <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-xs mb-8">
        Aún no tienes suficiente sueldo devengado para solicitar un adelanto. Necesitas al menos 10 días trabajados en el ciclo actual.
      </p>
      <div className="w-full space-y-3">
        <Button onClick={() => navigate('/home')}>Volver al inicio</Button>
        <Button variant="tertiary" onClick={() => navigate('/education')}>
          Aprender sobre EWA
        </Button>
      </div>
    </div>
  )
}
