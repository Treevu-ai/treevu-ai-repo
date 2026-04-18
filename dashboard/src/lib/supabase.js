import { createClient } from '@supabase/supabase-js'
import { assertLiveConfig, hasSupabaseConfig, isDemoMode } from './runtime'

const url = import.meta.env.VITE_SUPABASE_URL  || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!isDemoMode) {
  assertLiveConfig('Dashboard en modo real requiere VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
}

// In demo mode we keep a no-op proxy; in live mode config must exist and createClient is mandatory.
export const supabase = hasSupabaseConfig
  ? createClient(url, key)
  : new Proxy({}, { get: () => () => ({ data: null, error: null }) })
