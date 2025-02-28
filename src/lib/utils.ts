import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { auth } from "./auth"
import { format, isThisWeek } from "date-fns"
import { isYesterday } from "date-fns"
import { isToday } from "date-fns"
import { parseISO } from "date-fns"
import { es } from "date-fns/locale";
import { toZonedTime, format as formatTZ } from "date-fns-tz";

export type MenuGroup = {
  name: string
  items: MenuItem[]
}

export type MenuItem = {
  name: string
  icon?: React.ReactNode
  href: string
  subItems?: {
    label: string
    icon?: React.ReactNode
    href: string
  }[]
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getCurrentUser() {
  const session = await auth()

  return session?.user
}

export function formatWhatsAppStyle(date: Date | string): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Fecha inválida');
    }

    const timezone = "America/Montevideo";
    const uyTime = toZonedTime(parsedDate, timezone);

    if (isToday(uyTime)) {
      return format(uyTime, 'HH:mm');
    } else if (isYesterday(uyTime)) {
      return 'Ayer';
    } else if (isThisWeek(uyTime)) {
      return format(uyTime, 'eeee', { locale: es });
    } else {
      return format(uyTime, 'dd/MM/yyyy');
    }
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
}

// Función para generar el slug a partir de un texto
export function generateSlug(text: string) {
  return text?.toLowerCase()
    .normalize('NFD')               // Normaliza caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos (acentos, etc)
    .replace(/\s+/g, '-')           // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, '')       // Remueve caracteres especiales
    .replace(/\-\-+/g, '-')         // Reemplaza múltiples guiones con uno solo
    .replace(/^-+/, '')             // Remueve guiones del inicio
    .replace(/-+$/, '')             // Remueve guiones del final
    || ''
}


export function getStatusLabel(status: string) {
  if (status === 'open') {
    return "Conectado"
  } else if (status === 'close') {
    return "Desconectado"
  } else if (status === 'connecting') {
    return "Conectando"
  } else {
    return "Desconocido"
  }
}

export function getRoleColor(role: string) {
  if (role === "assistant") return "bg-green-500"
  if (role === "system") return "bg-orange-500"
  if (role === "data") return "bg-blue-500"
  return "bg-black"
}

export function getFormatInTimezone(date: Date, timeZone: string) {
  
  // Convert the date to the desired time zone
  const zonedDate = toZonedTime(date, timeZone);
  
  const today = toZonedTime(new Date(), timeZone);

  if (
    zonedDate.getDate() === today.getDate() &&
    zonedDate.getMonth() === today.getMonth() &&
    zonedDate.getFullYear() === today.getFullYear()
  ) {
    return formatTZ(zonedDate, "HH:mm", { timeZone, locale: es });
  } else {
    return formatTZ(zonedDate, "yyyy/MM/dd", { timeZone, locale: es });
  }
}
