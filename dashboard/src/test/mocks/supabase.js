import { vi } from 'vitest'

export const supabaseAuthMock = {
  signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
}

export const supabaseMock = {
  auth: supabaseAuthMock,
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}

export function resetSupabaseMocks() {
  supabaseAuthMock.signInWithPassword.mockReset()
  supabaseAuthMock.signOut.mockReset()
  supabaseAuthMock.getSession.mockReset()

  supabaseAuthMock.signInWithPassword.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  supabaseAuthMock.signOut.mockResolvedValue({ error: null })
  supabaseAuthMock.getSession.mockResolvedValue({ data: { session: null } })

  supabaseMock.from.mockReset()
  supabaseMock.from.mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }))
}
