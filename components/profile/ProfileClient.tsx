'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import BottomNav from '@/components/dashboard/BottomNav'
import { User } from '@supabase/supabase-js'
import { LogOut, Settings, HelpCircle, Shield, Bell } from 'lucide-react'

interface Employee {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  monthly_salary: number
  financial_wellness_score: number
  total_ewa_withdrawn: number
  position: string
  department: string
}

export default function ProfileClient({
  employee,
  user,
}: {
  employee: Employee
  user: User
}) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const wellnessColor = 
    employee.financial_wellness_score >= 70 ? 'text-emerald-600' :
    employee.financial_wellness_score >= 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 pt-12 pb-20 px-4">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 bg-white border-4 border-white shadow-lg">
            <AvatarFallback className="text-emerald-600 text-2xl font-bold">
              {employee.first_name.charAt(0)}
              {employee.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold text-white mt-4">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-emerald-100">{employee.position}</p>
          <p className="text-emerald-200 text-sm">{employee.department}</p>
        </div>
      </div>

      {/* Financial Wellness Card */}
      <div className="px-4 -mt-12">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Financial Wellness Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-4xl font-bold ${wellnessColor}`}>
                {employee.financial_wellness_score}
              </span>
              <span className="text-sm text-slate-500">de 100</span>
            </div>
            <Progress value={employee.financial_wellness_score} className="h-3" />
            <p className="text-xs text-slate-500 mt-2">
              {employee.financial_wellness_score >= 70 ? 'Excelente salud financiera' :
               employee.financial_wellness_score >= 40 ? 'Salud financiera moderada' : 
               'Necesitas mejorar tu salud financiera'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-4">
            <p className="text-xs text-slate-500">Salario Mensual</p>
            <p className="text-xl font-bold text-slate-900">S/ {employee.monthly_salary.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <p className="text-xs text-slate-500">Total EWA Usado</p>
            <p className="text-xl font-bold text-slate-900">S/ {employee.total_ewa_withdrawn.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Options */}
      <div className="px-4 mt-6 space-y-2">
        <Card className="bg-white">
          <CardContent className="p-0">
            <button className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 transition-colors">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="text-slate-900">Notificaciones</span>
            </button>
            <div className="border-t border-slate-100" />
            <button className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 transition-colors">
              <Shield className="h-5 w-5 text-slate-600" />
              <span className="text-slate-900">Privacidad y Seguridad</span>
            </button>
            <div className="border-t border-slate-100" />
            <button className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 transition-colors">
              <HelpCircle className="h-5 w-5 text-slate-600" />
              <span className="text-slate-900">Ayuda y Soporte</span>
            </button>
            <div className="border-t border-slate-100" />
            <button className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 transition-colors">
              <Settings className="h-5 w-5 text-slate-600" />
              <span className="text-slate-900">Configuración</span>
            </button>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full text-red-600 border-red-200 hover:bg-red-50 mt-4"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
