'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Employee {
  first_name: string
  last_name: string
}

export default function NavBar({
  employee,
  onLogout,
}: {
  employee: Employee
  onLogout: () => void
}) {
  const router = useRouter()

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-emerald-600">Treevü</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 bg-emerald-600">
              <AvatarFallback className="text-white">
                {employee.first_name.charAt(0)}
                {employee.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {employee.first_name} {employee.last_name}
              </p>
              <p className="text-xs text-slate-600">Empleado</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </nav>
  )
}
