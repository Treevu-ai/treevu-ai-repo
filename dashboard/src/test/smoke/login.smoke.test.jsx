import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import { useAuthStore } from '@/store/useAuthStore'

const mockNavigate = vi.fn()

vi.mock('@/lib/runtime', () => ({
  isDemoMode: false,
  hasSupabaseConfig: true,
  isLiveMode: true,
  isMisconfiguredMode: false,
  runtimeMode: 'live',
  assertLiveConfig: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('dashboard smoke: login', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    useAuthStore.setState({
      user: null,
      employerUser: null,
      company: null,
      loading: false,
      error: null,
      clearError: vi.fn(),
      login: vi.fn().mockResolvedValue({ ok: true }),
    })
  })

  it('submits credentials and navigates to overview when login succeeds', async () => {
    const loginSpy = vi.fn().mockResolvedValue({ ok: true })
    useAuthStore.setState({ login: loginSpy })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('rrhh@empresa.pe'), {
      target: { value: 'rrhh@empresa.pe' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '12345678' },
    })

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('rrhh@empresa.pe', '12345678')
    })
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })
})
