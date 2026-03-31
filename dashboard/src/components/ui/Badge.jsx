const styles = {
  requested:  'bg-[#fef3c7] text-[#92400e]',
  approved:   'bg-[#dbeafe] text-[#1e40af]',
  processing: 'bg-[#ede9fe] text-[#5b21b6]',
  paid:       'bg-[#dcfce7] text-[#15803d]',
  rejected:   'bg-[#fee2e2] text-[#991b1b]',
  reversed:   'bg-[#f1f3f7] text-[#4b5563]',
  active:     'bg-[#dcfce7] text-[#15803d]',
  inactive:   'bg-[#f1f3f7] text-[#6b7280]',
  admin:      'bg-[#eef0ff] text-[#000666]',
  hr:         'bg-[#ede9fe] text-[#5b21b6]',
  finance:    'bg-[#fef3c7] text-[#92400e]',
  readonly:   'bg-[#f1f3f7] text-[#4b5563]',
  open:       'bg-[#dbeafe] text-[#1e40af]',
  closed:     'bg-[#f1f3f7] text-[#4b5563]',
  yape:       'bg-[#f3e8ff] text-[#6b21a8]',
  plin:       'bg-[#dbeafe] text-[#1e40af]',
  bcp:        'bg-[#fee2e2] text-[#991b1b]',
  interbank:  'bg-[#dcfce7] text-[#15803d]',
}

const labels = {
  requested:  'Solicitado',
  approved:   'Aprobado',
  processing: 'Procesando',
  paid:       'Pagado',
  rejected:   'Rechazado',
  reversed:   'Revertido',
  active:     'Activo',
  inactive:   'Inactivo',
  admin:      'Admin',
  hr:         'RRHH',
  finance:    'Finanzas',
  readonly:   'Solo lectura',
  open:       'Abierto',
  closed:     'Cerrado',
}

export default function Badge({ value, custom }) {
  const cls = styles[value] ?? 'bg-[#f1f3f7] text-[#4b5563]'
  const label = custom ?? labels[value] ?? value
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
