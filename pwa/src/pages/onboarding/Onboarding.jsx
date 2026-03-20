import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'

const SLIDES = [
  {
    icon: 'payments',
    color: 'from-[#000666] to-[#1a237e]',
    title: 'Tu sueldo, sin esperar',
    body: 'Accede al salario que ya ganaste en cualquier momento del mes. Sin intereses, sin deuda.',
  },
  {
    icon: 'account_balance_wallet',
    color: 'from-[#006e1c] to-[#004f14]',
    title: 'Transfiere en segundos',
    body: 'Recibe el dinero directo en tu Yape, Plin o cuenta bancaria. Tu empresa descuenta en la siguiente quincena.',
  },
  {
    icon: 'school',
    color: 'from-[#001e24] to-[#00353d]',
    title: 'Aprende y mejora',
    body: 'Accede a lecciones de educación financiera y construye hábitos que te ayuden a manejar mejor tu dinero.',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete)
  const [current, setCurrent] = useState(0)

  const isLast = current === SLIDES.length - 1
  const slide = SLIDES[current]

  const handleNext = () => {
    if (isLast) {
      setOnboardingComplete(true)
      navigate('/home', { replace: true })
    } else {
      setCurrent((c) => c + 1)
    }
  }

  return (
    <div className="app-container flex flex-col min-h-dvh">
      {/* Illustration area */}
      <div className={`flex-1 bg-gradient-to-br ${slide.color} flex flex-col items-center justify-center relative overflow-hidden px-8`}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-white/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-5xl"
              style={{ fontVariationSettings: '"FILL" 1, "wght" 300, "GRAD" 0, "opsz" 48' }}>
              {slide.icon}
            </span>
          </div>

          <div>
            <h1
              className="text-white font-bold text-3xl leading-tight mb-3"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              {slide.title}
            </h1>
            <p className="text-white/75 text-base leading-relaxed max-w-xs">
              {slide.body}
            </p>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[var(--color-surface)] px-6 py-8 flex flex-col gap-3">
        <Button onClick={handleNext}>
          {isLast ? 'Empezar' : 'Continuar'}
        </Button>
        {!isLast && (
          <Button
            variant="tertiary"
            onClick={() => { setOnboardingComplete(true); navigate('/home', { replace: true }) }}
          >
            Omitir
          </Button>
        )}
      </div>
    </div>
  )
}
