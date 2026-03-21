import { useCompanyStore } from '../../store/useCompanyStore'

export default function TopBar({ title, actions }) {
  const advances = useCompanyStore(s => s.advances)
  const pendingAdvances = advances.filter(a => a.status === 'requested')

  return (
    <header className="h-16 bg-white border-b border-[#e2e5ec] flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-display font-bold text-[#111827]">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Pending badge */}
        {pendingAdvances.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fef3c7] border border-[#fde68a]">
            <span className="material-symbols-outlined icon-filled text-[16px] text-[#d97706]">notifications_active</span>
            <span className="text-xs font-semibold text-[#92400e]">
              {pendingAdvances.length} avance{pendingAdvances.length > 1 ? 's' : ''} pendiente{pendingAdvances.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Extra actions slot */}
        {actions}
      </div>
    </header>
  )
}
