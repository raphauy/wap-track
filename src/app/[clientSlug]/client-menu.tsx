import { MenuGroup } from "@/lib/utils"
import { LayoutDashboard, MessageCircleCode, QrCode, Users } from "lucide-react"

export function getClientMenu(clientSlug: string): MenuGroup[] {
  return [
    {
      name: "Dashboard",
      items: [
        {
          name: "Dashboard",
          icon: <LayoutDashboard className="h-4 w-4" />,
          href: `/${clientSlug}`,
        },
      ],
    },
    {
      name: "Configuración",
      items: [
        {
          name: "Grupos",
          icon: <Users className="h-4 w-4" />,
          href: `/${clientSlug}/groups`,
        },
      ],
    },
    {
      name: "Whatsapp",
      items: [
        {
          name: "Conectar con QR",
          icon: <QrCode className="h-4 w-4" />,
          href: `/${clientSlug}/whatsapp`,
        },
      ],
    },
  ]
}

