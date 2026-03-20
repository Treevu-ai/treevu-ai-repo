import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, MOCK_AUTH } from '../../store/useAuthStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()

    if (isDemoMode) {
      // Demo login — inject mock auth and go to dashboard
      useAuthStore.setState({
        user: MOCK_AUTH.user,
        employerUser: MOCK_AUTH.employerUser,
        company: MOCK_AUTH.company,
      })
      navigate('/', { replace: true })
      return
    }

    const result = await login(email, password)
    if (result.ok) navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[480px] bg-[#000666] flex-col justify-between p-12 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center">
              <span className="text-[#000666] font-display font-bold text-lg">T</span>
            </div>
            <span className="text-white font-display font-bold text-xl">Treevü</span>
          </div>
          <div className="mt-16">
            <h2 className="text-white font-display font-bold text-3xl leading-tight">
              Gestiona los avances de tu equipo en tiempo real
            </h2>
            <p className="text-white/60 mt-4 text-base leading-relaxed">
              Dashboard para empleadores. Monitorea solicitudes, configura límites y lleva el control de tu nómina EWA.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: 'bolt',         text: 'Auto-aprobación instantánea dentro de límites' },
            { icon: 'security',     text: 'RLS — datos aislados por empresa'              },
            { icon: 'integration_instructions', text: 'Integración con Yape Empresas y bancos' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="material-symbols-outlined icon-filled text-[20px] text-white/70">{icon}</span>
              <p className="text-white/70 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-[8px] bg-[#000666] flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">T</span>
            </div>
            <span className="text-[#000666] font-display font-bold text-lg">Treevü</span>
          </div>

          <h1 className="font-display font-bold text-2xl text-[#111827] mb-2">Iniciar sesión</h1>
          <p className="text-[#6b7280] text-sm mb-8">
            {isDemoMode
              ? 'Modo demo — cualquier credencial funciona'
              : 'Accede al dashboard de tu empresa'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="rrhh@empresa.pe"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon="mail"
              required={!isDemoMode}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon="lock"
              required={!isDemoMode}
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-[8px] bg-[#fee2e2] border border-[#fecaca]">
                <span className="material-symbols-outlined icon-filled text-[18px] text-[#dc2626]">error</span>
                <p className="text-sm text-[#991b1b]">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center mt-2">
              {isDemoMode ? 'Entrar al demo' : 'Iniciar sesión'}
            </Button>
          </form>

          {isDemoMode && (
            <div className="mt-6 p-4 rounded-[10px] bg-[#eef0ff] border border-[#c7d2fe]">
              <p className="text-xs font-semibold text-[#000666] mb-1">Modo demo activo</p>
              <p className="text-xs text-[#4b5563]">
                Los datos son simulados. Para conectar tu empresa, configura <code className="bg-white/60 px-1 rounded">VITE_SUPABASE_URL</code> en el entorno.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
