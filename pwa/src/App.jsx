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
  const session = useAuthStore((s) => s.session)
  // In demo mode, always allow access
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/pin/create" element={<CreatePIN />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected – with BottomNav */}
        <Route element={<AppShell />}>
          <Route path="/home" element={<Home />} />
          <Route path="/advance" element={<AdvanceRequest />} />
          <Route path="/history" element={<History />} />
          <Route path="/education" element={<Education />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Protected – without BottomNav (full-screen flows) */}
        <Route path="/advance/confirm" element={<AdvanceConfirm />} />
        <Route path="/advance/success" element={<AdvanceSuccess />} />
        <Route path="/advance/unavailable" element={<AdvanceUnavailable />} />
        <Route path="/history/:id" element={<MovementDetail />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/link-wallet" element={<LinkWallet />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/help" element={<Help />} />
        <Route path="/feedback" element={<Feedback />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
