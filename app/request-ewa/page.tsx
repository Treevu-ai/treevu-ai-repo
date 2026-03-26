import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RequestEWAForm from '@/components/ewa/RequestEWAForm'

export default async function RequestEWAPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get employee data
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single()

  if (employeeError || !employee) {
    redirect('/onboarding')
  }

  return <RequestEWAForm employee={employee} />
}
