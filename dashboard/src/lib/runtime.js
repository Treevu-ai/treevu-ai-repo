const demoFlag = import.meta.env.VITE_DEMO_MODE
const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isDemoMode = demoFlag === 'true'
export const hasSupabaseConfig = Boolean(url && anon)
export const isLiveMode = !isDemoMode && hasSupabaseConfig
export const isMisconfiguredMode = !isDemoMode && !hasSupabaseConfig
export const runtimeMode = isDemoMode ? 'demo' : isLiveMode ? 'live' : 'misconfigured'

export function assertLiveConfig(message = 'Faltan variables de Supabase para ejecutar el dashboard en modo real.') {
  if (isMisconfiguredMode) {
    throw new Error(message)
  }
}
