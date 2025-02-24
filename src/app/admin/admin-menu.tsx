import { MenuGroup } from "@/lib/utils"
import { Users, Settings, LayoutDashboard, FileText, Building2 } from "lucide-react"

export const adminMenu: MenuGroup[] = [
  {
    name: "Administración",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        href: "/admin",
      },
      {
        name: "Usuarios",
        icon: <Users className="h-4 w-4" />,
        href: "/admin/users",
        subItems:[
          {
            label: "Sesiones",
            href: "/admin/otpsessions"
          }
        ]
      },
    ],
  },
  {
    name: "Configuración",
    items: [
      {
        name: "Configuración",
        icon: <Settings className="h-4 w-4" />,
        href: "/admin/settings",
      },
    ],
  },
]

