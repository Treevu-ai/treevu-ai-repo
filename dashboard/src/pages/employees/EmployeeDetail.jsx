import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCompanyStore } from '../../store/useCompanyStore'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input, { Select } from '../../components/ui/Input'
import TopBar from '../../components/layout/TopBar'
import { currency, dateShort, dateTime, initials } from '../../utils/format'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { employees, advances, updateEmployee } = useCompanyStore()
  const { show } = useToast()
  const [showEdit, setShowEdit] = useState(false)

  const emp = employees.find(e => e.id === id)
  if (!emp) return (
    <div className="p-8 text-center text-[#6b7280]">
      Empleado no encontrado. <button onClick={() => navigate('/employees')} className="text-[#000666] underline">Volver</button>
    </div>
  )

  const empAdvances = advances
    .filter(a => a.employee_id === id)
    .sort((a,b) => new Date(b.requested_at) - new Date(a.requested_at))

  const totalPaid = empAdvances.filter(a => a.status === 'paid').reduce((s,a) => s+a.amount, 0)
  const cycleUsed = empAdvances.filter(a => ['approved','processing','paid'].includes(a.status)).reduce((s,a)=>s+a.amount,0)

  function toggleEwa() {
    updateEmployee(id, { ewa_enabled: !emp.ewa_enabled })
    show({ message: emp.ewa_enabled ? 'EWA deshabilitado' : 'EWA habilitado', type: 'info' })
  }

  function toggleActive() {
    updateEmployee(id, { active: !emp.active })
    show({ message: emp.active ? 'Empleado desactivado' : 'Empleado activado', type: 'info' })
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={emp.name}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon="edit" onClick={() => setShowEdit(true)}>Editar</Button>
            <Button variant={emp.active ? 'ghost' : 'success'} onClick={toggleActive}>
              {emp.active ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Breadcrumb */}
        <button onClick={() => navigate('/employees')} className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#000666] transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver a Empleados
        </button>

        <div className="grid grid-cols-3 gap-5">
          {/* Profile */}
          <Card className="col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#eef0ff] flex items-center justify-center mb-3">
                <span className="text-[#000666] font-display font-bold text-xl">{initials(emp.name)}</span>
              </div>
              <h2 className="font-display font-bold text-[#111827] text-lg">{emp.name}</h2>
              <p className="text-sm text-[#6b7280]">{emp.position ?? 'Sin cargo'}</p>
              <p className="text-xs text-[#9ca3af]">{emp.department ?? 'Sin departamento'}</p>

              <div className="flex gap-2 mt-4">
                <Badge value={emp.active ? 'active' : 'inactive'} />
                {emp.ewa_enabled && <Badge value="approved" custom="EWA activo" />}
              </div>
            </div>

            <div className="border-t border-[#e2e5ec] mt-5 pt-4 space-y-2.5">
              {[
                { icon: 'badge',         label: 'DNI',      val: emp.dni ?? '—'    },
                { icon: 'phone',         label: 'Teléfono', val: emp.phone ?? '—'  },
                { icon: 'mail',          label: 'Email',    val: emp.email ?? '—'  },
                { icon: 'calendar_today',label: 'Ingreso',  val: dateShort(emp.start_date) },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9ca3af]">{icon}</span>
                  <div>
                    <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-[#111827] truncate">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e2e5ec] mt-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#374151] font-medium">EWA habilitado</span>
                <button onClick={toggleEwa}
                  className={`w-10 h-6 rounded-full flex items-center transition-colors ${emp.ewa_enabled ? 'bg-[#16a34a] justify-end pr-0.5' : 'bg-[#d1d5db] justify-start pl-0.5'}`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow" />
                </button>
              </div>
            </div>
          </Card>

          {/* EWA Status */}
          <div className="col-span-2 space-y-4">
            <Card>
              <h3 className="font-display font-bold text-[#111827] mb-4 text-sm">Estado EWA — Ciclo actual</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Salario base',    val: currency(emp.base_salary),  color: 'text-[#111827]' },
                  { label: 'Devengado',        val: currency(emp.earnedWage),   color: 'text-[#000666]' },
                  { label: 'Días trabajados',  val: `${emp.daysWorked}/${emp.totalDays}`, color: 'text-[#111827]' },
                  { label: 'Usado este ciclo', val: currency(cycleUsed),        color: cycleUsed > 0 ? 'text-[#d97706]' : 'text-[#111827]' },
                  { label: 'Disponible',       val: currency(emp.available),    color: 'text-[#16a34a]' },
                  { label: 'Total histórico',  val: currency(totalPaid),        color: 'text-[#111827]' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="p-3 rounded-[8px] bg-[#f8f9fb] border border-[#e2e5ec]">
                    <p className="text-xs text-[#6b7280] mb-1">{label}</p>
                    <p className={`font-display font-bold text-lg ${color}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[#6b7280] mb-1.5">
                  <span>Progreso del ciclo</span>
                  <span>{emp.daysWorked}/{emp.totalDays} días ({Math.round(emp.daysWorked/emp.totalDays*100)}%)</span>
                </div>
                <div className="w-full h-2 bg-[#e2e5ec] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#000666] rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(emp.daysWorked/emp.totalDays*100)}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Advance history */}
            <Card padding={false}>
              <div className="px-5 py-4 border-b border-[#e2e5ec]">
                <h3 className="font-display font-bold text-[#111827] text-sm">Historial de avances</h3>
              </div>
              {empAdvances.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#9ca3af]">Sin avances registrados</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f1f3f7]">
                      {['Monto','Estado','Método','Solicitado','Pagado'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {empAdvances.map(adv => (
                      <tr key={adv.id} className="border-b border-[#f9fafb]">
                        <td className="px-5 py-3 text-sm font-semibold text-[#111827]">{currency(adv.amount)}</td>
                        <td className="px-5 py-3"><Badge value={adv.status} /></td>
                        <td className="px-5 py-3">
                          {adv.disbursement_method ? <Badge value={adv.disbursement_method} /> : '—'}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#6b7280]">{dateTime(adv.requested_at)}</td>
                        <td className="px-5 py-3 text-sm text-[#6b7280]">{adv.paid_at ? dateTime(adv.paid_at) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditModal open={showEdit} onClose={() => setShowEdit(false)} emp={emp} />
    </div>
  )
}

function EditModal({ open, onClose, emp }) {
  const { updateEmployee } = useCompanyStore()
  const { show } = useToast()
  const [form, setForm] = useState({ ...emp })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    updateEmployee(emp.id, form)
    show({ message: 'Empleado actualizado', type: 'success' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Editar — ${emp.name}`}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} icon="save">Guardar cambios</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre completo" value={form.name} onChange={e => set('name', e.target.value)} containerClass="col-span-2" />
        <Input label="DNI"     value={form.dni   ?? ''} onChange={e => set('dni', e.target.value)} />
        <Input label="Teléfono" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
        <Input label="Email" type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} containerClass="col-span-2" />
        <Input label="Salario base (PEN)" type="number" value={form.base_salary} onChange={e => set('base_salary', parseFloat(e.target.value))} suffix="PEN" />
        <Input label="Cargo" value={form.position ?? ''} onChange={e => set('position', e.target.value)} />
      </div>
    </Modal>
  )
}
