import "@/app/globals.css"
import { SidebarComponent } from "@/components/layout/sidebar-component"
import { SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getClientMenu } from "./client-menu"

type Props = {
  children: React.ReactNode
  params: Promise<{
    clientSlug: string
  }>
}
export default async function ClientLayout({ children, params }: Props) {

  const { clientSlug } = await params
  console.log("clientSlug", clientSlug)

  const session= await auth()

  if (!session) {
    return redirect("/login")
  }

  console.log("session.expires", session.expires)
  if (new Date(session.expires) < new Date()) {
    return redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    return redirect("/")
  }

  const clientMenu =  getClientMenu(clientSlug)

  return (
    <div className="w-full h-full">
      <SidebarProvider className="h-full flex">
        <div className="flex h-full w-full">
          <div className="w-[16rem]">
            <SidebarComponent initialMenu={clientMenu} />
          </div>
          
          <main className="p-2 w-full flex-1 overflow-auto mt-10 md:mt-0">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
