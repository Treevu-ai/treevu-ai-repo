import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'

const FAQS = [
  {
    q: '¿Cuánto tiempo tarda el adelanto?',
    a: 'La transferencia se procesa en menos de 24 horas hábiles. En la mayoría de casos llega en minutos via Yape o Plin.',
  },
  {
    q: '¿Treevü me cobra algún interés?',
    a: 'No. El servicio es completamente gratuito para el trabajador. Tu empresa es quien paga el servicio.',
  },
  {
    q: '¿Cómo se descuenta el adelanto?',
    a: 'El monto se deduce automáticamente de tu próximo pago de nómina (siguiente quincena o fin de mes).',
  },
  {
    q: '¿Puedo solicitar varios adelantos al mes?',
    a: 'Puedes solicitar hasta 2 adelantos por ciclo de nómina, sin exceder el 75% del sueldo devengado total.',
  },
  {
    q: '¿Es seguro compartir mis datos?',
    a: 'Sí. Tus datos están cifrados con AES-256 y cumplimos con la Ley N° 29733 de Protección de Datos Personales del Perú.',
  },
]

export default function Help() {
  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Ayuda y Soporte" />

      <div className="px-4 pb-safe space-y-4">
        {/* Contact */}
        <Card className="p-5">
          <p className="text-sm font-semibold text-[var(--color-on-surface)] mb-3"
            style={{ fontFamily: 'var(--font-headline)' }}>
            Contacto directo
          </p>
          <div className="space-y-2">
            {[
              { icon: 'chat', label: 'Chat de soporte', sub: 'Lunes a Sábado 8am - 8pm' },
              { icon: 'mail', label: 'soporte@treevu.pe', sub: 'Respuesta en < 24h' },
              { icon: 'phone', label: '+51 1 700 0000', sub: 'Solo emergencias' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-[var(--color-surface-container-low)] rounded-[var(--radius-lg)]">
                <span className="material-symbols-outlined text-[var(--color-primary)] text-xl"
                  style={{ fontVariationSettings: '"FILL" 1' }}>
                  {icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--color-on-surface)]">{label}</p>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQs */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--color-on-surface)] px-1"
            style={{ fontFamily: 'var(--font-headline)' }}>
            Preguntas frecuentes
          </p>
          {FAQS.map(({ q, a }) => (
            <Card key={q} className="p-4">
              <p className="text-sm font-semibold text-[var(--color-on-surface)] mb-1.5">{q}</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">{a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
