import { useState, useEffect, useMemo } from 'react'
import { useCompanyStore } from '../../store/useCompanyStore'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import TopBar from '../../components/layout/TopBar'
import { currency, dateTime, relativeTime, initials } from '../../utils/format'
import { supabase } from '../../lib/supabase'
import { hasSupabaseConfig } from '../../lib/runtime'

const TABS = [
  { val: 'all',        label: 'Todos'      },
  { val: 'requested',  label: 'Pendientes' },
  { val: 'processing', label: 'Procesando' },
  { val: 'paid',       label: 'Pagados'    },
  { val: 'rejected',   label: 'Rechazados' },
]

function RejectModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rechazar avance"
      size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" icon="cancel" onClick={() => onConfirm(reason)}>Rechazar</Button>
      </>}
    >
      <p className="text-sm text-[#4b5563] mb-3">Indica el motivo del rechazo (opcional):</p>
      <Input
        placeholder="Ej: Monto supera límite del ciclo"
        value={reason}
        onChange={e => setReason(e.target.value)}
      />
    </Modal>
  )
}

export default function Advances() {
  const { advances, employees, updateAdvanceStatus } = useCompanyStore()
  const { show } = useToast()
  const [tab, setTab]       = useState('all')
  const [search, setSearch] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null) // advance id
  const [processing, setProcessing]     = useState({})   // { [id]: bool }

  // Supabase real-time subscription
  useEffect(() => {
    if (!hasSupabaseConfig) return // demo/misconfigured mode, skip
    const channel = supabase
      .channel('advances_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'advances' }, payload => {
        if (payload.eventType === 'INSERT') {
          show({ message: `Nuevo avance solicitado — ${currency(payload.new.amount)}`, type: 'info' })
        }
        if (payload.eventType === 'UPDATE') {
          updateAdvanceStatus(payload.new.id, payload.new.status)
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = useMemo(() => {
    return advances
      .filter(a => tab === 'all' || a.status === tab)
      .filter(a => {
        if (!search) return true
        const emp = employees.find(e => e.id === a.employee_id)
        return emp?.name.toLowerCase().includes(search.toLowerCase())
      })
      .sort((a,b) => new Date(b.requested_at) - new Date(a.requested_at))
  }, [advances, tab, search, employees])

  const counts = useMemo(() => {
    const c = {}
    TABS.forEach(t => {
      c[t.val] = t.val === 'all' ? advances.length : advances.filter(a => a.status === t.val).length
    })
    return c
  }, [advances])

  async function handleApprove(adv) {
    setProcessing(p => ({ ...p, [adv.id]: true }))
    // Optimistic update
    updateAdvanceStatus(adv.id, 'approved', { approved_at: new Date().toISOString(), auto_approved: false })

    // TODO: call Edge Function or Supabase update
    await new Promise(r => setTimeout(r, 800))
    updateAdvanceStatus(adv.id, 'processing')

    show({ message: `Avance de ${currency(adv.amount)} aprobado y en proceso`, type: 'success' })
    setProcessing(p => ({ ...p, [adv.id]: false }))
  }

  function confirmReject(reason) {
    if (!rejectTarget) return
    updateAdvanceStatus(rejectTarget, 'rejected', {
      rejection_reason: reason,
      rejected_at: new Date().toISOString(),
    })
    show({ message: 'Avance rechazado', type: 'error' })
    setRejectTarget(null)
  }

  function exportCSV() {
    const rows = [
      ['Empleado','DNI','Departamento','Monto (PEN)','Estado','Método','Solicitado','Pagado'],
      ...advances.map(a => {
        const emp = employees.find(e => e.id === a.employee_id)
        return [
          emp?.name ?? '',
          emp?.dni  ?? '',
          emp?.department ?? '',
          a.amount,
          a.status,
          a.disbursement_method ?? '',
          a.requested_at ? new Date(a.requested_at).toLocaleString('es-PE') : '',
          a.paid_at       ? new Date(a.paid_at).toLocaleString('es-PE')       : '',
        ]
      }),
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `avances_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    show({ message: 'CSV exportado', type: 'success' })
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Avances EWA" actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            Tiempo real
          </div>
          <Button variant="secondary" size="sm" icon="download" onClick={exportCSV}>
            Exportar CSV
          </Button>
        </div>
      } />

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#e2e5ec] pb-0">
          {TABS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className={`
                relative px-4 py-2.5 text-sm font-medium transition-colors rounded-t-[8px]
                ${tab === val
                  ? 'text-[#000666] bg-white border border-b-0 border-[#e2e5ec] -mb-px'
                  : 'text-[#6b7280] hover:text-[#111827]'
                }
              `}
            >
              {label}
              {counts[val] > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  val === 'requested' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#f1f3f7] text-[#6b7280]'
                }`}>
                  {counts[val]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar por nombre de empleado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon="search"
          className="w-72"
        />

        {/* Table */}
        <div className="bg-white rounded-[12px] border border-[#e2e5ec] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e5ec] bg-[#f8f9fb]">
                {['Empleado','Monto','Estado','Método','Auto','Solicitado','Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#9ca3af]">
                    Sin avances en esta categoría
                  </td>
                </tr>
              )}
              {filtered.map(adv => {
                const emp = employees.find(e => e.id === adv.employee_id)
                const isPending = adv.status === 'requested'
                return (
                  <tr key={adv.id} className={`border-b border-[#f9fafb] transition-colors ${isPending ? 'bg-[#fffbeb]' : 'hover:bg-[#f8f9fb]'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#eef0ff] flex items-center justify-center shrink-0">
                          <span className="text-[#000666] text-[10px] font-bold">{initials(emp?.name ?? '?')}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{emp?.name ?? 'Empleado'}</p>
                          <p className="text-xs text-[#9ca3af]">{emp?.department ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#111827]">{currency(adv.amount)}</td>
                    <td className="px-4 py-3"><Badge value={adv.status} /></td>
                    <td className="px-4 py-3">
                      {adv.disbursement_method ? <Badge value={adv.disbursement_method} /> : <span className="text-[#9ca3af] text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {adv.auto_approved
                        ? <span className="flex items-center gap-1 text-xs text-[#16a34a] font-medium"><span className="material-symbols-outlined icon-filled text-[14px]">bolt</span>Auto</span>
                        : <span className="text-xs text-[#6b7280]">Manual</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-[#111827]">{dateTime(adv.requested_at)}</p>
                      <p className="text-xs text-[#9ca3af]">{relativeTime(adv.requested_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isPending && (
                        <div className="flex gap-2">
                          <Button size="sm" loading={processing[adv.id]} onClick={() => handleApprove(adv)}>
                            Aprobar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setRejectTarget(adv.id)}>
                            Rechazar
                          </Button>
                        </div>
                      )}
                      {adv.status === 'rejected' && adv.rejection_reason && (
                        <p className="text-xs text-[#dc2626] max-w-[160px] truncate" title={adv.rejection_reason}>
                          {adv.rejection_reason}
                        </p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Auto-approve note */}
        <div className="flex items-start gap-3 p-4 rounded-[10px] bg-[#eef0ff] border border-[#c7d2fe]">
          <span className="material-symbols-outlined icon-filled text-[20px] text-[#000666] shrink-0">bolt</span>
          <div>
            <p className="text-sm font-semibold text-[#000666]">Auto-aprobación activa</p>
            <p className="text-xs text-[#4b5563] mt-0.5">
              Las solicitudes dentro del límite configurado (50% del salario devengado) se aprueban y procesan automáticamente.
              Solo aparecen aquí los casos que superan el límite o requieren revisión manual.
            </p>
          </div>
        </div>
      </div>

      <RejectModal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
      />
    </div>
  )
}
