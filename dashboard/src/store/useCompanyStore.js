import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { calcEarnedWage, calcAvailable, calcDaysWorked } from '../utils/ewa'

// ─── Mock data (used only when VITE_SUPABASE_URL is not set) ────────────────────
const CYCLE_START = '2026-03-01'
const CYCLE_END   = '2026-03-31'

const MOCK_EMPLOYEES = [
  { id: 'emp-1', name: 'Ana García',      dni: '45123456', phone: '+51987654321', base_salary: 2400, position: 'Vendedora',       department: 'Tienda', active: true, ewa_enabled: true, start_date: '2022-01-15' },
  { id: 'emp-2', name: 'Luis Torres',     dni: '47891234', phone: '+51976543210', base_salary: 3200, position: 'Supervisor',      department: 'Tienda', active: true, ewa_enabled: true, start_date: '2020-06-01' },
  { id: 'emp-3', name: 'María Quispe',    dni: '43567890', phone: '+51965432109', base_salary: 2800, position: 'Cajera',          department: 'Caja',   active: true, ewa_enabled: true, start_date: '2021-09-10' },
  { id: 'emp-4', name: 'Jorge Huanca',    dni: '46234567', phone: '+51954321098', base_salary: 2600, position: 'Almacenero',      department: 'Logística', active: true, ewa_enabled: false, start_date: '2023-02-20' },
  { id: 'emp-5', name: 'Rosa Mamani',     dni: '44890123', phone: '+51943210987', base_salary: 2400, position: 'Vendedora',       department: 'Tienda', active: true, ewa_enabled: true, start_date: '2022-07-05' },
  { id: 'emp-6', name: 'Pedro Ccopa',     dni: '48345678', phone: '+51932109876', base_salary: 4500, position: 'Gerente Tienda',  department: 'Gerencia', active: true, ewa_enabled: true, start_date: '2019-03-01' },
  { id: 'emp-7', name: 'Carmen López',    dni: '41678901', phone: '+51921098765', base_salary: 2800, position: 'Cajera Senior',   department: 'Caja',   active: true, ewa_enabled: true, start_date: '2021-11-15' },
  { id: 'emp-8', name: 'Marco Villanueva',dni: '49012345', phone: '+51910987654', base_salary: 3000, position: 'Técnico IT',      department: 'TI',     active: false, ewa_enabled: false, start_date: '2023-01-10' },
]

const MOCK_ADVANCES = [
  { id: 'adv-1',  employee_id: 'emp-1', amount: 500,  status: 'paid',        auto_approved: true,  requested_at: '2026-03-05T10:23:00Z', paid_at: '2026-03-05T11:00:00Z', disbursement_method: 'yape'    },
  { id: 'adv-2',  employee_id: 'emp-2', amount: 800,  status: 'paid',        auto_approved: true,  requested_at: '2026-03-08T09:15:00Z', paid_at: '2026-03-08T10:00:00Z', disbursement_method: 'bcp'     },
  { id: 'adv-3',  employee_id: 'emp-3', amount: 600,  status: 'processing',  auto_approved: true,  requested_at: '2026-03-18T14:30:00Z', paid_at: null,                   disbursement_method: 'yape'    },
  { id: 'adv-4',  employee_id: 'emp-5', amount: 400,  status: 'requested',   auto_approved: false, requested_at: '2026-03-19T16:45:00Z', paid_at: null,                   disbursement_method: 'plin'    },
  { id: 'adv-5',  employee_id: 'emp-7', amount: 700,  status: 'approved',    auto_approved: true,  requested_at: '2026-03-19T17:10:00Z', paid_at: null,                   disbursement_method: 'yape'    },
  { id: 'adv-6',  employee_id: 'emp-1', amount: 300,  status: 'paid',        auto_approved: true,  requested_at: '2026-03-12T11:00:00Z', paid_at: '2026-03-12T11:30:00Z', disbursement_method: 'yape'    },
  { id: 'adv-7',  employee_id: 'emp-6', amount: 1200, status: 'rejected',    auto_approved: false, requested_at: '2026-03-15T08:00:00Z', paid_at: null,                   disbursement_method: 'interbank', rejection_reason: 'Monto supera límite del ciclo' },
  { id: 'adv-8',  employee_id: 'emp-2', amount: 500,  status: 'paid',        auto_approved: true,  requested_at: '2026-03-16T13:20:00Z', paid_at: '2026-03-16T14:00:00Z', disbursement_method: 'bcp'     },
]

