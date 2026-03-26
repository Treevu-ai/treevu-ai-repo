import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Missing status field' },
        { status: 400 }
      )
    }

    // Update EWA request status
    const { data, error } = await supabase
      .from('ewa_requests')
      .update({
        status,
        processed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If approved, create a transaction
    if (status === 'approved') {
      await supabase.from('transactions').insert([
        {
          employee_id: data.employee_id,
          ewa_request_id: data.id,
          type: 'ewa_withdrawal',
          amount: data.amount - data.fee,
          description: `EWA withdrawal - approved on ${new Date().toLocaleDateString()}`,
        },
      ])

      // Update employee total withdrawn
      const { data: employee } = await supabase
        .from('employees')
        .select('total_ewa_withdrawn')
        .eq('id', data.employee_id)
        .single()

      if (employee) {
        await supabase
          .from('employees')
          .update({
            total_ewa_withdrawn: (employee.total_ewa_withdrawn || 0) + data.amount,
          })
          .eq('id', data.employee_id)
      }
    }

    return NextResponse.json({
      success: true,
      request: data,
    })
  } catch (error) {
    console.error('[v0] Update EWA request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('ewa_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error('[v0] Get EWA request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
