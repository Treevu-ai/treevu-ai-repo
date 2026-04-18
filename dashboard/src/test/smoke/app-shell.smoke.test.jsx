import { render, screen } from '@testing-library/react'
import App from '@/App'
import { useAuthStore } from '@/store/useAuthStore'

vi.mock('@/lib/runtime', () => ({
  isDemoMode: false,
  hasSupabaseConfig: true,
  isLiveMode: true,
  isMisconfiguredMode: false,
  runtimeMode: 'live',
  assertLiveConfig: () => {},
}))

vi.mock('@/pages/overview/Overview', () => ({
  default: () => <div>OVERVIEW_SMOKE_OK</div>,
}))

vi.mock('@/pages/employees/Employees', () => ({ default: () => <div /> }))
vi.mock('@/pages/employees/EmployeeDetail', () => ({ default: () => <div /> }))
vi.mock('@/pages/advances/Advances', () => ({ default: () => <div /> }))
vi.mock('@/pages/settings/Settings', () => ({ default: () => <div /> }))
vi.mock('@/pages/predictions/Predictions', () => ({ default: () => <div /> }))
vi.mock('@/pages/impact/Impact', () => ({ default: () => <div /> }))
vi.mock('@/pages/notifications/Notifications', () => ({ default: () => <div /> }))

vi.mock('@/components/layout/Sidebar', () => ({
  default: () => <div>SIDEBAR_SMOKE</div>,
}))

vi.mock('@/components/ui/Toast', () => ({
  ToastContainer: () => null,
}))

describe('dashboard app shell smoke', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    useAuthStore.setState({
      user: null,
      employerUser: null,
      company: null,
      loading: false,
      error: null,
    })
  })

  it('redirects to login when no authenticated user exists in live mode', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('renders shell + overview when authenticated in live mode', () => {
    useAuthStore.setState({
      user: { id: 'auth-user-1', email: 'rrhh@empresa.pe' },
      employerUser: { id: 'eu-1', company_id: 'co-1' },
      company: { id: 'co-1', name: 'Empresa Test' },
    })

    render(<App />)

    expect(screen.getByText('SIDEBAR_SMOKE')).toBeInTheDocument()
    expect(screen.getByText('OVERVIEW_SMOKE_OK')).toBeInTheDocument()
  })
})
