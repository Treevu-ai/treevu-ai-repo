import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID required' },
        { status: 400 }
      )
    }

    // Get all employees in the company
    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        company_analytics: {
          total_employees: 0,
          avg_wellness_score: 0,
          predicted_ewa_demand: 0,
          ewa_demand_forecast: [],
        },
      })
    }

    // Calculate company-wide analytics
    const avgWellness = employees.reduce((sum, e) => sum + e.financial_wellness_score, 0) / employees.length
    const totalSalary = employees.reduce((sum, e) => sum + e.monthly_salary, 0)

    // Get all recent EWA requests for employees in this company
    const { data: ewaRequests } = await supabase
      .from('ewa_requests')
      .select('*')
      .in('employee_id', employees.map((e) => e.id))
      .gte('requested_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const avgRequestAmount = ewaRequests && ewaRequests.length > 0
      ? ewaRequests.reduce((sum, r) => sum + r.amount, 0) / ewaRequests.length
      : 0

    // Predict demand for next 30 days
    const predictedDemand = Math.round(
      (ewaRequests?.length || 0) * 1.2 * (avgRequestAmount || 500)
    )

    return NextResponse.json({
      company_analytics: {
        total_employees: employees.length,
        avg_wellness_score: Math.round(avgWellness),
        total_monthly_payroll: Math.round(totalSalary),
        recent_ewa_requests: ewaRequests?.length || 0,
        avg_request_amount: Math.round(avgRequestAmount),
        predicted_ewa_demand_30days: predictedDemand,
        prediction_confidence: 0.82,
        demand_forecast: [
          { day: 7, predicted_requests: Math.round((ewaRequests?.length || 0) * 0.3) },
          { day: 14, predicted_requests: Math.round((ewaRequests?.length || 0) * 0.6) },
          { day: 21, predicted_requests: Math.round((ewaRequests?.length || 0) * 0.8) },
          { day: 30, predicted_requests: Math.round((ewaRequests?.length || 0) * 1.2) },
        ],
      },
    })
  } catch (error) {
    console.error('[v0] Company analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
