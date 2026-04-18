import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import AppShell from '@/components/layout/AppShell'

// Auth
import Login from '@/pages/auth/Login'
import OTP from '@/pages/auth/OTP'
import CreatePIN from '@/pages/auth/CreatePIN'

// Onboarding
import Onboarding from '@/pages/onboarding/Onboarding'
import Terms from '@/pages/onboarding/Terms'

// Home
import Home from '@/pages/home/Home'

// Advance
import AdvanceRequest from '@/pages/advance/AdvanceRequest'
import AdvanceConfirm from '@/pages/advance/AdvanceConfirm'
import AdvanceSuccess from '@/pages/advance/AdvanceSuccess'
import AdvanceUnavailable from '@/pages/advance/AdvanceUnavailable'

// History
import History from '@/pages/history/History'
import MovementDetail from '@/pages/history/MovementDetail'

// Accounts
import Accounts from '@/pages/accounts/Accounts'
import LinkWallet from '@/pages/accounts/LinkWallet'

// Notifications
import Notifications from '@/pages/notifications/Notifications'

// Education
import Education from '@/pages/education/Education'

// Support
import Help from '@/pages/support/Help'
import Feedback from '@/pages/support/Feedback'

// Settings
import Settings from '@/pages/settings/Settings'

function ProtectedRoute({ children }) {
  const session     = useAuthStore((s) => s.session)
  const initialized = useAuthStore((s) => s.initialized)

  if (!initialized) return (
    <div className="app-container flex items-center justify-center min-h-dvh bg-[var(--color-surface)]">
      <span className="material-symbols-outlined text-[var(--color-primary)] text-4xl animate-spin">progress_activity</span>
    </div>
  )

  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  // Restore session once on mount
  useEffect(() => { initialize() }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"      element={<Login />} />
        <Route path="/otp"        element={<OTP />} />
        <Route path="/pin/create" element={<CreatePIN />} />
        <Route path="/terms"      element={<Terms />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected – with BottomNav */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/home"      element={<Home />} />
          <Route path="/advance"   element={<AdvanceRequest />} />
          <Route path="/history"   element={<History />} />
          <Route path="/education" element={<Education />} />
          <Route path="/settings"  element={<Settings />} />
        </Route>

        {/* Protected – without BottomNav (full-screen flows) */}
        <Route path="/advance/confirm"     element={<ProtectedRoute><AdvanceConfirm /></ProtectedRoute>} />
        <Route path="/advance/success"     element={<ProtectedRoute><AdvanceSuccess /></ProtectedRoute>} />
        <Route path="/advance/unavailable" element={<ProtectedRoute><AdvanceUnavailable /></ProtectedRoute>} />
        <Route path="/history/:id"         element={<ProtectedRoute><MovementDetail /></ProtectedRoute>} />
        <Route path="/accounts"            element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
        <Route path="/accounts/link-wallet" element={<ProtectedRoute><LinkWallet /></ProtectedRoute>} />
        <Route path="/notifications"       element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/help"                element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/feedback"            element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

        {/* Default */}
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
