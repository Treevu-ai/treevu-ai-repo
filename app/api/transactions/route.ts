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

    // Get all transactions for the user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('[v0] Get transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    const { type, amount, description, ewa_request_id } = body

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert([
        {
          employee_id: user.id,
          type,
          amount,
          description,
          ewa_request_id,
        },
      ])
      .select()
      .single()

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transaction,
    })
  } catch (error) {
    console.error('[v0] Create transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
