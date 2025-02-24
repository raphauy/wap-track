"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

type Props = {
  label?: string
  redirectTo: string
}

export function LogoutButtonForDropdown({ redirectTo, label = "Cerrar sesión" }: Props) {
  return (
    <Button
        onClick={() => signOut({ redirectTo })}
        variant="ghost"
        className="w-full px-0"
    >
        <div className="flex items-center justify-between w-full">
            <span>{label}</span>
            <LogOut className="h-4 w-4" />
          </div>
    </Button>
  )
}

export function LogoutButtonForButton({ redirectTo, label = "Cerrar sesión" }: Props) {
  return (
    <Button 
        onClick={() => signOut({ redirectTo })}
        className="w-full gap-2"
        variant="secondary"
    >
        {label}
        <LogOut className="h-4 w-4" />
    </Button>
  )
}