'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/use-toast'
import NavBar from '@/components/dashboard/NavBar'
import BottomNav from '@/components/dashboard/BottomNav'

interface Employee {
  id: string
  first_name: string
  last_name: string
  monthly_salary: number
  total_ewa_withdrawn: number
}

export default function RequestEWAForm({ employee }: { employee: Employee }) {
  const router = useRouter()
  const { toast } = useToast()
  const [amount, setAmount] = useState(100)
  const [paymentMethod, setPaymentMethod] = useState('yape')
  const [paymentAccount, setPaymentAccount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const maxAvailable = Math.max(employee.monthly_salary * 0.5 - employee.total_ewa_withdrawn, 0)
  const fee = amount * 0.01 // 1% fee
  const netAmount = amount - fee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/ewa-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          payment_method: paymentMethod,
          payment_account: paymentAccount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Fallo al crear la solicitud',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Éxito',
        description: 'Solicitud creada correctamente. Será revisada en las próximas 24 horas.',
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] Request error:', err)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar la solicitud',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 md:pb-0">
      <NavBar employee={employee} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Solicitar Adelanto</h1>
          <p className="text-sm text-slate-600">Solicita tu dinero devengado</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2 bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Nueva Solicitud de EWA</CardTitle>
              <CardDescription>Completa los datos de tu solicitud</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="amount" className="text-base">Monto</Label>
                    <span className="text-2xl font-bold text-emerald-600">S/ {amount.toFixed(2)}</span>
                  </div>
                  <Slider
                    id="amount"
                    min={0}
                    max={maxAvailable}
                    step={10}
                    value={[amount]}
                    onValueChange={(value) => setAmount(value[0])}
                    disabled={isLoading}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>S/ 0</span>
                    <span>Máximo: S/ {maxAvailable.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label className="text-base">Método de Pago</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['yape', 'plin', 'bank_transfer'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        disabled={isLoading}
                        className={`p-3 rounded-lg border-2 transition ${
                          paymentMethod === method
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-sm font-semibold capitalize">
                          {method === 'bank_transfer' ? 'Banco' : method.toUpperCase()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Account */}
                <div className="space-y-2">
                  <Label htmlFor="account">
                    {paymentMethod === 'bank_transfer' ? 'Número de Cuenta' : 'Número Telefónico'}
                  </Label>
                  <Input
                    id="account"
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    placeholder={
                      paymentMethod === 'bank_transfer' ? '1234567890' : '987654321'
                    }
                    disabled={isLoading}
                    className="bg-slate-50"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || maxAvailable === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isLoading ? 'Procesando...' : 'Confirmar Solicitud'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="space-y-4">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Monto Solicitado</p>
                  <p className="text-2xl font-bold text-slate-900">S/ {amount.toFixed(2)}</p>
                </div>

                <div className="border-t border-emerald-200 pt-4">
                  <p className="text-sm text-slate-600">Comisión (1%)</p>
                  <p className="text-lg font-semibold text-slate-900">- S/ {fee.toFixed(2)}</p>
                </div>

                <div className="border-t border-emerald-200 pt-4 bg-white p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Recibirás</p>
                  <p className="text-2xl font-bold text-emerald-600">S/ {netAmount.toFixed(2)}</p>
                </div>

                <div className="border-t border-emerald-200 pt-4">
                  <p className="text-xs text-slate-600 mb-2">Disponible para EWA</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((employee.monthly_salary * 0.5) / employee.monthly_salary * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    S/ {maxAvailable.toFixed(2)} de S/ {(employee.monthly_salary * 0.5).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm">Información</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>• Procesamiento en 24 horas</p>
                <p>• Sin intereses adicionales</p>
                <p>• Seguro y encriptado</p>
                <p>• Comisión del 1%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
