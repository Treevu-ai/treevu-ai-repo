import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignUpForm from '@/components/auth/SignUpForm'

export default async function SignUpPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Treevü</h1>
            <p className="text-slate-600 mt-2">Crea tu cuenta</p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
