import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "PEN"): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function calculateEarnedSalary(
  monthlySalary: number,
  startDate: Date,
  currentDate: Date = new Date()
): number {
  const start = new Date(startDate)
  const current = new Date(currentDate)
  
  // Get the first day of the current pay period (1st or 16th)
  const payPeriodStart = new Date(current.getFullYear(), current.getMonth(), current.getDate() >= 16 ? 16 : 1)
  
  // If start date is after pay period start, use start date
  const effectiveStart = start > payPeriodStart ? start : payPeriodStart
  
  // Calculate working days
  const totalDaysInPeriod = 15
  const daysWorked = Math.max(0, Math.min(
    Math.floor((current.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    totalDaysInPeriod
  ))
  
  const dailySalary = monthlySalary / 30
  return Math.floor(dailySalary * daysWorked)
}

export function getFinancialWellnessLevel(score: number): {
  level: string
  color: string
  description: string
} {
  if (score >= 80) {
    return {
      level: "Excelente",
      color: "text-primary",
      description: "Tu salud financiera es ejemplar",
    }
  } else if (score >= 60) {
    return {
      level: "Bueno",
      color: "text-treevu-emerald",
      description: "Vas por buen camino financiero",
    }
  } else if (score >= 40) {
    return {
      level: "Regular",
      color: "text-treevu-gold",
      description: "Hay oportunidades de mejora",
    }
  } else {
    return {
      level: "Necesita atención",
      color: "text-destructive",
      description: "Te recomendamos revisar tu educación financiera",
    }
  }
}
