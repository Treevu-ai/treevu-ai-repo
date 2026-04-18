import { vi } from 'vitest'

export const supabaseAuthMock = {
  signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
  verifyOtp: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
  getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
}

export const supabaseMock = {
  auth: supabaseAuthMock,
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  })),
}

export function resetSupabaseMocks() {
  Object.values(supabaseAuthMock).forEach((mockFn) => {
    if (typeof mockFn?.mockReset === 'function') {
      mockFn.mockReset()
    }
  })

  supabaseAuthMock.signInWithOtp.mockResolvedValue({ error: null })
  supabaseAuthMock.verifyOtp.mockResolvedValue({ error: null })
  supabaseAuthMock.signOut.mockResolvedValue({ error: null })
  supabaseAuthMock.getSession.mockResolvedValue({ data: { session: null } })
  supabaseAuthMock.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
  supabaseAuthMock.getUser.mockResolvedValue({ data: { user: null } })

  supabaseMock.from.mockReset()
  supabaseMock.from.mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  }))
}
