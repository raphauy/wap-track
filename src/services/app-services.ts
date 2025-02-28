import * as z from "zod"
import { prisma } from "@/lib/db"

export type AppDAO = {
	id: string
	name: string
	prompt: string | undefined
	createdAt: Date
	updatedAt: Date
}

export const AppSchema = z.object({
	name: z.string().min(1, "name is required."),
	prompt: z.string().optional(),
})

export type AppFormValues = z.infer<typeof AppSchema>


export async function getAppsDAO() {
  const found = await prisma.app.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as AppDAO[]
}

export async function getAppDAO(id: string) {
  const found = await prisma.app.findUnique({
    where: {
      id
    },
  })
  return found as AppDAO
}


    
export async function createApp(data: AppFormValues) {
  // TODO: implement createApp
  const created = await prisma.app.create({
    data
  })
  return created
}

export async function updateApp(id: string, data: AppFormValues) {
  const updated = await prisma.app.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteApp(id: string) {
  const deleted = await prisma.app.delete({
    where: {
      id
    },
  })
  return deleted
}

export async function setPrompt(prompt: string, appId: string) {
  const updated = await prisma.app.update({
    where: {
      id: appId
    },
    data: {
      prompt
    }
  })
  return updated
}
