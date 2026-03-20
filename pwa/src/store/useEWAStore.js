import { create } from 'zustand'

// Mock employee data – will be replaced by Supabase queries
const MOCK_EMPLOYEE = {
  id: 'emp-001',
  name: 'Ana García',
  company: 'Ripley Perú',
  baseSalary: 2400,
  daysWorked: 18,
  totalDays: 30,
  earnedWage: 1440,       // baseSalary * (daysWorked / totalDays)
  availableAdvance: 720,  // 50% of earnedWage
  maxAdvance: 1080,       // 75% of earnedWage
  nextPayday: '2026-03-31',
  lastAdvanceDate: null,
  advanceCount: 0,
  wallets: [
    { id: 'w1', type: 'yape', number: '951 234 567', label: 'Yape Personal', primary: true },
  ],
  banks: [],
}

export const useEWAStore = create((set, get) => ({
  employee: MOCK_EMPLOYEE,
  transactions: [
    {
      id: 'tx-001',
      type: 'advance',
      amount: 500,
      date: '2026-02-15',
      status: 'completed',
      destination: 'Yape · 951 234 567',
      deductionDate: '2026-02-28',
    },
    {
      id: 'tx-002',
      type: 'advance',
      amount: 300,
      date: '2026-01-20',
      status: 'completed',
      destination: 'Yape · 951 234 567',
      deductionDate: '2026-01-31',
    },
  ],
  pendingTransfer: null,
  requestedAmount: 0,
  selectedWallet: null,

  // Actions
  setRequestedAmount: (amount) => set({ requestedAmount: amount }),
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  setPendingTransfer: (transfer) => set({ pendingTransfer: transfer }),

  confirmAdvance: (amount, wallet) => {
    const { employee } = get()
    const transfer = {
      id: `tx-${Date.now()}`,
      amount,
      wallet,
      requestedAt: new Date().toISOString(),
      status: 'processing',
      estimatedArrival: '24 horas',
    }
    set({
      pendingTransfer: transfer,
      employee: {
        ...employee,
        availableAdvance: employee.availableAdvance - amount,
        advanceCount: employee.advanceCount + 1,
        lastAdvanceDate: new Date().toISOString(),
      },
    })
    return transfer
  },

  addWallet: (wallet) =>
    set((state) => ({
      employee: {
        ...state.employee,
        wallets: [...state.employee.wallets, { ...wallet, id: `w-${Date.now()}` }],
      },
    })),
}))
