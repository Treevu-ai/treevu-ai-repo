import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to calculate predictions
function calculateWellnessPrediction(metrics: any[], employee: any) {
  const avgScore = metrics && metrics.length > 0
    ? metrics.reduce((sum: number, m: any) => sum + (m.wellness_score || 50), 0) / metrics.length
    : employee?.financial_wellness_score || 50

  const trend = metrics && metrics.length > 1
    ? (metrics[0]?.wellness_score || 50) - (metrics[1]?.wellness_score || 50)
    : 0

  return {
    type: 'wellness_score',
    confidence: 0.85,
    data: {
      predicted_score: Math.round(Math.max(0, Math.min(100, avgScore + trend * 0.5))),
      confidence: 0.85,
      trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
    },
  }
}

function calculateDemandPrediction(recentRequests: any[], employee: any) {
  const avgRequestAmount = recentRequests && recentRequests.length > 0
    ? recentRequests.reduce((sum: number, r: any) => sum + (r.amount || 0), 0) / recentRequests.length
    : 0

  const requestFrequency = recentRequests?.length || 0
  const monthlySalary = employee?.monthly_salary || 3000
  const demandProbability = Math.min(100, (requestFrequency * 10) + (avgRequestAmount / monthlySalary * 50))

  return {
    type: 'ewa_demand',
    confidence: 0.78,
    data: {
      probability: Math.round(demandProbability),
      likely_amount: Math.round(avgRequestAmount || monthlySalary * 0.3),
      predicted_next_request: '7-14 days',
      confidence: 0.78,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { employee_id, type } = body

    const targetEmployeeId = employee_id || user.id

    // Get employee data for prediction
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', targetEmployeeId)
      .single()

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Get financial metrics
    const { data: metrics } = await supabase
      .from('financial_metrics')
      .select('*')
      .eq('employee_id', targetEmployeeId)
      .order('metric_date', { ascending: false })
      .limit(30)

    // Get recent EWA requests
    const { data: recentRequests } = await supabase
      .from('ewa_requests')
      .select('*')
      .eq('employee_id', targetEmployeeId)
      .order('requested_at', { ascending: false })
      .limit(10)

    let prediction

    if (type === 'wellness_score') {
      prediction = calculateWellnessPrediction(metrics || [], employee)
    } else if (type === 'ewa_demand') {
      prediction = calculateDemandPrediction(recentRequests || [], employee)
    } else {
      return NextResponse.json({ error: 'Invalid prediction type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      prediction,
    })
  } catch (error) {
    console.error('[v0] ML prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get employee data
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!employee) {
      // Return default predictions if no employee found
      return NextResponse.json({
        predictions: {
          wellness: {
            type: 'wellness_score',
            confidence: 0.5,
            data: {
              predicted_score: 50,
              confidence: 0.5,
              trend: 'stable',
            },
          },
          ewa_demand: {
            type: 'ewa_demand',
            confidence: 0.5,
            data: {
              probability: 30,
              likely_amount: 500,
              predicted_next_request: '14+ days',
              confidence: 0.5,
            },
          },
        },
      })
    }

    // Get financial metrics
    const { data: metrics } = await supabase
      .from('financial_metrics')
      .select('*')
      .eq('employee_id', user.id)
      .order('metric_date', { ascending: false })
      .limit(30)

    // Get recent EWA requests
    const { data: recentRequests } = await supabase
      .from('ewa_requests')
      .select('*')
      .eq('employee_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(10)

    // Calculate predictions directly (no internal fetch)
    const wellnessPrediction = calculateWellnessPrediction(metrics || [], employee)
    const demandPrediction = calculateDemandPrediction(recentRequests || [], employee)

    return NextResponse.json({
      predictions: {
        wellness: wellnessPrediction,
        ewa_demand: demandPrediction,
      },
    })
  } catch (error) {
    console.error('[v0] Get predictions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
