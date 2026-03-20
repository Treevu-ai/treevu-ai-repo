import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import ToastContainer from '@/components/ui/Toast'

export default function AppShell() {
  return (
    <div className="app-container">
      <ToastContainer />
      <main className="pb-safe">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
