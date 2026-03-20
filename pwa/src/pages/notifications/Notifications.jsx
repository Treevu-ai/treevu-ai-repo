import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    icon: 'check_circle',
    iconColor: 'text-[var(--color-secondary)]',
    iconBg: 'bg-[var(--color-secondary-container)]',
    title: 'Adelanto procesado',
    body: 'Tu adelanto de S/ 500 fue transferido a tu Yape exitosamente.',
    time: 'Hace 2 días',
    read: false,
  },
  {
    id: 'n2',
    icon: 'school',
    iconColor: 'text-[var(--color-on-tertiary-container)]',
    iconBg: 'bg-[var(--color-tertiary-container)]',
    title: 'Nueva lección disponible',
    body: '"Cómo armar tu presupuesto mensual" — Nivel 1. ¡Empieza ahora!',
    time: 'Hace 3 días',
    read: true,
  },
  {
    id: 'n3',
    icon: 'payments',
    iconColor: 'text-[var(--color-primary)]',
    iconBg: 'bg-[var(--color-primary-fixed)]',
    title: 'Sueldo devengado actualizado',
    body: 'Ya tienes S/ 1,440 devengados en este ciclo. ¡Sigue así!',
    time: 'Hace 5 días',
    read: true,
  },
]

function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center mb-4">
        <span
          className="material-symbols-outlined text-4xl text-[var(--color-outline)]"
          style={{ fontVariationSettings: '"FILL" 0, "wght" 200' }}
        >
          notifications_off
        </span>
      </div>
      <h3
        className="font-semibold text-[var(--color-on-surface)] text-base mb-1"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        Todo al día
      </h3>
      <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
        No tienes notificaciones nuevas. Te avisaremos cuando haya novedades.
      </p>
    </div>
  )
}

export default function Notifications() {
  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Notificaciones" />

      <div className="px-4 pb-safe">
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <Card className="divide-y divide-[var(--color-surface-container-low)]">
            {MOCK_NOTIFICATIONS.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-4 transition-colors active:bg-[var(--color-surface-container-low)] ${!n.read ? 'bg-[var(--color-primary-fixed)]/30' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.iconBg}`}>
                  <span className={`material-symbols-outlined text-lg ${n.iconColor}`}
                    style={{ fontVariationSettings: '"FILL" 1' }}>
                    {n.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--color-on-surface)]">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-[var(--color-outline)] mt-1.5">{n.time}</p>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
