'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { User } from '@supabase/supabase-js'

export default function OnboardingForm({ user }: { user: User }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [firstName, setFirstName] = useState(user.user_metadata?.first_name || '')
  const [lastName, setLastName] = useState(user.user_metadata?.last_name || '')
  const [dni, setDni] = useState('')
  const [phone, setPhone] = useState('')
  const [monthlySalary, setMonthlySalary] = useState('')
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from('employees').insert([
        {
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          dni,
          phone,
          monthly_salary: parseFloat(monthlySalary),
          position,
          department,
          financial_wellness_score: 50,
        },
      ])

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
        description: 'Perfil completado correctamente',
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] Onboarding error:', err)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al guardar tu perfil',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Completa tu Perfil</CardTitle>
          <CardDescription>Necesitamos algunos datos para comenzar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleComplete} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="12345678"
                  disabled={isLoading}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="987654321"
                  disabled={isLoading}
                  required
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlySalary">Salario Mensual (S/)</Label>
              <Input
                id="monthlySalary"
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                placeholder="3000"
                disabled={isLoading}
                required
                className="bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Posición</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Desarrollador"
                  disabled={isLoading}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Tecnología"
                  disabled={isLoading}
                  required
                  className="bg-slate-50"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? 'Guardando...' : 'Completar Perfil'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
