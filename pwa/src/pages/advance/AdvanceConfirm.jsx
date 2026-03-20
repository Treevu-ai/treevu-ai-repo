import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { useEWAStore } from '@/store/useEWAStore'

function formatCurrency(n) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n)
}

const ROWS = [
  { label: 'Monto a recibir', key: 'amount', highlight: true },
  { label: 'Comisión para ti', value: 'S/ 0 (gratis)' },
  { label: 'Descuento en nómina', key: 'amount' },
  { label: 'Destino', key: 'wallet' },
  { label: 'Tiempo estimado', value: '< 24 horas' },
]

export default function AdvanceConfirm() {
  const navigate = useNavigate()
  const requestedAmount = useEWAStore((s) => s.requestedAmount)
  const selectedWallet = useEWAStore((s) => s.selectedWallet)
  const confirmAdvance = useEWAStore((s) => s.confirmAdvance)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    confirmAdvance(requestedAmount, selectedWallet)
    setLoading(false)
    navigate('/advance/success', { replace: true })
  }

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Confirmar adelanto" />

      <div className="px-4 pb-safe space-y-4">
        {/* Amount hero */}
        <div className="text-center py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">
            Recibirás
          </p>
          <span
            className="font-bold text-[var(--color-secondary)]"
            style={{ fontFamily: 'var(--font-headline)', fontSize: '3.5rem', lineHeight: 1 }}
          >
            {formatCurrency(requestedAmount)}
          </span>
        </div>

        {/* Detail card */}
        <Card className="divide-y divide-[var(--color-surface-container-low)]">
          {[
            { label: 'Monto a recibir', value: formatCurrency(requestedAmount), highlight: true },
            { label: 'Comisión para ti', value: 'S/ 0 (gratis)', green: true },
            { label: 'Descuento en nómina', value: formatCurrency(requestedAmount) },
            { label: 'Destino', value: selectedWallet ? `${selectedWallet.label} · ${selectedWallet.number}` : '—' },
            { label: 'Tiempo estimado', value: '< 24 horas' },
          ].map(({ label, value, highlight, green }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-[var(--color-on-surface-variant)]">{label}</span>
              <span className={`text-sm font-semibold ${
                highlight ? 'text-[var(--color-on-surface)]' :
                green ? 'text-[var(--color-secondary)]' :
                'text-[var(--color-on-surface)]'
              }`}>
                {value}
              </span>
            </div>
          ))}
        </Card>

        {/* Notice */}
        <div className="flex items-start gap-3 px-4 py-3 bg-[var(--color-primary-fixed)] rounded-[var(--radius-xl)]">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-xl mt-0.5"
            style={{ fontVariationSettings: '"FILL" 1' }}>
            shield
          </span>
          <p className="text-xs text-[var(--color-on-primary-fixed)] leading-relaxed">
            Treevü no custodia tu dinero. La transferencia la realiza directamente tu empresa empleadora.
          </p>
        </div>

        <Button onClick={handleConfirm} loading={loading}>
          Confirmar y recibir dinero
        </Button>
        <Button variant="tertiary" onClick={() => navigate(-1)}>
          Editar monto
        </Button>
      </div>
    </div>
  )
}
