import { create } from 'zustand'
import { useEffect } from 'react'

export const useToast = create((set) => ({
  toasts: [],
  show({ message, type = 'info', duration = 4000 }) {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), duration)
  },
  dismiss(id) { set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })) },
}))

const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' }
const colors = {
  success: 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]',
  error:   'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]',
  warning: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
  info:    'bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe]',
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-[10px] border shadow-lg
            pointer-events-auto min-w-[280px] max-w-sm
            animate-in slide-in-from-right duration-200
            ${colors[t.type]}
          `}
        >
          <span className="material-symbols-outlined icon-filled text-[20px] shrink-0">{icons[t.type]}</span>
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
