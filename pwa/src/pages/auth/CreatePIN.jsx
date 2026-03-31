import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function CreatePIN() {
  const navigate = useNavigate()
  const setPinCreated = useAuthStore((s) => s.setPinCreated)
  const [step, setStep] = useState('create') // 'create' | 'confirm'
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')

  const current = step === 'create' ? pin : confirmPin
  const setter = step === 'create' ? setPin : setConfirmPin

  const handleKey = (k) => {
    setError('')
    if (k === '⌫') {
      setter((v) => v.slice(0, -1))
      return
    }
    if (k === '') return
    if (current.length >= 6) return
    const next = current + k
    setter(next)

    if (next.length === 6) {
      setTimeout(() => {
        if (step === 'create') {
          setStep('confirm')
        } else {
          if (next === pin) {
            setPinCreated(true)
            navigate('/onboarding', { replace: true })
          } else {
            setError('Los PINs no coinciden. Intenta de nuevo.')
            setConfirmPin('')
            setPin('')
            setStep('create')
          }
        }
      }, 150)
    }
  }

  return (
    <div className="app-container flex flex-col min-h-dvh px-6">
      <div className="pt-16 pb-4">
        <div className="w-16 h-16 rounded-2xl editorial-gradient flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-white text-3xl">lock</span>
        </div>
        <h1
          className="text-[var(--color-on-surface)] font-bold text-2xl mb-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {step === 'create' ? 'Crea tu PIN de seguridad' : 'Confirma tu PIN'}
        </h1>
        <p className="text-[var(--color-on-surface-variant)] text-sm">
          {step === 'create'
            ? 'Elige 6 dígitos que recuerdes fácilmente'
            : 'Ingresa el mismo PIN para confirmar'}
        </p>
      </div>

      {/* PIN dots */}
      <div className="flex justify-center gap-4 py-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < current.length
                ? 'bg-[var(--color-primary)] scale-110'
                : 'bg-[var(--color-surface-container-highest)]'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-[var(--color-error)] text-sm mb-4">{error}</p>
      )}

      {/* Numpad */}
      <div className="mt-auto pb-10">
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
          {KEYS.map((k, i) => (
            <button
              key={i}
              onClick={() => handleKey(k)}
              disabled={k === ''}
              className={`
                h-16 rounded-[var(--radius-xl)] text-xl font-semibold
                transition-all duration-100 active:scale-95
                ${k === '' ? 'invisible' : ''}
                ${k === '⌫'
                  ? 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] text-2xl'
                  : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] active:bg-[var(--color-surface-container-highest)]'
                }
              `}
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
