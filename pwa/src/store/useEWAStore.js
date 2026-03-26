import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { calcEarnedWage, calcAvailable, calcDaysWorked } from '../utils/ewa'

// Map DB advance status to the labels pages expect
function mapStatus(s) {
  if (s === 'paid') return 'completed'
  if (s === 'requested') return 'pending'
  if (s === 'approved' || s === 'processing') return 'processing'
  if (s === 'rejected') return 'rejected'
  return s
}

function toTransaction(adv, wallets, payday) {
  const wallet = wallets.find((w) => w.id === adv.destination_wallet_id)
  const destination = wallet
    ? `${wallet.type} · ${wallet.number}`
    : adv.disbursement_method ?? 'Pendiente'
  return {
    id: adv.id,
    type: 'advance',
    amount: adv.amount,
    date: adv.requested_at,
    status: mapStatus(adv.status),
    rawStatus: adv.status,
    destination,
    deductionDate: payday,
  }
}

export const useEWAStore = create((set, get) => ({
  employee: null,
  advances: [],
  transactions: [],
  wallets: [],
  cycle: null,
  pendingTransfer: null,
  requestedAmount: 0,
  selectedWallet: null,
  loading: false,
  error: null,

  setRequestedAmount: (amount) => set({ requestedAmount: amount }),
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  setPendingTransfer: (transfer) => set({ pendingTransfer: transfer }),

  async loadEmployeeData() {
    set({ loading: true, error: null })
    try {
      // Get auth user id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      // Fetch employee + company config
      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('*, companies(id, name, ewa_limit_pct, ewa_max_pct, max_advances_per_month, payroll_cycle, ewa_enabled)')
        .eq('auth_user_id', user.id)
        .single()

      if (empErr || !emp) throw new Error('Empleado no encontrado. Contacta a tu empleador.')

      const company = emp.companies

      // Fetch active payroll cycle
      const { data: cycle } = await supabase
        .from('payroll_cycles')
        .select('*')
        .eq('company_id', emp.company_id)
        .eq('status', 'open')
        .order('period_start', { ascending: false })
        .limit(1)
        .single()

      // Fetch advances this cycle
      const { data: advancesData } = await supabase
        .from('advances')
        .select('*')
        .eq('employee_id', emp.id)
        .gte('requested_at', cycle?.period_start ?? new Date().toISOString().slice(0, 7) + '-01')
        .order('requested_at', { ascending: false })

      const advances = advancesData ?? []

      // Fetch wallets
      const { data: walletsData } = await supabase
        .from('employee_wallets')
        .select('*')
        .eq('employee_id', emp.id)
        .order('is_primary', { ascending: false })

      const wallets = walletsData ?? []

      // Calculate EWA amounts
      const periodStart = cycle?.period_start ?? new Date().toISOString().slice(0, 10)
      const periodEnd = cycle?.period_end ?? new Date().toISOString().slice(0, 10)
      const { daysWorked, totalDays } = calcDaysWorked(periodStart, periodEnd)

      const alreadyUsed = advances
        .filter((a) => ['approved', 'processing', 'paid'].includes(a.status))
        .reduce((s, a) => s + a.amount, 0)

      const limitPct = emp.ewa_custom_limit_pct ?? company.ewa_limit_pct
      const earnedWage = calcEarnedWage(emp.base_salary, daysWorked, totalDays)
      const available = calcAvailable(earnedWage, limitPct, alreadyUsed)
      const maxAdvance = earnedWage * (company.ewa_max_pct / 100)
      const advanceCount = advances.filter((a) => a.status !== 'rejected').length

      const employee = {
        id: emp.id,
        name: emp.name,
        company: company.name,
        companyId: emp.company_id,
        baseSalary: emp.base_salary,
        daysWorked,
        totalDays,
        earnedWage: Math.round(earnedWage * 100) / 100,
        availableAdvance: Math.round(available * 100) / 100,
        maxAdvance: Math.round(maxAdvance * 100) / 100,
        nextPayday: cycle?.payday ?? periodEnd,
        advanceCount,
        wallets,
        banks: [],
        ewaEnabled: emp.ewa_enabled,
        limitPct,
      }

      const transactions = advances.map((a) => toTransaction(a, wallets, cycle?.payday))

      set({ employee, advances, transactions, wallets, cycle, loading: false })
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  async submitAdvance(amount, wallet) {
    const { employee, advances, wallets, cycle } = get()
    const { data, error } = await supabase
      .from('advances')
      .insert({
        employee_id: employee.id,
        payroll_cycle_id: cycle?.id ?? null,
        amount,
        currency: 'PEN',
        status: 'requested',
        destination_wallet_id: wallet?.id ?? null,
      })
      .select()
      .single()

    if (error) throw error

    const newAdvances = [data, ...advances]
    const newTransactions = newAdvances.map((a) => toTransaction(a, wallets, cycle?.payday))

    const pendingTransfer = {
      id: data.id,
      amount,
      wallet,
      requestedAt: data.requested_at,
      status: 'pending',
      estimatedArrival: '24 horas',
    }

    set((s) => ({
      advances: newAdvances,
      transactions: newTransactions,
      pendingTransfer,
      employee: {
        ...s.employee,
        availableAdvance: Math.max(0, s.employee.availableAdvance - amount),
        advanceCount: s.employee.advanceCount + 1,
      },
    }))

    return data
  },

  subscribeToAdvanceUpdates(employeeId) {
    const channel = supabase
      .channel(`advances_employee_${employeeId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'advances', filter: `employee_id=eq.${employeeId}` },
        (payload) => {
          const { wallets, cycle } = get()
          set((s) => {
            const newAdvances = s.advances.map((a) =>
              a.id === payload.new.id ? { ...a, ...payload.new } : a
            )
            const newTransactions = newAdvances.map((a) => toTransaction(a, wallets, cycle?.payday))
            return { advances: newAdvances, transactions: newTransactions }
          })
        }
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  },

  addWallet(wallet) {
    const newWallet = { ...wallet, id: `w-${Date.now()}` }
    set((s) => ({
      wallets: [...s.wallets, newWallet],
      employee: s.employee
        ? { ...s.employee, wallets: [...(s.employee.wallets ?? []), newWallet] }
        : s.employee,
    }))
  },
}))
