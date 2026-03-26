import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HistoryClient from '@/components/history/HistoryClient'

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get employee data
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!employee) {
    redirect('/onboarding')
  }

  // Get transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  // Get EWA requests
  const { data: ewaRequests } = await supabase
    .from('ewa_requests')
    .select('*')
    .eq('employee_id', user.id)
    .order('requested_at', { ascending: false })

  return (
    <HistoryClient
      employee={employee}
      transactions={transactions || []}
      ewaRequests={ewaRequests || []}
    />
  )
}
