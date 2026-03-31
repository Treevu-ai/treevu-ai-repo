import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL  || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// In demo mode (no Supabase configured), export a no-op proxy to avoid "Jwt is missing" errors
export const supabase = url
  ? createClient(url, key)
  : new Proxy({}, { get: () => () => ({ data: null, error: null }) })
