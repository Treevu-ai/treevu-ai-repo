import { useState, useEffect } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'

const TYPE_CONFIG = {
  advance_approved: { icon: 'check_circle', iconColor: 'text-[var(--color-secondary)]', iconBg: 'bg-[var(--color-secondary-container)]' },
  advance_rejected: { icon: 'cancel', iconColor: 'text-[var(--color-error)]', iconBg: 'bg-[var(--color-error-container)]' },
  advance_paid:     { icon: 'payments', iconColor: 'text-[var(--color-secondary)]', iconBg: 'bg-[var(--color-secondary-container)]' },
  default:          { icon: 'notifications', iconColor: 'text-[var(--color-primary)]', iconBg: 'bg-[var(--color-primary-fixed)]' },
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora mismo'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} día${days > 1 ? 's' : ''}`
}

function NotificationsSkeleton() {
  return (
    <Card className="divide-y divide-[var(--color-surface-container-low)]">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40 rounded-full" />
            <Skeleton className="h-3 w-56 rounded-full" />
            <Skeleton className="h-2.5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </Card>
  )
}

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
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications(data ?? [])
      setLoading(false)

      // Mark all as read
      if (data?.length) {
        const unread = data.filter((n) => !n.read).map((n) => n.id)
        if (unread.length) {
          await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', unread)
        }
      }
    }
    load()
  }, [])

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Notificaciones" />

      <div className="px-4 pb-safe">
        {loading ? (
          <NotificationsSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <Card className="divide-y divide-[var(--color-surface-container-low)]">
            {notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.default
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 transition-colors active:bg-[var(--color-surface-container-low)] ${!n.read ? 'bg-[var(--color-primary-fixed)]/30' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.iconBg}`}>
                    <span className={`material-symbols-outlined text-lg ${cfg.iconColor}`}
                      style={{ fontVariationSettings: '"FILL" 1' }}>
                      {cfg.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-on-surface)]">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-[var(--color-outline)] mt-1.5">{relativeTime(n.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </Card>
        )}
      </div>
    </div>
  )
}
