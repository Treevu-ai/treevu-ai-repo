import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useCompanyStore } from '../../store/useCompanyStore'
import { useAuthStore, MOCK_AUTH } from '../../store/useAuthStore'
import { KpiCard } from '../../components/ui/Card'
import TopBar from '../../components/layout/TopBar'
import { currency, initials } from '../../utils/format'

// ── Industry constants ────────────────────────────────────────────────────────
const ANNUAL_TURNOVER_RATE = 0.30   // 30% — retail LATAM benchmark
const EWA_RETENTION_LIFT  = 0.25   // EWA reduces turnover ~25% (research-backed)
const REPLACEMENT_MONTHS  = 4      // avg cost to replace 1 employee = 4 months salary
const CONSUMER_CREDIT_TEA = 0.48   // 48% TEA — tasa promedio crédito de consumo Perú

// ── Mock historical adoption trend (6 months) ────────────────────────────────
const TREND = [
  { month: 'Oct 25', users: 2, advances: 3,  amount: 1800 },
  { month: 'Nov 25', users: 3, advances: 5,  amount: 2900 },
  { month: 'Dic 25', users: 4, advances: 7,  amount: 4200 },
  { month: 'Ene 26', users: 5, advances: 9,  amount: 5100 },
  { month: 'Feb 26', users: 6, advances: 11, amount: 6800 },
  { month: 'Mar 26', users: 6, advances: 8,  amount: 5550 },
]

function WellnessBar({ pct, label }) {
  const color = pct >= 70 ? '#dc2626' : pct >= 40 ? '#d97706' : '#16a34a'
  const level = pct >= 70 ? 'Alto uso' : pct >= 40 ? 'Uso moderado' : 'Uso bajo'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#374151]">{label}</span>
          <span className="font-semibold" style={{ color }}>{level} — {pct}%</span>
        </div>
        <div className="h-2 bg-[#e2e5ec] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  )
}

