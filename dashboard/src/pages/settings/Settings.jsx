import { useState } from 'react'
import { useAuthStore, MOCK_AUTH } from '../../store/useAuthStore'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input, { Select } from '../../components/ui/Input'
import TopBar from '../../components/layout/TopBar'

const MOCK_USERS = [
  { id: 'u1', name: 'Carlos Mendoza', email: 'rrhh@ripley.pe',      role: 'admin',    active: true },
  { id: 'u2', name: 'Sofía Castro',   email: 'finanzas@ripley.pe',  role: 'finance',  active: true },
  { id: 'u3', name: 'Diego Paredes',  email: 'gerencia@ripley.pe',  role: 'readonly', active: true },
]

function Section({ title, description, children }) {
  return (
    <div className="grid grid-cols-3 gap-6 py-6 border-b border-[#e2e5ec] last:border-0">
      <div>
        <h3 className="font-display font-semibold text-[#111827] text-sm">{title}</h3>
        <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { company, employerUser } = useAuthStore()
  const co = company ?? MOCK_AUTH.company
  const eu = employerUser ?? MOCK_AUTH.employerUser
  const { show } = useToast()

  const [ewa, setEwa] = useState({
    ewa_enabled:             co.ewa_enabled ?? true,
    ewa_limit_pct:           co.ewa_limit_pct,
    ewa_max_pct:             co.ewa_max_pct,
    max_advances_per_month:  co.max_advances_per_month,
    payroll_cycle:           co.payroll_cycle,
  })

  const [users, setUsers] = useState(MOCK_USERS)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'hr' })
  const [saving, setSaving] = useState(false)

  function setEwaField(k, v) { setEwa(e => ({ ...e, [k]: v })) }

  async function saveEwa() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    // TODO: supabase.from('companies').update(ewa).eq('id', co.id)
    show({ message: 'Configuración guardada', type: 'success' })
    setSaving(false)
  }

  function addUser() {
    if (!newUser.name || !newUser.email) {
      show({ message: 'Nombre y email son obligatorios', type: 'error' }); return
    }
    setUsers(u => [...u, { id: crypto.randomUUID(), ...newUser, active: true }])
    setNewUser({ name: '', email: '', role: 'hr' })
    show({ message: 'Usuario invitado — recibirá un correo de activación', type: 'success' })
  }

  function toggleUser(id) {
    setUsers(u => u.map(x => x.id === id ? { ...x, active: !x.active } : x))
  }

  const canEdit = eu.role === 'admin'

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Configuración" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl">
          <Card>
            {/* Company info */}
            <Section title="Información de la empresa" description="Datos básicos de tu organización.">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Razón social" value={co.name} disabled />
                <Input label="RUC" value={co.ruc ?? ''} disabled />
                <Input label="País" value={co.country} disabled />
                <Select label="Ciclo de nómina" value={ewa.payroll_cycle} onChange={e => setEwaField('payroll_cycle', e.target.value)} disabled={!canEdit}>
                  <option value="monthly">Mensual</option>
                  <option value="biweekly">Quincenal</option>
                </Select>
              </div>
            </Section>

            {/* EWA config */}
            <Section
              title="Configuración EWA"
              description="Define los límites y reglas de avance salarial para tus empleados."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-[10px] bg-[#f8f9fb] border border-[#e2e5ec]">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">EWA habilitado para la empresa</p>
                    <p className="text-xs text-[#6b7280]">Permite a los empleados solicitar avances</p>
                  </div>
                  <button
                    onClick={() => canEdit && setEwaField('ewa_enabled', !ewa.ewa_enabled)}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${ewa.ewa_enabled ? 'bg-[#16a34a] justify-end pr-0.5' : 'bg-[#d1d5db] justify-start pl-0.5'} ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="Límite EWA (%)"
                      type="number"
                      min={10} max={90} step={5}
                      value={ewa.ewa_limit_pct}
                      onChange={e => setEwaField('ewa_limit_pct', parseFloat(e.target.value))}
                      suffix="%"
                      disabled={!canEdit}
                    />
                    <p className="text-xs text-[#9ca3af] mt-1">% del salario devengado disponible</p>
                  </div>
                  <div>
                    <Input
                      label="Límite máximo (%)"
                      type="number"
                      min={10} max={90} step={5}
                      value={ewa.ewa_max_pct}
                      onChange={e => setEwaField('ewa_max_pct', parseFloat(e.target.value))}
                      suffix="%"
                      disabled={!canEdit}
                    />
                    <p className="text-xs text-[#9ca3af] mt-1">Tope absoluto por ciclo</p>
                  </div>
                  <div>
                    <Input
                      label="Avances por mes"
                      type="number"
                      min={1} max={10}
                      value={ewa.max_advances_per_month}
                      onChange={e => setEwaField('max_advances_per_month', parseInt(e.target.value))}
                      disabled={!canEdit}
                    />
                    <p className="text-xs text-[#9ca3af] mt-1">Máx. solicitudes por empleado/mes</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-[10px] bg-[#eef0ff] border border-[#c7d2fe]">
                  <p className="text-xs font-semibold text-[#000666] mb-2">Vista previa — empleado con S/ 2,400/mes, 18 días trabajados:</p>
                  <div className="flex gap-6 text-xs">
                    <div>
                      <span className="text-[#6b7280]">Devengado: </span>
                      <span className="font-semibold text-[#111827]">S/ {(2400 * 18/30).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#6b7280]">Disponible ({ewa.ewa_limit_pct}%): </span>
                      <span className="font-semibold text-[#16a34a]">S/ {(2400 * 18/30 * ewa.ewa_limit_pct/100).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#6b7280]">Tope ({ewa.ewa_max_pct}%): </span>
                      <span className="font-semibold text-[#d97706]">S/ {(2400 * 18/30 * ewa.ewa_max_pct/100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {canEdit && (
                  <Button loading={saving} onClick={saveEwa} icon="save">
                    Guardar configuración EWA
                  </Button>
                )}
              </div>
            </Section>

            {/* Integrations */}
            <Section title="Integraciones" description="Pasarelas de desembolso. El procesamiento real se habilitará cuando tengas un proveedor activo.">
              <div className="space-y-3">
                {[
                  { name: 'Yape Empresas', icon: '💜', status: 'pending', desc: 'Desembolso instantáneo a billetera Yape' },
                  { name: 'Banco BCP',     icon: '🏦', status: 'pending', desc: 'Transferencia interbancaria (CCI)' },
                  { name: 'Interbank',     icon: '🏦', status: 'pending', desc: 'Transferencia interbancaria (CCI)' },
                ].map(({ name, icon, status, desc }) => (
                  <div key={name} className="flex items-center justify-between p-4 rounded-[10px] bg-[#f8f9fb] border border-[#e2e5ec]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{name}</p>
                        <p className="text-xs text-[#6b7280]">{desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge value="requested" custom="Próximamente" />
                      <Button size="sm" variant="secondary" disabled>Conectar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Users */}
            <Section title="Usuarios del dashboard" description="Gestiona quién tiene acceso y qué puede hacer.">
              <div className="space-y-4">
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className={`flex items-center justify-between p-3.5 rounded-[10px] border ${u.active ? 'border-[#e2e5ec] bg-white' : 'border-[#e2e5ec] bg-[#f8f9fb] opacity-60'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#eef0ff] flex items-center justify-center shrink-0">
                          <span className="text-[#000666] text-xs font-bold">
                            {u.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{u.name}</p>
                          <p className="text-xs text-[#6b7280]">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge value={u.role} />
                        {canEdit && u.id !== 'u1' && (
                          <Button size="sm" variant="ghost" onClick={() => toggleUser(u.id)}>
                            {u.active ? 'Desactivar' : 'Activar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {canEdit && (
                  <div className="border-t border-[#e2e5ec] pt-4">
                    <p className="text-sm font-semibold text-[#111827] mb-3">Invitar usuario</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Input placeholder="Nombre completo"
                        value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                      />
                      <Input type="email" placeholder="email@empresa.pe"
                        value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                      />
                      <Select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                        <option value="hr">RRHH</option>
                        <option value="finance">Finanzas</option>
                        <option value="readonly">Solo lectura</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </div>
                    <Button className="mt-3" variant="secondary" icon="person_add" onClick={addUser}>
                      Invitar
                    </Button>
                  </div>
                )}
              </div>
            </Section>
          </Card>
        </div>
      </div>
    </div>
  )
}
