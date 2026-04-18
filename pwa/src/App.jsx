import { useEffect, Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import AppShell from '@/components/layout/AppShell'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-red-400">error</span>
        <p className="font-bold text-lg">Algo salió mal</p>
        <p className="text-sm text-gray-500 font-mono break-all">{this.state.error.message}</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          Reintentar
        </button>
      </div>
    )
    return this.props.children
  }
}

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
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}
