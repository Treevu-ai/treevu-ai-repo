import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuthStore, MOCK_AUTH } from '../../store/useAuthStore'
import { useCompanyStore } from '../../store/useCompanyStore'

export default function AppShell() {
  const { user, company, employerUser } = useAuthStore()

  // In demo mode (no Supabase configured), inject mock auth
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL

  // Load company data once authenticated
  useEffect(() => {
    const companyId = company?.id ?? MOCK_AUTH.company.id
    if (isDemoMode || company) {
      useCompanyStore.getState().load(companyId)
    }
  }, [company, isDemoMode])

  // Redirect to login if not authenticated (unless demo mode)
  if (!isDemoMode && !user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[240px] overflow-y-auto bg-[#f8f9fb]">
        <Outlet />
      </main>
    </div>
  )
}
