'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Éxito',
        description: 'Sesión iniciada correctamente',
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] Login error:', err)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al iniciar sesión',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="bg-slate-50 border-slate-200"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="bg-slate-50 border-slate-200"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
      </Button>

      <div className="text-center text-sm">
        <span className="text-slate-600">¿No tienes cuenta? </span>
        <a href="/auth/sign-up" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          Regístrate aquí
        </a>
      </div>
    </form>
  )
}
