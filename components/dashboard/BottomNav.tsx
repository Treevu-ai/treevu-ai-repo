'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Clock, Wallet, GraduationCap, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/history', label: 'Historial', icon: Clock },
  { href: '/request-ewa', label: 'Adelanto', icon: Wallet },
  { href: '/education', label: 'Aprende', icon: GraduationCap },
  { href: '/profile', label: 'Perfil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center px-3 py-2 min-w-[64px] transition-colors ${
                isActive 
                  ? 'text-emerald-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
