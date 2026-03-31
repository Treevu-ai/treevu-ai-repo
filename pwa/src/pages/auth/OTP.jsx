import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'

export default function OTP() {
  const navigate = useNavigate()
  const phone = useAuthStore((s) => s.phone)
  const setPinCreated = useAuthStore((s) => s.setPinCreated)
  const pinCreated = useAuthStore((s) => s.pinCreated)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const inputs = useRef([])

  useEffect(() => {
    inputs.current[0]?.focus()
    const t = setInterval(() => setResendTimer((v) => (v > 0 ? v - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[i] = val
    setCode(next)
    setError('')
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const full = code.join('')
    if (full.length < 6) { setError('Ingresa el código completo'); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    // Mock: any 6-digit code works in demo
    setLoading(false)
    if (pinCreated) {
      navigate('/home', { replace: true })
    } else {
      navigate('/pin/create', { replace: true })
    }
  }

  const displayPhone = phone ? phone.replace('+51', '').trim() : '---'

  return (
    <div className="app-container flex flex-col min-h-dvh px-6">
      <div className="pt-16 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[var(--color-surface-container-low)] flex items-center justify-center mb-6"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <div className="w-16 h-16 rounded-2xl editorial-gradient flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-white text-3xl">sms</span>
        </div>

        <h1
          className="text-[var(--color-on-surface)] font-bold text-2xl mb-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Código de verificación
        </h1>
        <p className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed">
          Enviamos un código de 6 dígitos al<br />
          <span className="font-semibold text-[var(--color-on-surface)]">+51 {displayPhone}</span>
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex gap-2 justify-center py-8" onPaste={handlePaste}>
        {code.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`
              w-12 h-14 rounded-[var(--radius-lg)] text-center text-xl font-bold
              bg-[var(--color-surface-container-high)]
              text-[var(--color-on-surface)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
              focus:bg-[var(--color-surface-container-lowest)]
              transition-all duration-150
              ${d ? 'bg-[var(--color-primary-fixed)] text-[var(--color-primary)]' : ''}
              ${error ? 'ring-1 ring-[var(--color-error)]' : ''}
            `}
          />
        ))}
      </div>

      {error && <p className="text-center text-[var(--color-error)] text-sm mb-4">{error}</p>}

      <div className="flex flex-col gap-4 mt-auto pb-10">
        <Button onClick={handleVerify} loading={loading} disabled={code.join('').length < 6}>
          Verificar código
        </Button>

        <button
          disabled={resendTimer > 0}
          onClick={() => { setResendTimer(30); setError('') }}
          className="text-center text-sm text-[var(--color-on-surface-variant)] disabled:opacity-50"
        >
          {resendTimer > 0
            ? `Reenviar código en ${resendTimer}s`
            : <span className="text-[var(--color-primary)] font-medium">Reenviar código</span>
          }
        </button>
      </div>
    </div>
  )
}
