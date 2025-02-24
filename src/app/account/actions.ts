"use server"

import { getUserDAO, updateUser } from "@/services/user-services"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateUserName(name: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const user = await getUserDAO(session.user.id)
  if (!user) {
    throw new Error("Usuario no encontrado")
  }

  const updated= await updateUser(user.id, {
    ...user,
    name,
  })

  if (!updated) {
    throw new Error("No se pudo actualizar el nombre del usuario")
  }

  revalidatePath("/account")

  return true
}

export async function updateUserAvatar(avatarUrl: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const user = await getUserDAO(session.user.id)
  if (!user) {
    throw new Error("Usuario no encontrado")
  }

  const updated = await updateUser(user.id, {
    ...user,
    image:  avatarUrl,
  })

  if (!updated) {
    throw new Error("No se pudo actualizar el avatar del usuario")
  }

  revalidatePath("/account")

  return true
}