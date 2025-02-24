import "@/app/globals.css"
import { Header } from "@/components/layout/header"
import { Providers } from "@/components/layout/providers/providers"
import { SidebarComponent } from "@/components/layout/sidebar-component"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Geist } from "next/font/google"

const geist = Geist({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className={`${geist.className} h-full`}>
        <Providers>
          <div className="min-h-screen h-full flex flex-col">
            <Header />
            <main className="p-2 w-full h-[calc(100svh-65px)] overflow-hidden">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
