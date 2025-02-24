import { UserButton } from "@/components/layout/user-button"
import Link from "next/link"
import { Logo } from "./logo"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 mx-auto justify-between">
        <Link href="/" className="font-bold text-2xl">
          <Logo />
        </Link>
        <UserButton />
      </div>
    </header>
  )
} 