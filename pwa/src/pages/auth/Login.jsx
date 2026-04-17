import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const navigate  = useNavigate()
  const setPhone  = useAuthStore((s) => s.setPhone)   // reused as "identifier" store key
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) { setError('Ingresa un email válido'); return }
    setLoading(true)
    setError('')
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (otpError) {
      setError(otpError.message)
      console.error('[Login] OTP error:', otpError)
      return
    }
    setPhone(email.trim().toLowerCase())   // store identifier for OTP screen
    navigate('/otp')
  }

  return (
    <div className="app-container flex flex-col min-h-dvh">
      {/* Hero */}
      <div className="editorial-gradient flex flex-col justify-end px-6 pt-20 pb-10 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-8 -left-8 w-40 h-40 rounded-full bg-[var(--color-secondary)]/10" />

        <div className="relative z-10">
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
              Ingresa tu correo
            </h2>
            <p className="text-[var(--color-on-surface-variant)] text-sm">
              Te enviaremos un código de verificación
            </p>
          </div>

          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => { setError(''); setEmail(e.target.value) }}
            className="
              w-full h-14 rounded-[var(--radius-xl)] px-4
              bg-[var(--color-surface-container-high)]
              text-[var(--color-on-surface)] text-[15px]
              placeholder:text-[var(--color-outline)] placeholder:font-normal
              focus:outline-none focus:bg-[var(--color-surface-container-lowest)]
              focus:ring-1 focus:ring-[rgba(0,6,102,0.2)]
              transition-all duration-150
            "
          />

          {error && <p className="text-[var(--color-error)] text-xs px-1">{error}</p>}

          <Button type="submit" loading={loading} disabled={!isValid}>
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
