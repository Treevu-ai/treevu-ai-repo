import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">¡Cuenta creada!</h1>
          </div>

          <p className="text-slate-600 mb-6">
            Hemos enviado un enlace de confirmación a tu email. Por favor, verifica tu bandeja de entrada para completar el registro.
          </p>

          <Link href="/auth/login">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Volver al login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
