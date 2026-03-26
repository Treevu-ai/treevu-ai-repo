import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EducationClient from '@/components/education/EducationClient'

export default async function EducationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!employee) {
    redirect('/onboarding')
  }

  const { data: progress } = await supabase
    .from('education_progress')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  return <EducationClient employee={employee} progress={progress || []} />
}
