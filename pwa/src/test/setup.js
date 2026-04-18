import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'
import { resetSupabaseMocks, supabaseMock } from '@/test/mocks/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: supabaseMock,
}))

beforeEach(() => {
  resetSupabaseMocks()
})
