import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'

export default function Terms() {
  const navigate = useNavigate()
  return (
    <div className="app-container min-h-dvh bg-[var(--color-surface)]">
      <PageHeader title="Términos y Condiciones" />
      <div className="px-6 pb-10 space-y-6 text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
        <section>
          <h2 className="font-semibold text-[var(--color-on-surface)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            1. Descripción del servicio
          </h2>
          <p>Treevü es una plataforma de acceso a salario devengado (Earned Wage Access – EWA) que permite a los empleados solicitar adelantos de su salario ya ganado, sin intereses y sin constituir un préstamo.</p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--color-on-surface)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            2. Modelo No-Custodio
          </h2>
          <p>Treevü no capta ni custodia fondos. La plataforma coordina la transacción entre el empleador y el trabajador. El dinero es transferido directamente por la empresa empleadora.</p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--color-on-surface)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            3. Protección de datos
          </h2>
          <p>Tus datos son tratados conforme a la Ley N° 29733 de Protección de Datos Personales del Perú. Los datos de nómina son procesados con cifrado AES-256 y no son compartidos con terceros sin tu consentimiento.</p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--color-on-surface)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            4. Elegibilidad
          </h2>
          <p>Para usar el servicio debes ser empleado activo de una empresa inscrita en Treevü y tener al menos 15 días de trabajo en el ciclo de nómina vigente.</p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--color-on-surface)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            5. Límites de adelanto
          </h2>
          <p>El monto máximo de adelanto corresponde al 75% del salario devengado a la fecha de la solicitud. Los descuentos se aplicarán en la siguiente fecha de pago de nómina.</p>
        </section>
      </div>
    </div>
  )
}
