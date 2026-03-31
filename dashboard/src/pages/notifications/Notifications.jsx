import { useNavigate } from 'react-router-dom'
import { useCompanyStore } from '../../store/useCompanyStore'
import TopBar from '../../components/layout/TopBar'
import { currency, relativeTime, dateShort } from '../../utils/format'

export function useNotifications() {
  const { advances, employees, cycle } = useCompanyStore()

  const items = []

  // Pending advances older than 24h
  const now = Date.now()
  advances
    .filter(a => a.status === 'requested')
    .forEach(a => {
      const hrs = (now - new Date(a.requested_at).getTime()) / 3600000
      if (hrs > 24) {
        const emp = employees.find(e => e.id === a.employee_id)
        items.push({
          id: `pending-${a.id}`,
          type: 'pending',
          severity: 'high',
          icon: 'schedule',
          title: 'Solicitud pendiente sin atender',
          body: `${emp?.name ?? 'Empleado'} esperando respuesta — ${currency(a.amount)} (${Math.floor(hrs)}h sin acción)`,
          link: '/advances',
          linkLabel: 'Ver en Avances',
          time: a.requested_at,
        })
      }
    })

  // Cycle closing in ≤5 days
  if (cycle?.period_end) {
    const daysLeft = Math.ceil((new Date(cycle.period_end) - new Date()) / 86400000)
    if (daysLeft >= 0 && daysLeft <= 5) {
      items.push({
        id: 'cycle-closing',
        type: 'cycle',
        severity: daysLeft <= 1 ? 'high' : 'medium',
        icon: 'calendar_month',
        title: daysLeft === 0 ? 'El ciclo cierra hoy' : `El ciclo cierra en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`,
        body: `Período ${cycle.period_start} → ${cycle.period_end}. Exportá el reporte para descontar en planilla.`,
        link: '/',
        linkLabel: 'Ir a Resumen',
        time: null,
      })
    }
  }

  // Employees never used EWA (adoption opportunity)
  const neverUsed = employees.filter(e =>
    e.active && e.ewa_enabled &&
    !advances.some(a => a.employee_id === e.id)
  )
  if (neverUsed.length > 0) {
    items.push({
      id: 'never-used',
      type: 'info',
      severity: 'low',
      icon: 'person_add',
      title: `${neverUsed.length} empleado${neverUsed.length !== 1 ? 's' : ''} con EWA activo sin usar`,
      body: `${neverUsed.map(e => e.name.split(' ')[0]).join(', ')} tienen EWA habilitado pero nunca lo usaron. Considerá comunicarles el beneficio.`,
      link: '/employees',
      linkLabel: 'Ver empleados',
      time: null,
    })
  }

  return items
}

const SEVERITY_STYLES = {
  high:   { bar: 'bg-[#dc2626]', bg: 'bg-[#fff7f7]', border: 'border-[#fecaca]', icon: 'text-[#dc2626]', title: 'text-[#991b1b]' },
  medium: { bar: 'bg-[#d97706]', bg: 'bg-[#fffbeb]', border: 'border-[#fde68a]', icon: 'text-[#d97706]', title: 'text-[#92400e]' },
  low:    { bar: 'bg-[#000666]', bg: 'bg-[#eef0ff]', border: 'border-[#c7d2fe]', icon: 'text-[#000666]', title: 'text-[#1e3a8a]' },
}

export default function Notifications() {
  const navigate = useNavigate()
  const items = useNotifications()

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Notificaciones" />

      <div className="flex-1 p-6 space-y-3 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined icon-filled text-[48px] text-[#d1d5db] mb-3">notifications_off</span>
            <p className="text-sm font-semibold text-[#374151]">Sin notificaciones pendientes</p>
            <p className="text-xs text-[#9ca3af] mt-1">Todo en orden por ahora</p>
          </div>
        ) : (
          items.map(item => {
            const s = SEVERITY_STYLES[item.severity]
            return (
              <div key={item.id} className={`flex rounded-[12px] border overflow-hidden ${s.bg} ${s.border}`}>
                <div className={`w-1 shrink-0 ${s.bar}`} />
                <div className="flex items-start gap-4 p-4 flex-1">
                  <span className={`material-symbols-outlined icon-filled text-[22px] shrink-0 mt-0.5 ${s.icon}`}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${s.title}`}>{item.title}</p>
                    <p className="text-xs text-[#4b5563] mt-0.5">{item.body}</p>
                    {item.time && (
                      <p className="text-[10px] text-[#9ca3af] mt-1">{relativeTime(item.time)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(item.link)}
                    className="shrink-0 text-xs font-semibold text-[#000666] hover:underline whitespace-nowrap"
                  >
                    {item.linkLabel} →
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
