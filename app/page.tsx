import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-600">Treevü</h1>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Crear Cuenta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Acceso a tu Salario Cuando lo Necesites
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Treevü te permite acceder anticipadamente a tu salario devengado de forma rápida, segura y sin complicaciones. Porque tu dinero es tuyo.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Comenzar Ahora
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Rápido</h3>
            <p className="text-slate-600">Solicita y recibe tu adelanto en minutos a tu wallet digital.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Seguro</h3>
            <p className="text-slate-600">Encriptación de nivel bancario para proteger tu información.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Inteligente</h3>
            <p className="text-slate-600">IA que predice tu situación financiera y te ayuda a ahorrar.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">50,000+</div>
            <p className="text-slate-600">Empleados Activos</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">S/ 500M+</div>
            <p className="text-slate-600">Adelantos Procesados</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">95%</div>
            <p className="text-slate-600">Satisfacción de Usuarios</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">© 2024 Treevü. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
