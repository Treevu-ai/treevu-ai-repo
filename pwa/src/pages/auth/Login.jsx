import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'

export default function Login() {
  const navigate = useNavigate()
  const setPhone = useAuthStore((s) => s.setPhone)
  const [phone, setPhoneLocal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendOTP = useAuthStore((s) => s.sendOTP)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clean = phone.replace(/\D/g, '')
    if (clean.length < 9) {
      setError('Ingresa un número válido de 9 dígitos')
      return
    }
    setLoading(true)
    setError('')
    const formatted = `+51${clean}`
    const result = await sendOTP(formatted)
    if (!result.ok) {
      setError('No se pudo enviar el código. Intenta de nuevo.')
      setLoading(false)
      return
    }
    setPhone(formatted)
    setLoading(false)
    navigate('/otp')
  }

  return (
    <div className="app-container flex flex-col min-h-dvh">
      {/* Hero */}
      <div className="editorial-gradient flex flex-col justify-end px-6 pt-20 pb-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-8 -left-8 w-40 h-40 rounded-full bg-[var(--color-secondary)]/10" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">account_tree</span>
            </div>
            <span
              className="text-white text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Treevü
            </span>
          </div>

          <h1
            className="text-white font-bold leading-tight mb-3"
            style={{ fontFamily: 'var(--font-headline)', fontSize: '2.25rem' }}
          >
            Tu sueldo,<br />cuando lo<br />necesitas.
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Accede al salario que ya ganaste.<br />Sin intereses. Sin deuda.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-[var(--color-surface)] px-6 pt-8 pb-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <h2
              className="text-[var(--color-on-surface)] font-bold text-xl mb-1"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Ingresa tu número
            </h2>
            <p className="text-[var(--color-on-surface-variant)] text-sm">
              Te enviaremos un código de verificación
            </p>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center gap-2 text-[var(--color-on-surface)] text-sm font-semibold select-none z-10">
              <span>🇵🇪</span>
              <span>+51</span>
              <div className="w-px h-4 bg-[var(--color-outline-variant)] ml-1" />
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="9XX XXX XXX"
              value={phone}
              onChange={(e) => {
                setError('')
                setPhoneLocal(e.target.value.replace(/[^\d\s]/g, ''))
              }}
              maxLength={11}
              className="
                w-full h-14 rounded-[var(--radius-xl)] pl-28 pr-4
                bg-[var(--color-surface-container-high)]
                text-[var(--color-on-surface)] text-[15px] font-semibold
                placeholder:text-[var(--color-outline)] placeholder:font-normal
                focus:outline-none focus:bg-[var(--color-surface-container-lowest)]
                focus:ring-1 focus:ring-[rgba(0,6,102,0.2)]
                transition-all duration-150
              "
            />
          </div>

          {error && (
            <p className="text-[var(--color-error)] text-xs px-1">{error}</p>
          )}

          <Button type="submit" loading={loading} disabled={phone.replace(/\D/g, '').length < 9}>
            Continuar
          </Button>

          <p className="text-center text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
            Al continuar aceptas nuestros{' '}
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="text-[var(--color-primary)] font-medium underline underline-offset-2"
            >
              Términos y Condiciones
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
