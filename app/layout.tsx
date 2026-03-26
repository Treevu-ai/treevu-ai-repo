import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Treevu - Adelanto de Sueldo Responsable",
  description: "Accede a tu salario ganado cuando lo necesites. Sin intereses, sin deudas. Bienestar financiero para empleados.",
  keywords: ["adelanto de sueldo", "EWA", "bienestar financiero", "fintech", "nomina"],
}

export const viewport: Viewport = {
  themeColor: "#22956e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
