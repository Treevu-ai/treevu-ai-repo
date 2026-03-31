import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { useEWAStore } from '@/store/useEWAStore'

export default function Accounts() {
  const navigate = useNavigate()
  const employee = useEWAStore((s) => s.employee)
  const { wallets, banks } = employee

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Mis cuentas y billeteras" />

      <div className="px-4 pb-safe space-y-4">
        {/* Wallets section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[var(--color-on-surface)]"
              style={{ fontFamily: 'var(--font-headline)' }}>
              Billeteras digitales
            </h2>
            <button
              onClick={() => navigate('/accounts/link-wallet')}
              className="text-xs text-[var(--color-primary)] font-medium"
            >
              + Agregar
            </button>
          </div>

          {wallets.length === 0 ? (
            <button
              onClick={() => navigate('/accounts/link-wallet')}
              className="w-full h-20 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-outline-variant)] flex flex-col items-center justify-center gap-1 text-[var(--color-on-surface-variant)]"
            >
              <span className="material-symbols-outlined text-2xl">add_circle</span>
              <span className="text-xs">Vincular Yape, Plin u otro</span>
            </button>
          ) : (
            <Card className="divide-y divide-[var(--color-surface-container-low)]">
              {wallets.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary-container)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--color-secondary)] text-xl"
                      style={{ fontVariationSettings: '"FILL" 1' }}>
                      account_balance_wallet
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-on-surface)]">{w.label}</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">{w.number}</p>
                  </div>
                  {w.primary && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-secondary)] bg-[var(--color-secondary-container)] px-2 py-0.5 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </Card>
          )}
        </section>

        {/* Banks section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[var(--color-on-surface)]"
              style={{ fontFamily: 'var(--font-headline)' }}>
              Cuentas bancarias
            </h2>
            <button
              onClick={() => navigate('/accounts/new-bank')}
              className="text-xs text-[var(--color-primary)] font-medium"
            >
              + Agregar
            </button>
          </div>

          {banks.length === 0 ? (
            <Button variant="ghost" onClick={() => navigate('/accounts/new-bank')}>
              <span className="material-symbols-outlined text-xl">add</span>
              Agregar cuenta bancaria
            </Button>
          ) : (
            <Card className="divide-y divide-[var(--color-surface-container-low)]">
              {banks.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-fixed)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-xl"
                      style={{ fontVariationSettings: '"FILL" 1' }}>
                      account_balance
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-on-surface)]">{b.bank}</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">•••• {b.last4}</p>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
