import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

function calcEWA(employee, cycle, advances) {
  const today = new Date()
  const start = new Date(cycle.period_start)
  const end   = new Date(cycle.period_end)
  const totalDays  = Math.round((end - start) / 86400000) + 1
  const workedDays = Math.min(Math.round((today - start) / 86400000) + 1, totalDays)
  const earnedWage = parseFloat(employee.base_salary) * (workedDays / totalDays)

  const limitPct = parseFloat(employee.ewa_custom_limit_pct ?? employee.company.ewa_limit_pct) / 100
  const maxPct   = parseFloat(employee.company.ewa_max_pct) / 100

  const paidThisCycle = advances
    .filter(a => a.payroll_cycle_id === cycle.id && ['approved','processing','paid'].includes(a.status))
    .reduce((sum, a) => sum + parseFloat(a.amount), 0)

  const availableAdvance = Math.max(0, earnedWage * limitPct - paidThisCycle)
  const maxAdvance       = earnedWage * maxPct

  return { earnedWage, availableAdvance, maxAdvance, workedDays, totalDays, paidThisCycle }
}

export const useEWAStore = create((set, get) => ({
  employee:        null,
  cycle:           null,
  advances:        [],
  transactions:    [],
  wallets:         [],
  loading:         false,
  error:           null,
  pendingTransfer: null,
  requestedAmount: 0,
  selectedWallet:  null,

  setRequestedAmount: (amount)   => set({ requestedAmount: amount }),
  setSelectedWallet:  (wallet)   => set({ selectedWallet: wallet }),
  setPendingTransfer: (transfer) => set({ pendingTransfer: transfer }),

  loadEmployee: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('not authenticated')

      // Primary lookup by auth_user_id
      let { data: emp } = await supabase
        .from('employees')
        .select('*, company:companies(*)')
        .eq('auth_user_id', user.id)
        .single()

      // Fallback: match by email and auto-link
      if (!emp) {
        const { data: byEmail } = await supabase
          .from('employees')
          .select('*, company:companies(*)')
          .eq('email', user.email)
          .single()

        if (byEmail) {
          await supabase
            .from('employees')
            .update({ auth_user_id: user.id })
            .eq('id', byEmail.id)
          emp = { ...byEmail, auth_user_id: user.id }
        }
      }

      if (!emp) throw new Error('employee not found')

      const [cycleRes, advancesRes, walletsRes] = await Promise.all([
        supabase
          .from('payroll_cycles')
          .select('*')
          .eq('company_id', emp.company_id)
          .eq('status', 'open')
          .order('period_start', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('advances')
          .select('*')
          .eq('employee_id', emp.id)
          .order('requested_at', { ascending: false }),
        supabase
          .from('employee_wallets')
          .select('*')
          .eq('employee_id', emp.id)
          .order('is_primary', { ascending: false }),
      ])

      const cycle    = cycleRes.data
      const advances = advancesRes.data ?? []
      const wallets  = walletsRes.data ?? []
      const ewa      = cycle ? calcEWA(emp, cycle, advances) : {}

      set({
        employee: { ...emp, ...ewa, advanceCount: advances.length },
        cycle,
        advances,
        wallets,
        loading: false,
      })
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  confirmAdvance: async (amount, wallet) => {
    const { employee, cycle } = get()
    const transfer = {
      id:          `tx-${Date.now()}`,
      amount,
      wallet,
      requestedAt: new Date().toISOString(),
    }
    set({ pendingTransfer: transfer })

    const { data, error } = await supabase
      .from('advances')
      .insert({
        employee_id:           employee.id,
        payroll_cycle_id:      cycle?.id ?? null,
        amount,
        currency:              'PEN',
        status:                'requested',
        auto_approved:         false,
        destination_wallet_id: wallet?.id ?? null,
        disbursement_method:   wallet?.type ?? null,
      })
      .select()
      .single()

    if (!error && data) {
      set((s) => ({
        advances: [data, ...s.advances],
        employee: {
          ...s.employee,
          availableAdvance: Math.max(0, s.employee.availableAdvance - amount),
          paidThisCycle:    (s.employee.paidThisCycle ?? 0) + amount,
          advanceCount:     (s.employee.advanceCount ?? 0) + 1,
        },
      }))
    }
    return { data, error }
  },

  addWallet: async (type, number, alias) => {
    const { employee } = get()
    const { data, error } = await supabase
      .from('employee_wallets')
      .insert({ employee_id: employee.id, type, number, alias, is_primary: false })
      .select()
      .single()

    if (!error && data) {
      set((s) => ({ wallets: [...s.wallets, data] }))
    }
    return { data, error }
  },
}))
