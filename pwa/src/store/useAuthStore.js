import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      phone: null,
      pinCreated: false,
      onboardingComplete: false,
      loading: false,
      error: null,

      setPhone: (phone) => set({ phone }),
      setPinCreated: (v) => set({ pinCreated: v }),
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),

      async sendOTP(phone) {
        set({ loading: true, error: null })
        const { error } = await supabase.auth.signInWithOtp({ phone })
        set({ loading: false, error: error?.message ?? null })
        return { ok: !error }
      },

      async verifyOTP(phone, token) {
        set({ loading: true, error: null })
        const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
        if (error) {
          set({ loading: false, error: error.message })
          return { ok: false }
        }
        set({ session: data.session, user: data.user, loading: false })
        return { ok: true }
      },

      async refreshSession() {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          set({ user: null, session: null })
          return
        }
        set({ session: data.session, user: data.session.user })
      },

      async logout() {
        await supabase.auth.signOut()
        set({ user: null, session: null, phone: null, pinCreated: false, onboardingComplete: false })
      },
    }),
    {
      name: 'treevu-auth',
      partialize: (s) => ({
        user: s.user,
        session: s.session,
        phone: s.phone,
        pinCreated: s.pinCreated,
        onboardingComplete: s.onboardingComplete,
      }),
    }
  )
)
