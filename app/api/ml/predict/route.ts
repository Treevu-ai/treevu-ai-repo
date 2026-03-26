import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Mock ML predictions - En producción se conectaría a un servicio FastAPI
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

    // Get employee data for prediction
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee_id)
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
      .eq('employee_id', employee_id)
      .order('metric_date', { ascending: false })
      .limit(30)

    // Get recent EWA requests
    const { data: recentRequests } = await supabase
      .from('ewa_requests')
      .select('*')
      .eq('employee_id', employee_id)
      .order('requested_at', { ascending: false })
      .limit(10)

    // Calculate predictions based on historical data
    let prediction = {
      type,
      confidence: 0.85,
      data: {} as any,
    }

    if (type === 'wellness_score') {
      // Predict next wellness score
      const avgScore = metrics && metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.wellness_score, 0) / metrics.length
        : 50

      const trend = metrics && metrics.length > 1
        ? metrics[0].wellness_score - metrics[1].wellness_score
        : 0

      prediction.data = {
        predicted_score: Math.round(Math.max(0, Math.min(100, avgScore + trend * 0.5))),
        confidence: 0.85,
        trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
      }
    } else if (type === 'ewa_demand') {
      // Predict EWA demand probability
      const avgRequestAmount = recentRequests && recentRequests.length > 0
        ? recentRequests.reduce((sum, r) => sum + r.amount, 0) / recentRequests.length
        : 0

      const requestFrequency = recentRequests?.length || 0
      const demandProbability = Math.min(100, (requestFrequency * 10) + (avgRequestAmount / employee.monthly_salary * 50))

      prediction.data = {
        probability: Math.round(demandProbability),
        likely_amount: Math.round(avgRequestAmount || employee.monthly_salary * 0.3),
        predicted_next_request: '7-14 days',
        confidence: 0.78,
      }
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

export async function GET(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Get wellness predictions
    const wellnessReq = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ml/predict`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user.id,
          type: 'wellness_score',
        }),
      }
    )

    const wellnessPrediction = await wellnessReq.json()

    // Get EWA demand predictions
    const demandReq = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ml/predict`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user.id,
          type: 'ewa_demand',
        }),
      }
    )

    const demandPrediction = await demandReq.json()

    return NextResponse.json({
      predictions: {
        wellness: wellnessPrediction.prediction,
        ewa_demand: demandPrediction.prediction,
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
