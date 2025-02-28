import { MenuGroup } from "@/lib/utils"
import { BriefcaseBusiness, Code, LayoutDashboard, MessageCircleCode, Settings, User, Users } from "lucide-react"

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
        name: "Clientes",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
        href: "/admin/clients",
      },
      {
        name: "Apps",
        icon: <Code className="h-4 w-4" />,
        href: "/admin/apps",
      },
      {
        name: "Grupos",
        icon: <Users className="h-4 w-4" />,
        href: "/admin/groups",
      },
      {
        name: "Instancias WRC",
        icon: <MessageCircleCode className="h-4 w-4" />,
        href: "/admin/whatsapp-instances",
      },
      {
        name: "Usuarios",
        icon: <User className="h-4 w-4" />,
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

