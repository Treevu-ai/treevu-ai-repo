import { useLocation, Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import ToastContainer from '@/components/ui/Toast'

export default function AppShell() {
  const location = useLocation()

  return (
    <div className="app-container">
      <ToastContainer />
      <main className="pb-safe">
        <div key={location.pathname} className="animate-page-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
