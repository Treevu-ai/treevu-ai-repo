export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-[12px] border border-[#e2e5ec] shadow-sm ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function KpiCard({ label, value, subtext, icon, color = 'primary', trend }) {
  const colors = {
    primary: { bg: 'bg-[#eef0ff]', text: 'text-[#000666]', icon: 'text-[#000666]' },
    success: { bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]', icon: 'text-[#16a34a]' },
    warning: { bg: 'bg-[#fef3c7]', text: 'text-[#d97706]', icon: 'text-[#d97706]' },
    error:   { bg: 'bg-[#fee2e2]', text: 'text-[#dc2626]', icon: 'text-[#dc2626]' },
  }
  const c = colors[color]
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#4b5563] font-medium mb-1">{label}</p>
          <p className={`text-2xl font-display font-bold ${c.text}`}>{value}</p>
          {subtext && <p className="text-xs text-[#9ca3af] mt-1">{subtext}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
              <span className="material-symbols-outlined text-[14px] align-middle">
                {trend >= 0 ? 'trending_up' : 'trending_down'}
              </span>{' '}
              {Math.abs(trend)}% vs mes anterior
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-[10px] ${c.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined icon-filled text-[22px] ${c.icon}`}>{icon}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
