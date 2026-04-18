import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/pages/home/Home'
import { useEWAStore } from '@/store/useEWAStore'
import { useAuthStore } from '@/store/useAuthStore'

vi.mock('@/components/ui/Card', () => ({
  default: ({ children }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/Button', () => ({
  default: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}))

vi.mock('@/components/ui/PulseBar', () => ({
  default: () => <div data-testid="pulsebar" />,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('home smoke', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    window.localStorage.clear()
  })

  it('shows error fallback card when employee load fails', async () => {
    useAuthStore.setState({
      logout: vi.fn().mockResolvedValue(undefined),
    })

    useEWAStore.setState({
      employee: null,
      loading: false,
      error: 'employee not found',
      transactions: [],
      loadEmployee: vi.fn().mockResolvedValue(undefined),
    })

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('No pudimos cargar tu inicio')).toBeInTheDocument()
    })
    expect(screen.getByText('employee not found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('navigates to login after logout from error fallback', async () => {
    const logoutSpy = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({
      logout: logoutSpy,
    })

    useEWAStore.setState({
      employee: null,
      loading: false,
      error: 'employee not found',
      transactions: [],
      loadEmployee: vi.fn().mockResolvedValue(undefined),
    })

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(logoutSpy).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })
})
