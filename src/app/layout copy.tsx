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
            <div className="h-[calc(100vh-65px)] overflow-hidden w-full">
              <SidebarProvider className="h-full flex">
                <div className="flex h-full w-full">
                  <SidebarComponent />
                  <main className="p-2 w-full flex-1 overflow-auto mt-10 md:mt-0">
                    {children}
                  </main>
                </div>
              </SidebarProvider>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
