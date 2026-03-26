import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompanyStore } from '../../store/useCompanyStore'
import { useAuthStore, MOCK_AUTH } from '../../store/useAuthStore'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input, { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import TopBar from '../../components/layout/TopBar'
import { currency, dateShort, initials } from '../../utils/format'
import { supabase } from '../../lib/supabase'

const DEPARTMENTS = ['Tienda','Caja','Logística','Gerencia','TI','RRHH','Finanzas','Operaciones']

function AddEmployeeModal({ open, onClose }) {
  const { addEmployee } = useCompanyStore()
  const { company } = useAuthStore()
  const co = company ?? MOCK_AUTH.company
  const { show } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', dni: '', phone: '', email: '',
    base_salary: '', position: '', department: DEPARTMENTS[0],
    ewa_enabled: true,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.name || !form.base_salary) {
      show({ message: 'Nombre y salario son obligatorios', type: 'error' }); return
    }
    setSaving(true)
    const emp = {
      id: crypto.randomUUID(),
      company_id: co.id,
      ...form,
      base_salary: parseFloat(form.base_salary),
      active: true,
      start_date: new Date().toISOString().slice(0,10),
    }

    if (import.meta.env.VITE_SUPABASE_URL) {
      const { data, error } = await supabase.from('employees').insert({
        ...emp,
        auth_user_id: null,
      }).select().single()
      if (error) {
        show({ message: error.message, type: 'error' })
        setSaving(false)
        return
      }
      addEmployee(data)
    } else {
      addEmployee(emp)
    }
    show({ message: `${emp.name} agregado correctamente`, type: 'success' })
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar empleado"
      size="md"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button loading={saving} onClick={handleSave} icon="person_add">Guardar</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre completo *" placeholder="Ana García"
          value={form.name} onChange={e => set('name', e.target.value)}
          containerClass="col-span-2"
        />
        <Input label="DNI" placeholder="45678901"
          value={form.dni} onChange={e => set('dni', e.target.value)}
        />
        <Input label="Teléfono" placeholder="+51987654321"
          value={form.phone} onChange={e => set('phone', e.target.value)}
        />
        <Input label="Email" type="email" placeholder="ana@empresa.pe"
          value={form.email} onChange={e => set('email', e.target.value)}
          containerClass="col-span-2"
        />
        <Input label="Salario base (PEN) *" type="number" placeholder="2400"
          value={form.base_salary} onChange={e => set('base_salary', e.target.value)}
          suffix="PEN"
        />
        <Input label="Cargo" placeholder="Vendedora"
          value={form.position} onChange={e => set('position', e.target.value)}
        />
        <Select label="Departamento"
          value={form.department} onChange={e => set('department', e.target.value)}
        >
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </Select>
        <div className="flex items-center gap-3 pt-5">
          <input
            type="checkbox"
            id="ewa_enabled"
            checked={form.ewa_enabled}
            onChange={e => set('ewa_enabled', e.target.checked)}
            className="w-4 h-4 accent-[#000666]"
          />
          <label htmlFor="ewa_enabled" className="text-sm text-[#374151]">Habilitar EWA</label>
        </div>
      </div>
    </Modal>
  )
}

export default function Employees() {
  const { employees, loading } = useCompanyStore()
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all') // all | active | inactive | ewa
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    return employees
      .filter(e => {
        if (filter === 'active')   return e.active
        if (filter === 'inactive') return !e.active
        if (filter === 'ewa')      return e.ewa_enabled && e.active
        return true
      })
      .filter(e =>
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.dni?.includes(search) ||
        e.department?.toLowerCase().includes(search.toLowerCase())
      )
  }, [employees, search, filter])

  const activeCount = employees.filter(e => e.active).length
  const ewaCount    = employees.filter(e => e.active && e.ewa_enabled).length

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Empleados"
        actions={<Button icon="person_add" onClick={() => setShowAdd(true)}>Agregar</Button>}
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Stats strip */}
        <div className="flex gap-4">
          {[
            { label: 'Total',         val: employees.length, color: 'text-[#111827]'  },
            { label: 'Activos',        val: activeCount,       color: 'text-[#16a34a]' },
            { label: 'Con EWA',        val: ewaCount,          color: 'text-[#000666]' },
            { label: 'Sin EWA',        val: activeCount - ewaCount, color: 'text-[#6b7280]' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white rounded-[10px] border border-[#e2e5ec] px-4 py-3 flex gap-3 items-center">
              <span className={`font-display font-bold text-xl ${color}`}>{val}</span>
              <span className="text-sm text-[#6b7280]">{label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre, DNI, departamento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon="search"
            className="w-72"
          />
          <div className="flex rounded-[8px] border border-[#e2e5ec] overflow-hidden bg-white">
            {[
              { val: 'all',      label: 'Todos' },
              { val: 'active',   label: 'Activos' },
              { val: 'inactive', label: 'Inactivos' },
              { val: 'ewa',      label: 'Con EWA' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === val
                    ? 'bg-[#000666] text-white'
                    : 'text-[#4b5563] hover:bg-[#f1f3f7]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e5ec] bg-[#f8f9fb]">
                {['Empleado','DNI','Cargo / Depto.','Salario base','Devengado','Disponible','EWA','Estado',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[#6b7280]">Cargando empleados...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[#9ca3af]">Sin resultados</td></tr>
              )}
              {filtered.map(emp => (
                <tr
                  key={emp.id}
                  className="border-b border-[#f9fafb] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  onClick={() => navigate(`/employees/${emp.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#eef0ff] flex items-center justify-center shrink-0">
                        <span className="text-[#000666] text-[11px] font-bold">{initials(emp.name)}</span>
                      </div>
                      <span className="text-sm font-medium text-[#111827] whitespace-nowrap">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6b7280]">{emp.dni ?? '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#111827]">{emp.position ?? '—'}</p>
                    <p className="text-xs text-[#9ca3af]">{emp.department ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#111827]">{currency(emp.base_salary)}</td>
                  <td className="px-4 py-3 text-sm text-[#111827]">{currency(emp.earnedWage)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${emp.available > 0 ? 'text-[#16a34a]' : 'text-[#9ca3af]'}`}>
                      {currency(emp.available)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`w-8 h-5 rounded-full flex items-center transition-colors ${emp.ewa_enabled ? 'bg-[#16a34a] justify-end pr-0.5' : 'bg-[#d1d5db] justify-start pl-0.5'}`}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge value={emp.active ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3">
                    <span className="material-symbols-outlined text-[18px] text-[#9ca3af]">chevron_right</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddEmployeeModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
