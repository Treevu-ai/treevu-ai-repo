'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface CompanyAnalytics {
  total_employees: number
  avg_wellness_score: number
  total_monthly_payroll: number
  recent_ewa_requests: number
  avg_request_amount: number
  predicted_ewa_demand_30days: number
  prediction_confidence: number
  demand_forecast: Array<{
    day: number
    predicted_requests: number
  }>
}

export default function AnalyticsCard({ companyId }: { companyId: string }) {
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await fetch(`/api/ml/company-analytics?company_id=${companyId}`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data.company_analytics)
        }
      } catch (err) {
        console.error('[v0] Error loading analytics:', err)
        toast({
          title: 'Error',
          description: 'No se pudo cargar los analytics',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [companyId, toast])

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Predicciones IA</CardTitle>
          <CardDescription>Análisis de demanda y tendencias</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Cargando datos...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Predicciones IA (Próximos 30 días)</CardTitle>
          <CardDescription>Basado en análisis de {analytics.recent_ewa_requests} solicitudes recientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-slate-600 mb-1">Demanda Predicha</p>
              <p className="text-3xl font-bold text-blue-600">
                S/ {analytics.predicted_ewa_demand_30days.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Confianza: {Math.round(analytics.prediction_confidence * 100)}%
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-slate-600 mb-1">Monto Promedio Solicitado</p>
              <p className="text-3xl font-bold text-purple-600">
                S/ {analytics.avg_request_amount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                De {analytics.recent_ewa_requests} solicitudes
              </p>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-slate-900 mb-3">Pronóstico de Solicitudes</p>
            <div className="space-y-2">
              {analytics.demand_forecast.map((forecast, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 w-12">Día {forecast.day}</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((forecast.predicted_requests / Math.max(...analytics.demand_forecast.map(f => f.predicted_requests))) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 w-8 text-right">
                    {forecast.predicted_requests}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center bg-slate-100 p-2 rounded">
            Estas predicciones se actualizan diariamente basándose en nuevos datos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
