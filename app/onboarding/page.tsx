import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from '@/components/onboarding/OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if employee already has a profile
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single()

  if (employee) {
    redirect('/dashboard')
  }

  return <OnboardingForm user={user} />
}
