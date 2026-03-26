'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import NavBar from '@/components/dashboard/NavBar'
import BottomNav from '@/components/dashboard/BottomNav'
import { User } from '@supabase/supabase-js'

interface Employee {
  id: string
  first_name: string
  last_name: string
  monthly_salary: number
  financial_wellness_score: number
  total_ewa_withdrawn: number
  position: string
  department: string
}

interface Prediction {
  type: string
  confidence: number
  data: any
}

export default function DashboardClient({
  employee,
  user,
}: {
  employee: Employee
  user: User
}) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [earnedSalary, setEarnedSalary] = useState(0)
  const [availableForEWA, setAvailableForEWA] = useState(0)
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [predictions, setPredictions] = useState<{ wellness?: Prediction; ewa_demand?: Prediction } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Calculate earned salary (for demo, assuming 50% of monthly)
        const calculated_earned = employee.monthly_salary * 0.5
        setEarnedSalary(calculated_earned)

        // Available for EWA is earned minus already withdrawn
        const available = calculated_earned - employee.total_ewa_withdrawn
        setAvailableForEWA(Math.max(available, 0))

        // Fetch recent EWA requests
        const { data: requests } = await supabase
          .from('ewa_requests')
          .select('*')
          .eq('employee_id', employee.id)
          .order('requested_at', { ascending: false })
          .limit(5)

        setRecentRequests(requests || [])

        // Fetch ML predictions
        try {
          const response = await fetch('/api/ml/predict')
          if (response.ok) {
            const data = await response.json()
            setPredictions(data.predictions)
          }
        } catch (err) {
          console.log('[v0] ML predictions not available yet')
        }
      } catch (err) {
        console.error('[v0] Error loading dashboard:', err)
        toast({
          title: 'Error',
          description: 'No se pudo cargar los datos del dashboard',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [employee, supabase, toast])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 md:pb-0">
      <NavBar employee={employee} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Bienvenido, {employee.first_name}!</h1>
          <p className="text-slate-600 mt-2">{employee.position} en {employee.department}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Earned Salary Card */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Salario Devengado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">S/ {earnedSalary.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-2">50% del mes actual</p>
            </CardContent>
          </Card>

          {/* Available for EWA Card */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Disponible para EWA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">S/ {availableForEWA.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-2">Hasta 50% de tu salario</p>
            </CardContent>
          </Card>

          {/* Financial Wellness Score Card */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Financial Wellness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{employee.financial_wellness_score}</div>
              <Progress value={employee.financial_wellness_score} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white border-slate-200 lg:col-span-1">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push('/request-ewa')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Solicitar Adelanto
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/history')}
                className="w-full"
              >
                Ver Historial
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/education')}
                className="w-full"
              >
                Aprende y Gana XP
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-blue-50 border-blue-200 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Predicciones IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {predictions?.wellness && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600">Wellness Score Predicho</p>
                  <p className="text-lg font-bold text-blue-600">
                    {predictions.wellness.data.predicted_score}
                  </p>
                  <p className="text-xs text-slate-600 capitalize">
                    Tendencia: {predictions.wellness.data.trend}
                  </p>
                </div>
              )}
              {predictions?.ewa_demand && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600">Demanda EWA Predicha (30 días)</p>
                  <p className="text-lg font-bold text-purple-600">
                    {predictions.ewa_demand.data.probability}%
                  </p>
                  <p className="text-xs text-slate-600">
                    Monto probable: S/ {predictions.ewa_demand.data.likely_amount}
                  </p>
                </div>
              )}
              {!predictions && (
                <p className="text-xs text-slate-600 text-center py-4">Cargando predicciones...</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card className="bg-white border-slate-200 lg:col-span-1">
            <CardHeader>
              <CardTitle>Solicitudes Recientes</CardTitle>
              <CardDescription>Tus últimas solicitudes</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <p className="text-slate-500 text-sm">No hay solicitudes aún</p>
              ) : (
                <div className="space-y-2">
                  {recentRequests.slice(0, 3).map((req) => (
                    <div
                      key={req.id}
                      className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">S/ {req.amount.toFixed(2)}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
