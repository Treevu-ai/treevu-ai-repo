import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { useCompanyStore } from '../../store/useCompanyStore'
import { useAuthStore, MOCK_AUTH } from '../../store/useAuthStore'
import { KpiCard } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import TopBar from '../../components/layout/TopBar'
import { currency, dateTime, relativeTime } from '../../utils/format'

// Build chart data: advances per day this month
function buildChartData(advances) {
  const days = {}
  const today = new Date()
  for (let d = 1; d <= today.getDate(); d++) {
    const key = `${String(d).padStart(2,'0')}/03`
    days[key] = { date: key, count: 0, total: 0 }
  }
  advances.forEach(a => {
    if (!a.requested_at) return
    const d = new Date(a.requested_at)
    const key = `${String(d.getDate()).padStart(2,'0')}/03`
    if (days[key]) {
      days[key].count++
      days[key].total += a.amount
    }
  })
  return Object.values(days)
}

const STATUS_ICONS = {
  requested:  { icon: 'schedule',      color: 'text-[#d97706]' },
  approved:   { icon: 'check_circle',  color: 'text-[#2563eb]' },
  processing: { icon: 'progress_activity', color: 'text-[#7c3aed]' },
  paid:       { icon: 'payments',      color: 'text-[#16a34a]' },
  rejected:   { icon: 'cancel',        color: 'text-[#dc2626]' },
}

export default function Overview() {
  const { advances, employees, cycle, loading } = useCompanyStore()
  const { company } = useAuthStore()
  const co = company ?? MOCK_AUTH.company

  const activeEmps    = employees.filter(e => e.active)
  const ewaEnabled    = employees.filter(e => e.active && e.ewa_enabled)
  const nonRejected   = advances.filter(a => a.status !== 'rejected')
  const totalDisbursed = advances.filter(a => a.status === 'paid').reduce((s,a) => s+a.amount, 0)
  const pending        = advances.filter(a => a.status === 'requested')
  const adoptionPct    = ewaEnabled.length > 0
    ? Math.round((new Set(advances.map(a => a.employee_id)).size / ewaEnabled.length) * 100)
    : 0

  const chartData     = useMemo(() => buildChartData(advances), [advances])
  const recentAdvances = [...advances].sort((a,b) => new Date(b.requested_at) - new Date(a.requested_at)).slice(0, 8)

  // Dept distribution
  const deptMap = {}
  employees.forEach(e => {
    if (!e.department) return
    deptMap[e.department] = (deptMap[e.department] ?? 0) + 1
  })
  const deptData = Object.entries(deptMap).map(([dept, count]) => ({ dept, count }))

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Resumen" />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Empleados activos"
            value={activeEmps.length}
            subtext={`${ewaEnabled.length} con EWA habilitado`}
            icon="group"
            color="primary"
          />
          <KpiCard
            label="Avances este mes"
            value={nonRejected.length}
            subtext={`${pending.length} pendiente${pending.length !== 1 ? 's' : ''} de acción`}
            icon="payments"
            color={pending.length > 0 ? 'warning' : 'success'}
          />
          <KpiCard
            label="Total desembolsado"
            value={currency(totalDisbursed)}
            subtext="Ciclo actual"
            icon="account_balance_wallet"
            color="success"
          />
          <KpiCard
            label="Adopción EWA"
            value={`${adoptionPct}%`}
            subtext={`${new Set(advances.map(a=>a.employee_id)).size} empleados usaron EWA`}
            icon="trending_up"
            color="primary"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Area chart */}
          <div className="col-span-2 bg-white rounded-[12px] border border-[#e2e5ec] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-[#111827] text-sm">Avances por día</h3>
                <p className="text-xs text-[#6b7280]">Marzo 2026</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#000666]" />
                <span className="text-xs text-[#6b7280]">Solicitudes</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#000666" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#000666" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e5ec' }}
                  formatter={(v, n) => [n === 'total' ? currency(v) : v, n === 'total' ? 'Total PEN' : 'Avances']}
                />
                <Area type="monotone" dataKey="count" stroke="#000666" strokeWidth={2} fill="url(#grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart dept */}
          <div className="bg-white rounded-[12px] border border-[#e2e5ec] p-5">
            <h3 className="font-display font-bold text-[#111827] text-sm mb-1">Por departamento</h3>
            <p className="text-xs text-[#6b7280] mb-4">Empleados activos</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: '#4b5563' }} tickLine={false} axisLine={false} width={60} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#000666" radius={[0,4,4,0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent advances */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e5ec]">
            <h3 className="font-display font-bold text-[#111827] text-sm">Actividad reciente</h3>
            <a href="/advances" className="text-xs text-[#000666] hover:underline font-medium">Ver todos →</a>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-[#6b7280]">Cargando...</div>
          ) : recentAdvances.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#9ca3af]">Sin actividad este mes</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f1f3f7]">
                  {['Empleado','Monto','Estado','Método','Hace'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAdvances.map(adv => {
                  const emp = employees.find(e => e.id === adv.employee_id)
                  const si  = STATUS_ICONS[adv.status] ?? STATUS_ICONS.paid
                  return (
                    <tr key={adv.id} className="border-b border-[#f9fafb] hover:bg-[#f8f9fb] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#eef0ff] flex items-center justify-center shrink-0">
                            <span className="text-[#000666] text-[10px] font-bold">
                              {emp?.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() ?? '??'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-[#111827]">{emp?.name ?? 'Empleado'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-[#111827]">{currency(adv.amount)}</td>
                      <td className="px-5 py-3"><Badge value={adv.status} /></td>
                      <td className="px-5 py-3">
                        {adv.disbursement_method
                          ? <Badge value={adv.disbursement_method} />
                          : <span className="text-[#9ca3af] text-sm">—</span>
                        }
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6b7280]">{relativeTime(adv.requested_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Cycle info */}
        {cycle && (
          <div className="flex items-center gap-3 p-4 rounded-[10px] bg-[#eef0ff] border border-[#c7d2fe]">
            <span className="material-symbols-outlined icon-filled text-[22px] text-[#000666]">calendar_month</span>
            <div>
              <p className="text-sm font-semibold text-[#000666]">Ciclo activo: {cycle.period_start} → {cycle.period_end}</p>
              <p className="text-xs text-[#4b5563]">Día de pago: {cycle.payday} · Límite EWA: {co.ewa_limit_pct}% del salario devengado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
