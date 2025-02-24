"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "./theme-provider"
import { TailwindIndicator } from "./tailwind-indicator"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>        
        {children}
        <Toaster />
        <TailwindIndicator />
      </SessionProvider>
    </ThemeProvider>
  )
} 
