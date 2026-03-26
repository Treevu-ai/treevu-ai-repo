'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NavBar from '@/components/dashboard/NavBar'

interface Employee {
  first_name: string
  last_name: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  created_at: string
}

interface EWARequest {
  id: string
  amount: number
  fee: number
  status: string
  requested_at: string
  completed_at?: string
}

export default function HistoryClient({
  employee,
  transactions,
  ewaRequests,
}: {
  employee: Employee
  transactions: Transaction[]
  ewaRequests: EWARequest[]
}) {
  const router = useRouter()

  const handleLogout = async () => {
    router.push('/auth/login')
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ewa_withdrawal: 'Adelanto EWA',
      ewa_repayment: 'Reembolso',
      salary_credit: 'Crédito de Salario',
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

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
          <h1 className="text-3xl font-bold text-slate-900">Historial</h1>
        </div>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle>Transacciones</CardTitle>
            <CardDescription>Tu historial de solicitudes y transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="ewa">Adelantos EWA</TabsTrigger>
                <TabsTrigger value="transactions">Transacciones</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {[...transactions, ...ewaRequests].length === 0 ? (
                  <p className="text-slate-500 text-sm py-8 text-center">No hay registros aún</p>
                ) : (
                  <div className="space-y-3">
                    {[
                      ...transactions.map((tx) => ({
                        ...tx,
                        date: tx.created_at,
                        type: 'transaction',
                      })),
                      ...ewaRequests.map((req) => ({
                        ...req,
                        date: req.requested_at,
                        type: 'ewa',
                      })),
                    ]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          <div className="flex-1">
                            {item.type === 'transaction' ? (
                              <>
                                <p className="font-semibold text-slate-900">
                                  {getTypeLabel(item.type)}
                                </p>
                                <p className="text-sm text-slate-600">{item.description}</p>
                              </>
                            ) : (
                              <>
                                <p className="font-semibold text-slate-900">Solicitud EWA</p>
                                <p className="text-sm text-slate-600">
                                  {new Date(item.date).toLocaleDateString('es-PE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">
                              S/ {(item.amount || 0).toFixed(2)}
                            </p>
                            {item.type === 'ewa' && (
                              <span
                                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ewa" className="space-y-3">
                {ewaRequests.length === 0 ? (
                  <p className="text-slate-500 text-sm py-8 text-center">No hay adelantos EWA</p>
                ) : (
                  <div className="space-y-3">
                    {ewaRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">Adelanto EWA</p>
                          <p className="text-sm text-slate-600">
                            {new Date(req.requested_at).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">S/ {req.amount.toFixed(2)}</p>
                          <span
                            className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-slate-500 text-sm py-8 text-center">No hay transacciones</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {getTypeLabel(tx.type)}
                          </p>
                          <p className="text-sm text-slate-600">{tx.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">S/ {tx.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
