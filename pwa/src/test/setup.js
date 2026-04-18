@'
  import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'
import { resetSupabaseMocks, supabaseMock } from '@/test/mocks/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: supabaseMock,
}))

function createMemoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(String(key), String(value))
    },
    removeItem: (key) => {
      data.delete(String(key))
    },
    clear: () => {
      data.clear()
    },
    key: (index) => Array.from(data.keys())[index] ?? null,
    get length() {
      return data.size
    },
  }
}

function ensureStorageApi(name) {
  const current = globalThis[name]
  if (!current || typeof current.setItem !== 'function' || typeof current.clear !== 'function') {
    Object.defineProperty(globalThis, name, {
      value: createMemoryStorage(),
      configurable: true,
      writable: true,
    })
  }
}

ensureStorageApi('localStorage')
ensureStorageApi('sessionStorage')

beforeEach(() => {
  resetSupabaseMocks()
})
'@ | Set-Content -Path "pwa/src/test/setup.js" -Encoding utf8