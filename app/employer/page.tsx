import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function EmployerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is an employer
  if (user) {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
      .single()

    if (company) {
      redirect('/employer/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-600">Treevü Employer</h1>
          <div className="space-x-4">
            <a href="/auth/login" className="text-slate-600 hover:text-slate-900">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Dashboard para Empresas
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Monitorea el bienestar financiero de tu equipo, gestiona solicitudes de adelanto y obtén insights predictivos con IA.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Dashboard Analítico</h3>
            <p className="text-slate-600">Visualiza KPIs, tendencias y métricas de tus empleados en tiempo real.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Predicciones IA</h3>
            <p className="text-slate-600">Anticipate demanda de EWA y situación financiera con modelos ML avanzados.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Gestión de Solicitudes</h3>
            <p className="text-slate-600">Aprueba o rechaza solicitudes de adelanto de forma rápida y segura.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
