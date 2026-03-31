import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/layout/PageHeader'
import { useEWAStore } from '@/store/useEWAStore'

const WALLET_TYPES = [
  { id: 'yape', label: 'Yape', icon: '💜', color: 'bg-purple-50' },
  { id: 'plin', label: 'Plin', icon: '💚', color: 'bg-green-50' },
  { id: 'lukita', label: 'Lukita', icon: '🧡', color: 'bg-orange-50' },
]

export default function LinkWallet() {
  const navigate = useNavigate()
  const addWallet = useEWAStore((s) => s.addWallet)
  const [selected, setSelected] = useState(WALLET_TYPES[0])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (phone.replace(/\D/g, '').length < 9) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    addWallet({ type: selected.id, number: phone, label: `${selected.label} Personal`, primary: false })
    setLoading(false)
    navigate(-1)
  }

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Vincular billetera" />

      <div className="px-4 pb-safe space-y-5">
        {/* Wallet type */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] px-1">
            Tipo de billetera
          </p>
          <div className="flex gap-3">
            {WALLET_TYPES.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelected(w)}
                className={`
                  flex-1 h-16 rounded-[var(--radius-xl)] flex flex-col items-center justify-center gap-1
                  transition-all duration-150
                  ${selected.id === w.id
                    ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-primary-fixed)]'
                    : 'bg-[var(--color-surface-container-high)] active:bg-[var(--color-surface-container-highest)]'
                  }
                `}
              >
                <span className="text-xl">{w.icon}</span>
                <span className="text-xs font-medium text-[var(--color-on-surface)]">{w.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] px-1">
            Número registrado en {selected.label}
          </p>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-sm font-semibold text-[var(--color-on-surface)] select-none flex items-center gap-1.5">
              🇵🇪 +51
              <div className="w-px h-4 bg-[var(--color-outline-variant)] ml-1" />
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="9XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
              maxLength={11}
              className="
                w-full h-14 rounded-[var(--radius-xl)] pl-28 pr-4
                bg-[var(--color-surface-container-high)]
                text-[var(--color-on-surface)] text-[15px] font-semibold
                placeholder:text-[var(--color-outline)] placeholder:font-normal
                focus:outline-none focus:bg-white focus:ring-1 focus:ring-[rgba(0,6,102,0.2)]
                transition-all duration-150
              "
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 px-4 py-3 bg-[var(--color-primary-fixed)] rounded-[var(--radius-xl)]">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-xl mt-0.5"
            style={{ fontVariationSettings: '"FILL" 1' }}>
            info
          </span>
          <p className="text-xs text-[var(--color-on-primary-fixed)] leading-relaxed">
            Asegúrate que el número esté activo en {selected.label}. El adelanto se transferirá directamente a esta billetera.
          </p>
        </div>

        <Button
          onClick={handleAdd}
          loading={loading}
          disabled={phone.replace(/\D/g, '').length < 9}
        >
          Vincular {selected.label}
        </Button>
      </div>
    </div>
  )
}
