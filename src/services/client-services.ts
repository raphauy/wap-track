import * as z from "zod"
import { prisma } from "@/lib/db"
import { WhatsappInstanceDAO } from "./whatsappinstance-services"

export type ClientDAO = {
	id: string
	name: string
	slug: string
	createdAt: Date
	updatedAt: Date
}

export const ClientSchema = z.object({
	name: z.string().min(1, "name is required."),
	slug: z.string().min(1, "slug is required."),
})

export type ClientFormValues = z.infer<typeof ClientSchema>


export async function getClientsDAO() {
  const found = await prisma.client.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as ClientDAO[]
}

export async function getClientDAO(id: string) {
  const found = await prisma.client.findUnique({
    where: {
      id
    },
  })
  return found as ClientDAO
}

export async function getClientDAOBySlug(slug: string) {
  const found = await prisma.client.findUnique({
    where: {
      slug
    },
  })
  return found as ClientDAO
}

    
export async function createClient(data: ClientFormValues) {
  // TODO: implement createClient
  const created = await prisma.client.create({
    data
  })
  return created
}

export async function updateClient(id: string, data: ClientFormValues) {
  const updated = await prisma.client.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteClient(id: string) {
  const deleted = await prisma.client.delete({
    where: {
      id
    },
  })
  return deleted
}

export async function getClientIdByChatwootAccountId(chatwootAccountId: string) {
  const client= await prisma.whatsappInstance.findFirst({
    where: {
      chatwootAccountId
    },
    select: {
      clientId: true
    }
  })

  if (!client) return null

  return client.clientId
}