import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      phone: null,
      pinCreated: false,
      onboardingComplete: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setPhone: (phone) => set({ phone }),
      setPinCreated: (v) => set({ pinCreated: v }),
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      logout: () => set({ user: null, session: null, phone: null, pinCreated: false }),
    }),
    { name: 'treevu-auth' }
  )
)
