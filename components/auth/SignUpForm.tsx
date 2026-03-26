'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function SignUpForm() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
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
        description: 'Verifica tu email para confirmar tu cuenta',
      })

      router.push('/auth/sign-up-success')
    } catch (err) {
      console.error('[v0] Sign up error:', err)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al crear tu cuenta',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-slate-700">
            Nombre
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Juan"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
            className="bg-slate-50 border-slate-200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-slate-700">
            Apellido
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Pérez"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading}
            className="bg-slate-50 border-slate-200"
            required
          />
        </div>
      </div>

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
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>

      <div className="text-center text-sm">
        <span className="text-slate-600">¿Ya tienes cuenta? </span>
        <a href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          Inicia sesión
        </a>
      </div>
    </form>
  )
}
