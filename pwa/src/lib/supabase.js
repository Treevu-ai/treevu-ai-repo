import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zpvtehvxoanjgrtahbdt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdnRlaHZ4b2FuamdydGFoYmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzAyOTMsImV4cCI6MjA4OTYwNjI5M30.uyo9FHCb4RVdt30-JCvb9is2QLlUrAY5bTLM9l9T6V8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
