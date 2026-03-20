import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <div className="app-container">
      <main className="pb-safe">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