export default function Impact() {
  const { employees, advances } = useCompanyStore()
  const { company } = useAuthStore()
  const co = company ?? MOCK_AUTH.company

  const ewaUsers     = employees.filter(e => e.active && e.ewa_enabled)
  const activeEmps   = employees.filter(e => e.active)
  const avgSalary    = ewaUsers.length
    ? ewaUsers.reduce((s, e) => s + e.base_salary, 0) / ewaUsers.length
    : 0

  // ROI: retention
  const retainedPerYear    = ewaUsers.length * ANNUAL_TURNOVER_RATE * EWA_RETENTION_LIFT
  const replacementCost    = avgSalary * REPLACEMENT_MONTHS
  const annualSaving       = Math.round(retainedPerYear * replacementCost)
  const adoptionPct        = activeEmps.length ? Math.round(ewaUsers.length / activeEmps.length * 100) : 0

  // Intereses evitados para empleados
  const totalDisbursed     = advances.filter(a => ['paid','processing','approved'].includes(a.status))
                                     .reduce((s, a) => s + a.amount, 0)
  const monthlyRate        = CONSUMER_CREDIT_TEA / 12
  const interestAvoided    = Math.round(totalDisbursed * monthlyRate)
  const interestAvoidedYear = interestAvoided * 12

  // Per-employee wellness (% of available limit used)
  const wellnessData = ewaUsers.map(emp => {
    const used = advances
      .filter(a => a.employee_id === emp.id && ['approved','processing','paid'].includes(a.status))
      .reduce((s, a) => s + a.amount, 0)
    const pct = emp.earnedWage > 0
      ? Math.round(used / (emp.earnedWage * (co.ewa_limit_pct / 100)) * 100)
      : 0
    return { emp, pct: Math.min(pct, 100) }
  }).sort((a, b) => b.pct - a.pct)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Impacto Empresarial" />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Header note */}
        <div className="flex items-center gap-3 p-4 rounded-[10px] bg-[#eef0ff] border border-[#c7d2fe]">
          <span className="material-symbols-outlined icon-filled text-[22px] text-[#000666]">emoji_objects</span>
          <div>
            <p className="text-sm font-semibold text-[#000666]">¿Cuánto vale EWA para tu empresa?</p>
            <p className="text-xs text-[#4b5563]">
              Estimaciones basadas en benchmarks de retención LATAM retail y tasas de crédito de consumo en Perú (48% TEA).
              Costo del programa EWA para la empresa: <strong>S/ 0.00</strong>.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Adopción EWA"
            value={`${adoptionPct}%`}
            subtext={`${ewaUsers.length} de ${activeEmps.length} empleados activos`}
            icon="group"
            color="primary"
          />
          <KpiCard
            label="Ahorro anual estimado"
            value={currency(annualSaving)}
            subtext={`↓${Math.round(ANNUAL_TURNOVER_RATE * EWA_RETENTION_LIFT * 100)}% rotación estimada`}
            icon="savings"
            color="success"
          />
          <KpiCard
            label="Intereses evitados / mes"
            value={currency(interestAvoided)}
            subtext="Vs. crédito consumo 48% TEA"
            icon="percent"
            color="primary"
          />
          <KpiCard
            label="Costo EWA para empresa"
            value="S/ 0"
            subtext="Modelo de descuento en nómina"
            icon="currency_exchange"
            color="success"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Adoption trend */}
          <div className="col-span-2 bg-white rounded-[12px] border border-[#e2e5ec] p-5">
            <h3 className="font-display font-bold text-[#111827] text-sm mb-0.5">Tendencia de adopción EWA</h3>
            <p className="text-xs text-[#6b7280] mb-4">Usuarios activos y adelantos desembolsados — últimos 6 meses</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f7" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e5ec' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="users"    stroke="#000666" strokeWidth={2} dot={{ r: 3 }} name="Usuarios EWA" />
                <Line type="monotone" dataKey="advances" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} name="Adelantos" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ROI breakdown */}
          <div className="bg-white rounded-[12px] border border-[#e2e5ec] p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-[#111827] text-sm mb-1">Cálculo de ahorro</h3>
              <p className="text-xs text-[#6b7280] mb-4">Retención de talento — metodología</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Empleados con EWA',       val: ewaUsers.length },
                { label: 'Rotación anual (industria)', val: `${ANNUAL_TURNOVER_RATE * 100}%` },
                { label: 'Mejora retención con EWA',  val: `${EWA_RETENTION_LIFT * 100}%` },
                { label: 'Empleados retenidos/año',   val: retainedPerYear.toFixed(1) },
                { label: 'Costo reemplazo promedio',  val: currency(replacementCost) },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-[#6b7280]">{label}</span>
                  <span className="text-xs font-semibold text-[#111827]">{val}</span>
                </div>
              ))}
              <div className="border-t border-[#e2e5ec] pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-[#000666]">Ahorro estimado/año</span>
                <span className="text-sm font-bold text-[#16a34a]">{currency(annualSaving)}</span>
              </div>
            </div>
            <p className="text-[10px] text-[#9ca3af] mt-3">Fuente: Mercer LATAM 2024, BCRP tasas activas</p>
          </div>
        </div>

        {/* Desembolso mensual trend */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec] p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-[#111827] text-sm">Adelantos desembolsados por mes</h3>
              <p className="text-xs text-[#6b7280]">Monto total en PEN — últimos 6 meses</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6b7280]">Intereses evitados acumulado (est.)</p>
              <p className="text-lg font-bold text-[#16a34a]">{currency(interestAvoidedYear)}<span className="text-xs font-normal text-[#6b7280]">/año</span></p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f7" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e5ec' }}
                formatter={v => [currency(v), 'Desembolsado']}
              />
              <Bar dataKey="amount" fill="#000666" radius={[4,4,0,0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee wellness */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec]">
          <div className="px-5 py-4 border-b border-[#e2e5ec]">
            <h3 className="font-display font-bold text-[#111827] text-sm">Bienestar financiero por empleado</h3>
            <p className="text-xs text-[#6b7280] mt-0.5">
              % del límite EWA utilizado este ciclo — alta utilización puede indicar estrés financiero
            </p>
          </div>
          <div className="p-5 space-y-4">
            {wellnessData.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-4">Sin datos de uso este ciclo</p>
            ) : (
              wellnessData.map(({ emp, pct }) => (
                <div key={emp.id} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#eef0ff] flex items-center justify-center shrink-0">
                    <span className="text-[#000666] text-[10px] font-bold">{initials(emp.name)}</span>
                  </div>
                  <div className="flex-1">
                    <WellnessBar pct={pct} label={`${emp.name} — ${emp.position}`} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 pb-4 flex gap-4 text-xs text-[#6b7280]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#16a34a]"/>Uso bajo (&lt;40%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#d97706]"/>Uso moderado (40–70%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#dc2626]"/>Alto uso (&gt;70%)</span>
          </div>
        </div>

        {/* Scale projection */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec] p-5">
          <h3 className="font-display font-bold text-[#111827] text-sm mb-1">Proyección a escala</h3>
          <p className="text-xs text-[#6b7280] mb-4">¿Cuánto ahorrarías con más empleados en EWA?</p>
          <div className="grid grid-cols-4 gap-3">
            {[50, 100, 250, 500].map(n => {
              const saving = Math.round(n * ANNUAL_TURNOVER_RATE * EWA_RETENTION_LIFT * replacementCost)
              return (
                <div key={n} className="p-4 rounded-[10px] bg-[#f8f9fb] border border-[#e2e5ec] text-center">
                  <p className="text-xs text-[#6b7280] mb-1">{n} empleados</p>
                  <p className="font-display font-bold text-[#000666] text-lg">{currency(saving)}</p>
                  <p className="text-[10px] text-[#9ca3af] mt-0.5">ahorro/año estimado</p>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
