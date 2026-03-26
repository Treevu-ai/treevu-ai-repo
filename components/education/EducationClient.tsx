'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import NavBar from '@/components/dashboard/NavBar'

interface Employee {
  first_name: string
  last_name: string
}

interface EducationProgress {
  id: string
  module_id: string
  module_name: string
  completed: boolean
  score: number
  xp_earned: number
  completed_at?: string
}

const MODULES = [
  {
    id: 'intro-financial-literacy',
    name: 'Introducción a Finanzas Personales',
    description: 'Aprende los fundamentos de la gestión financiera',
    xp: 50,
  },
  {
    id: 'budgeting-101',
    name: 'Presupuesto 101',
    description: 'Cómo crear y mantener un presupuesto efectivo',
    xp: 75,
  },
  {
    id: 'saving-strategies',
    name: 'Estrategias de Ahorro',
    description: 'Técnicas probadas para ahorrar más dinero',
    xp: 100,
  },
  {
    id: 'investing-basics',
    name: 'Inversión Básica',
    description: 'Primeros pasos en el mundo de la inversión',
    xp: 150,
  },
]

export default function EducationClient({
  employee,
  progress,
}: {
  employee: Employee
  progress: EducationProgress[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

  const handleLogout = async () => {
    router.push('/auth/login')
  }

  const completeModule = async (moduleId: string, moduleName: string, xp: number) => {
    setCompleting(true)
    try {
      const response = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: moduleId,
          module_name: moduleName,
          xp_earned: xp,
          score: Math.floor(Math.random() * (100 - 70 + 1)) + 70, // Random score 70-100
        }),
      })

      if (!response.ok) {
        throw new Error('Error completing module')
      }

      toast({
        title: 'Éxito',
        description: `¡Has ganado ${xp} XP!`,
      })

      // Refresh page
      router.refresh()
    } catch (err) {
      console.error('[v0] Error completing module:', err)
      toast({
        title: 'Error',
        description: 'No se pudo completar el módulo',
        variant: 'destructive',
      })
    } finally {
      setCompleting(false)
      setSelectedModule(null)
    }
  }

  const totalXP = progress.reduce((sum, p) => sum + p.xp_earned, 0)
  const completedModules = progress.filter((p) => p.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavBar employee={employee} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Volver
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Centro de Educación</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">XP Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{totalXP}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Módulos Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {completedModules}/{MODULES.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Nivel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {Math.floor(totalXP / 100) + 1}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((module) => {
            const moduleProgress = progress.find((p) => p.module_id === module.id)
            const isCompleted = moduleProgress?.completed || false

            return (
              <Card
                key={module.id}
                className={`border-2 transition ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={isCompleted ? 'text-emerald-900' : ''}>
                        {module.name}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                    {isCompleted && (
                      <div className="text-xl">✓</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">{module.xp} XP</span>
                    {moduleProgress && (
                      <span className="text-sm text-slate-600">
                        Puntuación: {moduleProgress.score}%
                      </span>
                    )}
                  </div>

                  {isCompleted ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-emerald-700 font-semibold">Completado</p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => completeModule(module.id, module.name, module.xp)}
                      disabled={completing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {completing ? 'Completando...' : 'Completar Módulo'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
