import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    return NextResponse.json({
      employee: {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        monthly_salary: employee.monthly_salary,
        financial_wellness_score: employee.financial_wellness_score,
        total_ewa_withdrawn: employee.total_ewa_withdrawn,
        position: employee.position,
        department: employee.department,
      },
    })
  } catch (error) {
    console.error('[v0] Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { financial_wellness_score, phone } = body

    const { data, error } = await supabase
      .from('employees')
      .update({
        ...(financial_wellness_score && { financial_wellness_score }),
        ...(phone && { phone }),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      employee: data,
    })
  } catch (error) {
    console.error('[v0] Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
