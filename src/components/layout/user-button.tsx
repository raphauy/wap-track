"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn, MenuItem } from "@/lib/utils"
import { Role } from "@prisma/client"
import { Home, LayoutDashboard, Monitor, Moon, Settings, Sun } from "lucide-react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Button } from "../ui/button"
import { LogoutButtonForDropdown } from "./logout-button"

export function UserButton() {
  const { data: session } = useSession()
  const { setTheme, theme } = useTheme()

  if (!session?.user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer border">
          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} className="object-cover"/>
          <AvatarFallback>
            {session.user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] rounded-xl">
        <DropdownMenuItem className="font-medium p-3 hover:bg-transparent focus:bg-transparent">
          <div className="flex flex-col space-y-1">
            <p className="font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center justify-between w-full cursor-pointer">
            <span>Inicio</span>
            <Home className="h-4 w-4" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center justify-between w-full cursor-pointer">
            <span>Perfil de usuario</span>
            <Settings className="h-4 w-4" />
          </Link>
        </DropdownMenuItem>
        {getCustomMenuItems(session.user.role).map((item) => (
          <DropdownMenuItem asChild key={item.name}>
            <Link href={item.href} className="flex items-center justify-between w-full cursor-pointer">
              <span>{item.name}</span>
              {item.icon}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {getThemeItem(theme || "system", setTheme)}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer">
          <LogoutButtonForDropdown redirectTo="/" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 


function getThemeItem(theme: string, setTheme: (theme: string) => void) {
  return (
    <DropdownMenuItem 
    className="hover:bg-transparent focus:bg-transparent"
    onSelect={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between w-full">
        <span className="font-medium">Tema</span>
        <div className="p-1 bg-muted rounded-full flex">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8 relative rounded-full", theme === "light" && "border")}
            onClick={() => setTheme('light')}
          >
            <Sun className="h-4 w-4" />
            {theme === "light" && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-sky-500 rounded-full" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8 relative rounded-full", theme === "dark" && "border border-muted-foreground")}
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-4 w-4" />
            {theme === "dark" && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-sky-500 rounded-full" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8 relative rounded-full", theme === "system" && "border")}
            onClick={() => setTheme('system')}
          >
            <Monitor className="h-4 w-4" />
            {theme === "system" && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-sky-500 rounded-full" />
            )}
          </Button>
        </div>
      </div>
    </DropdownMenuItem>
  )
}

function getCustomMenuItems(role: Role): MenuItem[] {
  if (role === "ADMIN") {
    return [
      {
        name: "Admin",
        href: "/admin",
        icon: <LayoutDashboard className="h-4 w-4" />
      }
    ]
  }
  return []
}