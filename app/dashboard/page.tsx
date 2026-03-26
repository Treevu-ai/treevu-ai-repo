import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch employee data
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single()

  if (employeeError || !employee) {
    // Employee profile doesn't exist yet, redirect to onboarding
    redirect('/onboarding')
  }

  return <DashboardClient employee={employee} user={user} />
}
