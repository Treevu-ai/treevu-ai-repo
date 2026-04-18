import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import OTP from '@/pages/auth/OTP'
import { useAuthStore } from '@/store/useAuthStore'
import { supabaseMock } from '@/test/mocks/supabase'

function renderOTP() {
  return render(
    <MemoryRouter initialEntries={['/otp']}>
      <Routes>
        <Route path="/otp" element={<OTP />} />
        <Route path="/home" element={<div>HOME_OK</div>} />
        <Route path="/pin/create" element={<div>PIN_CREATE_OK</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PWA smoke: OTP verification', () => {
  beforeEach(() => {
    useAuthStore.setState({
      phone: 'ana@empresa.com',
      pinCreated: true,
    })
  })

  it('blocks verify until 8 digits and verifies with full code', async () => {
    const user = userEvent.setup()
    supabaseMock.auth.verifyOtp.mockResolvedValue({ error: null })

    renderOTP()

    const verifyButton = screen.getByRole('button', { name: /verificar código/i })
    expect(verifyButton).toBeDisabled()

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(8)

    await user.type(inputs[0], '1')
    await user.type(inputs[1], '2')
    await user.type(inputs[2], '3')
    await user.type(inputs[3], '4')
    await user.type(inputs[4], '5')
    await user.type(inputs[5], '6')
    await user.type(inputs[6], '7')
    await user.type(inputs[7], '8')

    expect(verifyButton).not.toBeDisabled()
    await user.click(verifyButton)

    expect(supabaseMock.auth.verifyOtp).toHaveBeenCalledWith({
      email: 'ana@empresa.com',
      token: '12345678',
      type: 'email',
    })

    expect(await screen.findByText('HOME_OK')).toBeInTheDocument()
  })

  it('allows 8-digit paste flow as smoke path', async () => {
    renderOTP()
    const verifyButton = screen.getByRole('button', { name: /verificar código/i })
    const firstInput = screen.getAllByRole('textbox')[0]

    fireEvent.paste(firstInput, {
      clipboardData: {
        getData: () => '87654321',
      },
    })

    expect(verifyButton).not.toBeDisabled()
  })
})
