import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from '@/pages/auth/Login'
import { useAuthStore } from '@/store/useAuthStore'
import { supabaseMock } from '@/test/mocks/supabase'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('PWA login smoke', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    supabaseMock.auth.signInWithOtp.mockResolvedValue({ error: null })
    useAuthStore.setState({
      user: null,
      session: null,
      phone: null,
      pinCreated: false,
      onboardingComplete: false,
      initialized: true,
    })
  })

  it('submits valid email and routes to OTP screen', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), {
      target: { value: 'qa@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(supabaseMock.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'qa@example.com',
        options: { shouldCreateUser: true },
      })
    })

    expect(useAuthStore.getState().phone).toBe('qa@example.com')
    expect(mockNavigate).toHaveBeenCalledWith('/otp')
  })
})
