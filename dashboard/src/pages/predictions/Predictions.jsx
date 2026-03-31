import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useCompanyStore } from '../../store/useCompanyStore'
import { KpiCard } from '../../components/ui/Card'
import TopBar from '../../components/layout/TopBar'
import { currency } from '../../utils/format'

// ── Mock ML output (deterministic) ───────────────────────────────────────────

const FORECAST = [
  { date: '01/04', count: 1, amount: 550  },
  { date: '02/04', count: 0, amount: 0    },
  { date: '03/04', count: 1, amount: 420  },
  { date: '04/04', count: 2, amount: 950  },
  { date: '05/04', count: 0, amount: 0    },
  { date: '06/04', count: 0, amount: 0    },
  { date: '07/04', count: 1, amount: 600  },
  { date: '08/04', count: 2, amount: 1100 },
  { date: '09/04', count: 1, amount: 480  },
  { date: '10/04', count: 0, amount: 0    },
  { date: '11/04', count: 1, amount: 700  },
  { date: '12/04', count: 0, amount: 0    },
  { date: '13/04', count: 0, amount: 0    },
  { date: '14/04', count: 1, amount: 520  },
  { date: '15/04', count: 1, amount: 430  },
]

const RISK_SCORES = {
  'emp-1': { score: 22, level: 'low',    reason: 'Historial de repago consistente, 2 adelantos pagados a tiempo' },
  'emp-2': { score: 14, level: 'low',    reason: 'Salario alto, baja frecuencia de uso relativa al límite' },
  'emp-3': { score: 52, level: 'medium', reason: 'Adelanto en procesamiento aún pendiente de cierre de ciclo' },
  'emp-4': { score: 18, level: 'low',    reason: 'Sin historial EWA, riesgo bajo por defecto' },
  'emp-5': { score: 44, level: 'medium', reason: 'Solicitud pendiente de aprobación, sin historial previo' },
  'emp-6': { score: 61, level: 'high',   reason: 'Intentó solicitar monto que supera el límite del ciclo (rechazado)' },
  'emp-7': { score: 33, level: 'low',    reason: 'Adelanto aprobado dentro de límites normales' },
  'emp-8': { score: 8,  level: 'low',    reason: 'Empleado inactivo, sin actividad EWA registrada' },
}

const ADOPTION_SCORES = {
  'emp-4': { score: 72, reasons: ['Depto. Logística con 0% adopción — potencial alto', 'Salario alineado con perfil típico de usuario EWA', 'Antigüedad > 1 año'] },
  'emp-8': { score: 11, reasons: ['Empleado inactivo — adopción improbable en estado actual'] },
}

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

// Deriva predicciones dinámicamente del historial real de adelantos
function buildNextRequests(employees, advances) {
  return employees
    .filter(e => e.active && e.ewa_enabled)
    .map(emp => {
      const history = advances.filter(
        a => a.employee_id === emp.id && a.status !== 'rejected'
      )
      if (history.length === 0) return null

      // Monto: promedio del historial, redondeado a 50
      const avgRaw = history.reduce((s, a) => s + a.amount, 0) / history.length
      const amount = Math.round(avgRaw / 50) * 50

      // Fecha: mismo día promedio del ciclo → proyectar en abril 2026
      const avgDay = Math.round(
        history.reduce((s, a) => s + new Date(a.requested_at).getDate(), 0) / history.length
      )
      const d = new Date(2026, 3, Math.min(avgDay, 30))
      const date = `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`

      // Confianza: sube con más historial, techo 85%
      const confidence = Math.min(50 + history.length * 15, 85)

      // Base textual
      const basis = history.length >= 2
        ? `Promedio de ${history.length} adelantos (${history.map(a => `S/${a.amount}`).join(', ')})`
        : `Primera solicitud del ciclo (S/${history[0].amount})`

      return { emp_id: emp.id, date, amount, confidence, basis }
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date))
}

