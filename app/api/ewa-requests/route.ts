import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    const { amount, payment_method, payment_account } = body

    // Validate input
    if (!amount || !payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get employee data
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', user.id)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' },
        { status: 404 }
      )
    }

    // Calculate available amount (50% of monthly salary minus already withdrawn)
    const available = Math.max(employee.monthly_salary * 0.5 - employee.total_ewa_withdrawn, 0)

    if (amount > available) {
      return NextResponse.json(
        { error: `Amount exceeds available limit of S/ ${available.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Create EWA request
    const { data: ewaRequest, error: ewaError } = await supabase
      .from('ewa_requests')
      .insert([
        {
          employee_id: user.id,
          amount,
          fee: amount * 0.01, // 1% fee
          payment_method,
          payment_account,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (ewaError) {
      return NextResponse.json(
        { error: ewaError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      request: ewaRequest,
    })
  } catch (error) {
    console.error('[v0] EWA request error:', error)
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

    // Get all EWA requests for the user
    const { data: requests, error } = await supabase
      .from('ewa_requests')
      .select('*')
      .eq('employee_id', user.id)
      .order('requested_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('[v0] Get EWA requests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
