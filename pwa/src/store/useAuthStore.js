import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create(
  persist(
    (set) => ({
      user:               null,
      session:            null,
      phone:              null,
      pinCreated:         false,
      onboardingComplete: false,
      initialized:        false,

      setUser:               (user)    => set({ user }),
      setSession:            (session) => set({ session }),
      setPhone:              (phone)   => set({ phone }),
      setPinCreated:         (v)       => set({ pinCreated: v }),
      setOnboardingComplete: (v)       => set({ onboardingComplete: v }),

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, phone: null, pinCreated: false, onboardingComplete: false })
      },

      // Call once at app boot — restores session + listens for changes
      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        set({ session, user: session?.user ?? null, initialized: true })

        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null })
        })
      },
    }),
    {
      name: 'treevu-auth',
      // Only persist non-sensitive UI state — session comes from Supabase
      partialize: (s) => ({
        phone:              s.phone,
        pinCreated:         s.pinCreated,
        onboardingComplete: s.onboardingComplete,
      }),
    }
  )
)
