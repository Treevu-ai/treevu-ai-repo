import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import PulseBar from '@/components/ui/PulseBar'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useEWAStore } from '@/store/useEWAStore'
import { haptics } from '@/utils/haptic'

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
}

function greetingByHour() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// ── Onboarding tip (shown while advanceCount === 0, dismissible) ──
function OnboardingTip({ onDismiss }) {
  return (
    <div className="mx-4 mt-4 flex items-start gap-3 px-4 py-3.5 bg-[var(--color-primary-fixed)] rounded-[var(--radius-xl)] animate-fade-up">
      <span
        className="material-symbols-outlined text-[var(--color-primary)] text-2xl shrink-0 mt-0.5"
        style={{ fontVariationSettings: '"FILL" 1' }}
      >
        lightbulb
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--color-on-primary-fixed)] mb-0.5">
          ¿Sabías esto?
        </p>
        <p className="text-xs text-[var(--color-on-primary-fixed)]/80 leading-relaxed">
          Puedes acceder hasta el <span className="font-bold">50% de tu sueldo devengado</span> hoy mismo, sin intereses ni cargos.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--color-primary)]/10 transition-colors"
      >
        <span className="material-symbols-outlined text-[var(--color-primary)] text-base">close</span>
      </button>
    </div>
  )
}

// ── Pull-to-refresh indicator ──
function PullIndicator({ distance, refreshing }) {
  const progress = Math.min(distance / 60, 1)
  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-200"
      style={{ height: distance, opacity: progress }}
    >
      <div className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}
        style={{ transform: `rotate(${progress * 180}deg)` }}>
        <span className="material-symbols-outlined text-white text-lg">
          {refreshing ? 'refresh' : 'arrow_downward'}
        </span>
      </div>
    </div>
  )
}