function enrichEmployees(employees, advances, company) {
  const { daysWorked, totalDays } = calcDaysWorked(CYCLE_START, CYCLE_END)
  return employees.map(emp => {
    const empAdvances = advances.filter(a =>
      a.employee_id === emp.id && ['approved','processing','paid'].includes(a.status)
    )
    const alreadyUsed = empAdvances.reduce((s, a) => s + a.amount, 0)
    const limitPct = emp.ewa_custom_limit_pct ?? company.ewa_limit_pct
    const earnedWage = calcEarnedWage(emp.base_salary, daysWorked, totalDays)
    const available  = calcAvailable(earnedWage, limitPct, alreadyUsed)
    return {
      ...emp,
      daysWorked, totalDays,
      earnedWage: Math.round(earnedWage * 100) / 100,
      available:  Math.round(available  * 100) / 100,
      alreadyUsed,
      advancesThisCycle: empAdvances.length,
    }
  })
}

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useCompanyStore = create((set, get) => ({
  employees:  [],
  advances:   [],
  cycle:      null,
  loading:    false,
  error:      null,

  async load(companyId) {
    set({ loading: true, error: null })

    const isDemoMode = !import.meta.env.VITE_SUPABASE_URL
    if (isDemoMode) {
      const company = { ewa_limit_pct: 50, ewa_max_pct: 75 }
      const enriched = enrichEmployees(MOCK_EMPLOYEES, MOCK_ADVANCES, company)
      set({
        employees: enriched,
        advances: MOCK_ADVANCES,
        cycle: { period_start: CYCLE_START, period_end: CYCLE_END, payday: '2026-03-31', status: 'open' },
        loading: false,
      })
      return
    }

    try {
      const { data: empData, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .order('name')

      if (empErr) throw empErr

      const { data: advData, error: advErr } = await supabase
        .from('advances')
        .select('*, employees(name, base_salary)')
        .order('requested_at', { ascending: false })

      if (advErr) throw advErr

      const { data: cycleData, error: cycleErr } = await supabase
        .from('payroll_cycles')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'open')
        .order('period_start', { ascending: false })
        .limit(1)
        .single()

      if (cycleErr && cycleErr.code !== 'PGRST116') throw cycleErr

      const employees = empData ?? []
      const advances  = advData ?? []
      const cycle     = cycleData ?? { period_start: CYCLE_START, period_end: CYCLE_END, payday: '2026-03-31', status: 'open' }

      const company = { ewa_limit_pct: 50, ewa_max_pct: 75 }
      const enriched = enrichEmployees(employees, advances, company)

      set({ employees: enriched, advances, cycle, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  // Optimistic status update + persist to Supabase
  async updateAdvanceStatus(id, status, extra = {}) {
    set(s => ({
      advances: s.advances.map(a =>
        a.id === id ? { ...a, status, ...extra } : a
      )
    }))

    if (import.meta.env.VITE_SUPABASE_URL) {
      const patch = { status, updated_at: new Date().toISOString(), ...extra }
      if (status === 'approved') patch.approved_at = new Date().toISOString()
      if (status === 'rejected') patch.rejected_at = new Date().toISOString()
      await supabase.from('advances').update(patch).eq('id', id)
    }
  },

  addEmployee(emp) {
    const company = { ewa_limit_pct: 50, ewa_max_pct: 75 }
    const enriched = enrichEmployees([emp], get().advances, company)[0]
    set(s => ({ employees: [enriched, ...s.employees] }))
  },

  updateEmployee(id, patch) {
    set(s => ({
      employees: s.employees.map(e => e.id === id ? { ...e, ...patch } : e)
    }))
  },

  // Computed selectors
  get activeEmployees() { return get().employees.filter(e => e.active) },
  get advancesThisMonth() { return get().advances.filter(a => a.status !== 'rejected') },
  get pendingAdvances()  { return get().advances.filter(a => a.status === 'requested') },
}))
