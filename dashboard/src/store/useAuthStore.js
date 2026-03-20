import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,          // auth.User
      employerUser: null,  // employer_users row
      company: null,       // companies row
      loading: false,
      error: null,

      // --- Actions ---

      async login(email, password) {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error

          // Fetch employer_user + company in one go
          const { data: eu, error: euErr } = await supabase
            .from('employer_users')
            .select('*, companies(*)')
            .eq('auth_user_id', data.user.id)
            .single()

          if (euErr || !eu) throw new Error('Usuario no encontrado en el sistema. Verifica con tu administrador.')

          set({
            user: data.user,
            employerUser: eu,
            company: eu.companies,
            loading: false,
          })
          return { ok: true }
        } catch (err) {
          set({ loading: false, error: err.message })
          return { ok: false, error: err.message }
        }
      },

      async logout() {
        await supabase.auth.signOut()
        set({ user: null, employerUser: null, company: null })
      },

      async refreshSession() {
        const { data } = await supabase.auth.getSession()
        if (!data.session) return set({ user: null })
        if (!get().employerUser) {
          const { data: eu } = await supabase
            .from('employer_users')
            .select('*, companies(*)')
            .eq('auth_user_id', data.session.user.id)
            .single()
          if (eu) set({ user: data.session.user, employerUser: eu, company: eu.companies })
        }
      },

      clearError() { set({ error: null }) },
    }),
    {
      name: 'treevu-employer-auth',
      partialize: (s) => ({ user: s.user, employerUser: s.employerUser, company: s.company }),
    }
  )
)

// ─── MOCK helper (demo mode when Supabase not configured) ─────────────────────
export const MOCK_AUTH = {
  user: { id: 'mock-user-1', email: 'rrhh@ripley.pe' },
  employerUser: {
    id: 'mock-eu-1',
    name: 'Carlos Mendoza',
    email: 'rrhh@ripley.pe',
    role: 'admin',
    company_id: '11111111-0000-0000-0000-000000000001',
  },
  company: {
    id: '11111111-0000-0000-0000-000000000001',
    name: 'Ripley Perú S.A.',
    ruc: '20331268064',
    country: 'PE',
    ewa_limit_pct: 50,
    ewa_max_pct: 75,
    max_advances_per_month: 2,
    payroll_cycle: 'monthly',
    ewa_enabled: true,
  },
}
