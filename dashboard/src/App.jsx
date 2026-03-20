import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { ToastContainer } from './components/ui/Toast'

import Login          from './pages/auth/Login'
import Overview       from './pages/overview/Overview'
import Employees      from './pages/employees/Employees'
import EmployeeDetail from './pages/employees/EmployeeDetail'
import Advances       from './pages/advances/Advances'
import Settings       from './pages/settings/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppShell />}>
          <Route index                    element={<Overview />} />
          <Route path="employees"         element={<Employees />} />
          <Route path="employees/:id"     element={<EmployeeDetail />} />
          <Route path="advances"          element={<Advances />} />
          <Route path="settings"          element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