const ANOMALIES = [
  {
    id: 'anom-1',
    emp_id: 'emp-6',
    severity: 'high',
    icon: 'warning',
    title: 'Monto anormalmente alto',
    description: 'Pedro Ccopa solicitó S/ 1,200 (≈80% del límite del ciclo). Promedio del equipo este mes: S/ 583. Desviación estándar: 2.4σ.',
    action: 'Revisar política de límites para rol Gerencia',
  },
  {
    id: 'anom-2',
    emp_id: 'emp-1',
    severity: 'medium',
    icon: 'notifications_active',
    title: 'Frecuencia elevada de solicitudes',
    description: 'Ana García realizó 2 solicitudes en el ciclo actual (promedio equipo: 1.1). Mismo patrón observado en los últimos 2 ciclos.',
    action: 'Monitorear en el próximo ciclo — posible dependencia de liquidez',
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function RiskBadge({ level }) {
  const styles = {
    low:    'bg-[#dcfce7] text-[#15803d]',
    medium: 'bg-[#fef3c7] text-[#92400e]',
    high:   'bg-[#fee2e2] text-[#991b1b]',
  }
  const labels = { low: 'Bajo', medium: 'Medio', high: 'Alto' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[level] ?? 'bg-[#f1f3f7] text-[#4b5563]'}`}>
      {labels[level] ?? level}
    </span>
  )
}

function ScoreBar({ score }) {
  const color = score >= 60 ? '#dc2626' : score >= 40 ? '#d97706' : '#16a34a'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-[#e2e5ec] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-[#374151]">{score}</span>
    </div>
  )
}

function ConfidenceBar({ pct }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#e2e5ec] rounded-full overflow-hidden">
        <div className="h-full bg-[#000666] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#6b7280]">{pct}%</span>
    </div>
  )
}

function Avatar({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-7 h-7 rounded-full bg-[#eef0ff] flex items-center justify-center shrink-0">
      <span className="text-[#000666] text-[10px] font-bold">{initials}</span>
    </div>
  )
}

const TH_CLASS = 'px-5 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide'
const TR_CLASS = 'border-b border-[#f9fafb] hover:bg-[#f8f9fb] transition-colors'
const TD_CLASS = 'px-5 py-3'

function SectionHeader({ icon, number, title, subtitle }) {
  return (
    <div className="px-5 py-4 border-b border-[#e2e5ec]">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-[#000666]">{icon}</span>
        <h3 className="font-display font-bold text-[#111827] text-sm">{number}. {title}</h3>
      </div>
      {subtitle && <p className="text-xs text-[#6b7280] mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Predictions() {
  const { employees, advances } = useCompanyStore()

  const nonEwaEmployees   = employees.filter(e => e.active && !e.ewa_enabled)
  const activeEmployees   = employees.filter(e => e.active)
  const nextRequests      = buildNextRequests(employees, advances)
  const highRiskCount     = Object.values(RISK_SCORES).filter(r => r.level === 'high').length
  const forecastTotal     = FORECAST.reduce((s, d) => s + d.count, 0)
  const forecastAmount    = FORECAST.reduce((s, d) => s + d.amount, 0)
  const adoptionCandidates = nonEwaEmployees.filter(e => (ADOPTION_SCORES[e.id]?.score ?? 0) >= 50)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Predicciones IA" />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Model banner */}
        <div className="flex items-center justify-between p-4 rounded-[10px] bg-[#eef0ff] border border-[#c7d2fe]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined icon-filled text-[22px] text-[#000666]">psychology</span>
            <div>
              <p className="text-sm font-semibold text-[#000666]">Modelo predictivo v2.1 — Entrenado con datos EWA LATAM</p>
              <p className="text-xs text-[#4b5563]">Actualizado 30 mar 2026 · Confianza promedio del ciclo: 78% · Predicciones para abril 2026</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] text-xs font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
            Activo
          </span>
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Adelantos previstos"
            value={forecastTotal}
            subtext={`${currency(forecastAmount)} estimado próx. 15 días`}
            icon="trending_up"
            color="primary"
          />
          <KpiCard
            label="Empleados riesgo alto"
            value={highRiskCount}
            subtext="Revisar antes de aprobar"
            icon="warning"
            color={highRiskCount > 0 ? 'error' : 'success'}
          />
          <KpiCard
            label="Listos para EWA"
            value={adoptionCandidates.length}
            subtext="Sin EWA, alta propensión"
            icon="person_add"
            color="success"
          />
          <KpiCard
            label="Anomalías detectadas"
            value={ANOMALIES.length}
            subtext="Ver sección 5 abajo"
            icon="notifications_active"
            color="warning"
          />
        </div>

        {/* ── 1. Demanda próximo ciclo ── */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec]">
          <SectionHeader
            icon="insights"
            number={1}
            title="Demanda próximo ciclo"
            subtitle="Proyección de solicitudes de adelanto para los primeros 15 días de abril 2026"
          />
          <div className="px-5 pt-4 pb-1 flex gap-8 justify-end border-b border-[#f1f3f7]">
            {[
              { label: 'Adelantos previstos', value: forecastTotal, color: 'text-[#111827]' },
              { label: 'Monto estimado',      value: currency(forecastAmount), color: 'text-[#111827]' },
              { label: 'Confianza',           value: '82%', color: 'text-[#16a34a]' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-right pb-3">
                <p className="text-xs text-[#6b7280]">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={FORECAST} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#000666" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#000666" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e5ec' }}
                  formatter={(v, n) => [n === 'amount' ? currency(v) : v, n === 'amount' ? 'Monto PEN' : 'Solicitudes']}
                />
                <Area type="monotone" dataKey="count" stroke="#000666" strokeWidth={2} strokeDasharray="5 3" fill="url(#forecastGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-[#9ca3af] mt-1 text-center">Línea punteada = proyección · Basado en patrones históricos del equipo</p>
          </div>
        </div>

        {/* ── 2. Riesgo de impago ── */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec]">
          <SectionHeader
            icon="shield"
            number={2}
            title="Riesgo de impago por empleado"
            subtitle="Score 0–100: probabilidad de que el adelanto no sea cubierto íntegramente por el salario del ciclo"
          />
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f1f3f7]">
                {['Empleado', 'Departamento', 'Score de riesgo', 'Nivel', 'Justificación del modelo'].map(h => (
                  <th key={h} className={TH_CLASS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeEmployees
                .sort((a, b) => (RISK_SCORES[b.id]?.score ?? 0) - (RISK_SCORES[a.id]?.score ?? 0))
                .map(emp => {
                  const risk = RISK_SCORES[emp.id] ?? { score: 20, level: 'low', reason: 'Sin datos suficientes' }
                  return (
                    <tr key={emp.id} className={TR_CLASS}>
                      <td className={TD_CLASS}>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={emp.name} />
                          <span className="text-sm font-medium text-[#111827]">{emp.name}</span>
                        </div>
                      </td>
                      <td className={`${TD_CLASS} text-sm text-[#6b7280]`}>{emp.department}</td>
                      <td className={TD_CLASS}><ScoreBar score={risk.score} /></td>
                      <td className={TD_CLASS}><RiskBadge level={risk.level} /></td>
                      <td className={`${TD_CLASS} text-xs text-[#6b7280] max-w-[300px]`}>{risk.reason}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {/* ── 3. Propensión a adoptar EWA ── */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec]">
          <SectionHeader
            icon="person_add"
            number={3}
            title="Propensión a adoptar EWA"
            subtitle="Empleados sin EWA activado ordenados por probabilidad de uso si se habilita"
          />
          {nonEwaEmployees.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#9ca3af]">Todos los empleados activos ya tienen EWA habilitado</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f1f3f7]">
                  {['Empleado', 'Departamento', 'Salario base', 'Propensión', 'Señales del modelo'].map(h => (
                    <th key={h} className={TH_CLASS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nonEwaEmployees
                  .sort((a, b) => (ADOPTION_SCORES[b.id]?.score ?? 0) - (ADOPTION_SCORES[a.id]?.score ?? 0))
                  .map(emp => {
                    const adoption = ADOPTION_SCORES[emp.id] ?? { score: 30, reasons: ['Datos insuficientes para proyección'] }
                    return (
                      <tr key={emp.id} className={TR_CLASS}>
                        <td className={TD_CLASS}>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={emp.name} />
                            <span className="text-sm font-medium text-[#111827]">{emp.name}</span>
                          </div>
                        </td>
                        <td className={`${TD_CLASS} text-sm text-[#6b7280]`}>{emp.department}</td>
                        <td className={`${TD_CLASS} text-sm text-[#111827]`}>{currency(emp.base_salary)}</td>
                        <td className={TD_CLASS}><ConfidenceBar pct={adoption.score} /></td>
                        <td className={TD_CLASS}>
                          <ul className="space-y-0.5">
                            {adoption.reasons.map((r, i) => (
                              <li key={i} className="text-xs text-[#6b7280] flex items-start gap-1">
                                <span className="text-[#000666] mt-0.5 shrink-0">·</span> {r}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── 4. Próxima solicitud esperada ── */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec]">
          <SectionHeader
            icon="calendar_clock"
            number={4}
            title="Próxima solicitud esperada"
            subtitle="Predicción de cuándo y por cuánto solicitará cada empleado activo con EWA en el próximo ciclo"
          />
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f1f3f7]">
                {['Empleado', 'Fecha estimada', 'Monto estimado', 'Confianza', 'Base del modelo'].map(h => (
                  <th key={h} className={TH_CLASS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nextRequests.map(req => {
                const emp = employees.find(e => e.id === req.emp_id)
                if (!emp) return null
                return (
                  <tr key={req.emp_id} className={TR_CLASS}>
                    <td className={TD_CLASS}>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.name} />
                        <span className="text-sm font-medium text-[#111827]">{emp.name}</span>
                      </div>
                    </td>
                    <td className={TD_CLASS}>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-[#000666]">event</span>
                        <span className="text-sm text-[#111827]">{req.date}</span>
                      </div>
                    </td>
                    <td className={`${TD_CLASS} text-sm font-semibold text-[#111827]`}>{currency(req.amount)}</td>
                    <td className={TD_CLASS}><ConfidenceBar pct={req.confidence} /></td>
                    <td className={`${TD_CLASS} text-xs text-[#6b7280]`}>{req.basis}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── 5. Anomalías ── */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec]">
          <SectionHeader
            icon="policy"
            number={5}
            title="Anomalías detectadas"
            subtitle="Patrones inusuales identificados por el modelo en el ciclo actual"
          />
          <div className="p-5 space-y-3">
            {ANOMALIES.map(anom => {
              const emp = employees.find(e => e.id === anom.emp_id)
              const isHigh = anom.severity === 'high'
              return (
                <div
                  key={anom.id}
                  className={`flex items-start gap-4 p-4 rounded-[10px] border ${
                    isHigh ? 'bg-[#fff7f7] border-[#fecaca]' : 'bg-[#fffbeb] border-[#fde68a]'
                  }`}
                >
                  <span className={`material-symbols-outlined icon-filled text-[22px] shrink-0 ${isHigh ? 'text-[#dc2626]' : 'text-[#d97706]'}`}>
                    {anom.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-semibold ${isHigh ? 'text-[#991b1b]' : 'text-[#92400e]'}`}>{anom.title}</p>
                      {emp && <span className="text-xs text-[#6b7280]">— {emp.name}</span>}
                    </div>
                    <p className="text-xs text-[#4b5563]">{anom.description}</p>
                    <p className={`text-xs font-medium mt-2 ${isHigh ? 'text-[#dc2626]' : 'text-[#d97706]'}`}>
                      Acción sugerida: {anom.action}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isHigh ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-[#fef3c7] text-[#92400e]'
                  }`}>
                    {isHigh ? 'Severidad alta' : 'Severidad media'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
