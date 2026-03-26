'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import AnalyticsCard from '@/components/employer/AnalyticsCard'

interface Company {
  id: string
  name: string
  ruc: string
  employee_count: number
  ewa_limit_percentage: number
}

interface Employee {
  id: string
  first_name: string
  last_name: string
  position: string
  monthly_salary: number
  financial_wellness_score: number
}

interface EWARequest {
  id: string
  employee_id: string
  amount: number
  fee: number
  status: string
  requested_at: string
  employees?: {
    first_name: string
    last_name: string
  }
}

export default function EmployerDashboard({
  company,
  employees,
  ewaRequests,
}: {
  company: Company
  employees: Employee[]
  ewaRequests: EWARequest[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [approving, setApproving] = useState<string | null>(null)

  const handleApproveRequest = async (requestId: string) => {
    setApproving(requestId)
    try {
      const response = await fetch(`/api/employer/ewa-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (!response.ok) {
        throw new Error('Error approving request')
      }

      toast({
        title: 'Éxito',
        description: 'Solicitud aprobada correctamente',
      })

      router.refresh()
    } catch (err) {
      console.error('[v0] Error approving request:', err)
      toast({
        title: 'Error',
        description: 'No se pudo aprobar la solicitud',
        variant: 'destructive',
      })
    } finally {
      setApproving(null)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    setApproving(requestId)
    try {
      const response = await fetch(`/api/employer/ewa-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (!response.ok) {
        throw new Error('Error rejecting request')
      }

      toast({
        title: 'Éxito',
        description: 'Solicitud rechazada',
      })

      router.refresh()
    } catch (err) {
      console.error('[v0] Error rejecting request:', err)
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la solicitud',
        variant: 'destructive',
      })
    } finally {
      setApproving(null)
    }
  }

  const avgWellnessScore =
    employees.length > 0
      ? Math.round(
          employees.reduce((sum, e) => sum + e.financial_wellness_score, 0) / employees.length
        )
      : 0

  const pendingRequests = ewaRequests.filter((r) => r.status === 'pending').length
  const approvedRequests = ewaRequests.filter((r) => r.status === 'approved').length
  const totalRequested = ewaRequests.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-600">Treevü Employer</h1>
            <p className="text-sm text-slate-600">{company.name}</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push('/auth/login')}
          >
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600">Gestiona solicitudes de adelanto y visualiza métricas del equipo</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Empleados Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{employees.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Wellness Score Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{avgWellnessScore}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Solicitudes Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingRequests}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">Total Solicitado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">S/ {totalRequested.toFixed(0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="requests">Solicitudes de EWA</TabsTrigger>
            <TabsTrigger value="employees">Empleados</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Solicitudes de Adelanto</CardTitle>
                <CardDescription>
                  {pendingRequests} solicitudes pendientes de revisión
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ewaRequests.length === 0 ? (
                  <p className="text-slate-500 text-sm py-8 text-center">No hay solicitudes</p>
                ) : (
                  <div className="space-y-4">
                    {ewaRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {req.employees?.first_name} {req.employees?.last_name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(req.requested_at).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-bold text-slate-900">S/ {req.amount.toFixed(2)}</p>
                          <span
                            className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
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
                        {req.status === 'pending' && (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(req.id)}
                              disabled={approving === req.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(req.id)}
                              disabled={approving === req.id}
                            >
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Empleados</CardTitle>
                <CardDescription>
                  {employees.length} empleados en tu empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <p className="text-slate-500 text-sm py-8 text-center">No hay empleados</p>
                ) : (
                  <div className="space-y-3">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p className="text-sm text-slate-600">{emp.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            S/ {emp.monthly_salary.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-600">
                            Wellness: {emp.financial_wellness_score}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsCard companyId={company.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