// ── Salary breakdown bar ──
function SalaryBreakdown({ employee }) {
  const used = employee.earnedWage - employee.availableAdvance
  const pending = employee.baseSalary - employee.earnedWage

  const usedPct = (used / employee.baseSalary) * 100
  const availPct = (employee.availableAdvance / employee.baseSalary) * 100
  const pendingPct = (pending / employee.baseSalary) * 100

  return (
    <div className="mt-4 space-y-2">
      {/* Segmented bar */}
      <div className="h-2.5 rounded-full overflow-hidden flex gap-0.5">
        {used > 0 && (
          <div
            className="h-full rounded-l-full bg-white/40 transition-all duration-700"
            style={{ width: `${usedPct}%` }}
          />
        )}
        <div
          className="h-full bg-[var(--color-secondary)] pulse-glow transition-all duration-700"
          style={{ width: `${availPct}%`, borderRadius: used > 0 ? '0' : '9999px 0 0 9999px' }}
        />
        <div
          className="h-full rounded-r-full bg-white/15 transition-all duration-700"
          style={{ width: `${pendingPct}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 text-white/60">
          <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)] inline-block" />
          Disponible {formatCurrency(employee.availableAdvance)}
        </span>
        {used > 0 && (
          <span className="flex items-center gap-1 text-white/50">
            <span className="w-2 h-2 rounded-full bg-white/40 inline-block" />
            Adelantado {formatCurrency(used)}
          </span>
        )}
        <span className="flex items-center gap-1 text-white/40">
          <span className="w-2 h-2 rounded-full bg-white/20 inline-block" />
          Pendiente
        </span>
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
        {[
          { label: 'Devengado', value: formatCurrency(employee.earnedWage), icon: 'payments' },
          { label: 'Días trabajados', value: `${employee.daysWorked}/${employee.totalDays}`, icon: 'today' },
          { label: 'Próximo pago', value: formatDate(employee.nextPayday), icon: 'event' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="material-symbols-outlined text-white/50 text-sm"
              style={{ fontVariationSettings: '"FILL" 1' }}>
              {icon}
            </span>
            <p className="text-white font-semibold text-xs leading-tight" style={{ fontFamily: 'var(--font-headline)' }}>
              {value}
            </p>
            <p className="text-white/50 text-[9px] leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <div className="editorial-gradient px-6 pt-14 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-full bg-white/20" />
            <Skeleton className="h-6 w-32 rounded-full bg-white/20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
            <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
          </div>
        </div>
        <Skeleton className="h-3 w-28 rounded-full bg-white/20 mb-2" />
        <Skeleton className="h-12 w-48 rounded-full bg-white/20 mb-3" />
        <Skeleton className="h-2.5 w-full rounded-full bg-white/20 mb-4" />
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-4 rounded bg-white/20" />
              <Skeleton className="h-3 w-14 rounded-full bg-white/20" />
              <Skeleton className="h-2 w-12 rounded-full bg-white/20" />
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-4 space-y-4">
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-9 w-36 rounded-full" />
              <Skeleton className="h-3 w-28 rounded-full" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-[var(--radius-xl)]" />
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-7 w-10 rounded-full" />
            </Card>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <Skeleton className="h-4 w-36 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
          <Card className="divide-y divide-[var(--color-surface-container-low)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-16 rounded-full shrink-0" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

const TIP_KEY = 'treevu_tip_dismissed'

export default function Home() {
  const navigate = useNavigate()
  const employee = useEWAStore((s) => s.employee)
  const loadEmployee = useEWAStore((s) => s.loadEmployee)
  const authLogout = useAuthStore((s) => s.logout)
  const storeLoading = useEWAStore((s) => s.loading)
  const storeError = useEWAStore((s) => s.error)
  const transactions = useEWAStore((s) => s.transactions)

  const [loading, setLoading] = useState(true)
  const [showTip, setShowTip] = useState(false)
  const [pullDistance, setPullDist] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const containerRef = useRef(null)
  const touchStartY = useRef(0)
  const isPulling = useRef(false)

  useEffect(() => {
    loadEmployee().then(() => {
      if (!localStorage.getItem(TIP_KEY)) setShowTip(true)
    }).catch(() => {
      navigate('/login', { replace: true })
    }).finally(() => setLoading(false))
  }, [])

  const dismissTip = useCallback(() => {
    setShowTip(false)
    localStorage.setItem(TIP_KEY, '1')
  }, [])

  // ── Pull-to-refresh handlers ──
  const onTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY
    isPulling.current = false
  }, [])

  const onTouchMove = useCallback((e) => {
    const container = containerRef.current
    if (!container) return
    if (container.scrollTop > 2) return          // only when at top
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta <= 0) return
    isPulling.current = true
    setPullDist(Math.min(delta * 0.5, 72))       // dampen resistance
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!isPulling.current) return
    if (pullDistance >= 52) {
      setRefreshing(true)
      setTimeout(() => {
        setRefreshing(false)
        setPullDist(0)
        isPulling.current = false
      }, 1400)
    } else {
      setPullDist(0)
      isPulling.current = false
    }
  }, [pullDistance])

  if (loading) return <HomeSkeleton />

  if (!employee) {
    const message = storeError || 'No encontramos tu perfil de colaborador para esta cuenta.'
    return (
      <div className="app-container bg-[var(--color-surface)] min-h-dvh flex items-center justify-center px-6">
        <Card className="w-full max-w-md p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-error-container)] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--color-error)]">person_off</span>
          </div>
          <h1
            className="text-[var(--color-on-surface)] font-bold text-lg"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            No pudimos cargar tu inicio
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            {message}
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
            <Button
              variant="tertiary"
              onClick={async () => {
                await authLogout()
                navigate('/login', { replace: true })
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </Card>
      </div>
    )
  }
  const recentTx = transactions.slice(0, 3)

  return (
    <div
      ref={containerRef}
      className="app-container bg-[var(--color-surface)] min-h-dvh overflow-y-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Header ── */}
      <div
        className="editorial-gradient px-6 pt-14 pb-8 relative overflow-hidden transition-all duration-200"
        style={{ paddingTop: `calc(3.5rem + ${pullDistance}px)` }}
      >
        {/* Pull indicator */}
        <PullIndicator distance={pullDistance} refreshing={refreshing} />

        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[var(--color-secondary)]/10" />

        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                {greetingByHour()}
              </p>
              <h1
                className="text-white font-bold text-xl mt-0.5"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {employee.name.split(' ')[0]} 👋
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { haptics.tap(); navigate('/notifications') }}
                aria-label="Ver notificaciones"
                className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative active:bg-white/25 transition-colors"
              >
                <span className="material-symbols-outlined text-white text-xl" aria-hidden="true">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-secondary-fixed)] rounded-full" aria-hidden="true" />
              </button>
              <button
                onClick={() => { haptics.tap(); navigate('/settings') }}
                aria-label="Ir a mi perfil"
                className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25 transition-colors"
              >
                <span className="material-symbols-outlined text-white text-xl" aria-hidden="true">person</span>
              </button>
            </div>
          </div>

          {/* Earned wage amount */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
              Sueldo devengado
            </p>
            <span
              className="text-white font-bold block"
              style={{ fontFamily: 'var(--font-headline)', fontSize: '3rem', lineHeight: 1 }}
            >
              {formatCurrency(employee.earnedWage)}
            </span>
            <p className="text-white/50 text-xs mt-1">
              de {formatCurrency(employee.baseSalary)} total
            </p>
          </div>

          {/* Visual salary breakdown */}
          <SalaryBreakdown employee={employee} />
        </div>
      </div>

      {/* ── Onboarding tip ── */}
      {showTip && <OnboardingTip onDismiss={dismissTip} />}

      {/* ── Main content ── */}
      <div className="px-4 py-4 space-y-4">

        {/* Available advance card */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">
                Disponible ahora
              </p>
              <span
                className="font-bold text-[var(--color-secondary)] block"
                style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', lineHeight: 1 }}
              >
                {formatCurrency(employee.availableAdvance)}
              </span>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                Máximo: {formatCurrency(employee.maxAdvance)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-secondary-container)] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[var(--color-secondary)] text-2xl"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                payments
              </span>
            </div>
          </div>
          <Button onClick={() => navigate('/advance')}>
            Solicitar adelanto
          </Button>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-fixed)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-lg"
                style={{ fontVariationSettings: '"FILL" 1' }}>
                trending_up
              </span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)]">Adelantos este mes</p>
            <p className="font-bold text-xl text-[var(--color-on-surface)] mt-0.5"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {employee.advanceCount}
            </p>
          </Card>
          <Card className="p-4" onClick={() => navigate('/education')}>
            <div className="w-9 h-9 rounded-xl bg-[var(--color-tertiary-container)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[var(--color-on-tertiary-container)] text-lg"
                style={{ fontVariationSettings: '"FILL" 1' }}>
                school
              </span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)]">Educación financiera</p>
            <p className="font-bold text-sm text-[var(--color-on-tertiary-container)] mt-0.5">
              Ver lecciones →
            </p>
          </Card>
        </div>

        {/* Recent transactions — always visible */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="font-semibold text-[var(--color-on-surface)] text-sm"
              style={{ fontFamily: 'var(--font-headline)' }}>
              Movimientos recientes
            </h2>
            <button
              onClick={() => navigate('/history')}
              className="text-[var(--color-primary)] text-xs font-medium"
            >
              Ver todos
            </button>
          </div>

          {recentTx.length === 0 ? (
            <Card className="p-6 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center">
                <span className="material-symbols-outlined text-[var(--color-outline)] text-2xl"
                  style={{ fontVariationSettings: '"FILL" 0, "wght" 200' }}>
                  receipt_long
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--color-on-surface)]">Sin movimientos aún</p>
              <p className="text-xs text-[var(--color-on-surface-variant)]">
                Tu primer adelanto aparecerá aquí
              </p>
              <button
                onClick={() => navigate('/advance')}
                className="mt-1 text-xs font-semibold text-[var(--color-primary)] underline underline-offset-2"
              >
                Solicitar mi primer adelanto
              </button>
            </Card>
          ) : (
            <Card className="divide-y divide-[var(--color-surface-container-low)]">
              {recentTx.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => navigate(`/history/${tx.id}`)}
                  className="w-full flex items-center gap-3 p-4 active:bg-[var(--color-surface-container-low)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary-container)] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[var(--color-secondary)] text-lg"
                      style={{ fontVariationSettings: '"FILL" 1' }}>
                      payments
                    </span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">
                      Adelanto de sueldo
                    </p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                      {formatDate(tx.date)} · {tx.destination}
                    </p>
                  </div>
                  <span className="text-[var(--color-secondary)] font-semibold text-sm shrink-0">
                    +{formatCurrency(tx.amount)}
                  </span>
                </button>
              ))}
              <button
                onClick={() => navigate('/history')}
                className="w-full flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold text-[var(--color-primary)] active:bg-[var(--color-surface-container-low)] transition-colors"
              >
                <span className="material-symbols-outlined text-base">history</span>
                Ver historial completo
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
