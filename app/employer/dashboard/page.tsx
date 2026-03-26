import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmployerDashboard from '@/components/employer/EmployerDashboard'

export default async function EmployerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // For now, get the first company (in production, we'd link user to company)
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .limit(1)
    .single()

  if (companyError || !company) {
    redirect('/employer')
  }

  // Get employees for this company
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', company.id)

  // Get EWA requests for this company
  const { data: ewaRequests } = await supabase
    .from('ewa_requests')
    .select('*, employees(first_name, last_name)')
    .in('employee_id', employees?.map((e) => e.id) || [])
    .order('requested_at', { ascending: false })

  return (
    <EmployerDashboard
      company={company}
      employees={employees || []}
      ewaRequests={ewaRequests || []}
    />
  )
}
