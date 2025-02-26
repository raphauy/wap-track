import * as z from "zod"
import { prisma } from "@/lib/db"
import { ClientDAO } from "./client-services"

export type WhatsappInstanceDAO = {
	id: string
	externalId: string
	name: string
	chatwootAccountId: string | undefined
	chatwootUrl: string | undefined
	chatwootAccessToken: string | undefined
	whatsappInboxId: string | undefined
	createdAt: Date
	updatedAt: Date
	client: ClientDAO
	clientId: string
}

export const WhatsappInstanceSchema = z.object({
	externalId: z.string().min(1, "externalId is required."),
	name: z.string().min(1, "name is required."),
	chatwootAccountId: z.string().optional(),
	chatwootUrl: z.string().optional(),
	chatwootAccessToken: z.string().optional(),
	whatsappInboxId: z.string().optional(),
	clientId: z.string().min(1, "clientId is required."),
})

export type WhatsappInstanceFormValues = z.infer<typeof WhatsappInstanceSchema>


export async function getWhatsappInstancesDAO() {
  const found = await prisma.whatsappInstance.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as WhatsappInstanceDAO[]
}

export async function getWhatsappInstanceDAO(id: string) {
  const found = await prisma.whatsappInstance.findUnique({
    where: {
      id
    },
  })
  return found as WhatsappInstanceDAO
}


    
export async function createWhatsappInstance(data: WhatsappInstanceFormValues) {
  // TODO: implement createWhatsappInstance
  const created = await prisma.whatsappInstance.create({
    data
  })
  return created
}

export async function updateWhatsappInstance(id: string, data: WhatsappInstanceFormValues) {
  const updated = await prisma.whatsappInstance.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteWhatsappInstance(id: string) {
  const deleted = await prisma.whatsappInstance.delete({
    where: {
      id
    },
  })
  return deleted
}

export async function getWhatsappInstanceDAOByClientId(clientId: string) {
  const found = await prisma.whatsappInstance.findUnique({
    where: {
      clientId
    },
  })
  return found as WhatsappInstanceDAO
}

export async function getWhatsappInstanceDAOByName(name: string) {
  const found = await prisma.whatsappInstance.findFirst({
    where: {
      name
    },
  })
  return found as WhatsappInstanceDAO
}

export async function getChatwootAccountId(clientId: string) {
  const client = await prisma.whatsappInstance.findFirst({
    where: {
      clientId
    },
    select: {
      chatwootAccountId: true
    }
  })

  if (!client) return null

  return client.chatwootAccountId
} 

export async function setChatwootData(clientId: string, chatwootAccountId: string, chatwootAccessToken: string, chatwootUrl: string, whatsappInboxId: string) {
  const whatsappInstance = await prisma.whatsappInstance.findFirst({
    where: {
      clientId
    }
  })

  if (!whatsappInstance) {
    throw new Error('Whatsapp instance not found')
  }

  const updatedInstance = await prisma.whatsappInstance.update({
    where: {
      id: whatsappInstance.id
    },
    data: {
      chatwootAccountId,
      chatwootAccessToken,
      chatwootUrl,
      whatsappInboxId
    }
  })

  return updatedInstance
}

export async function setWhatsappInboxId(clientId: string, whatsappInboxId: string) {
  const whatsappInstance = await prisma.whatsappInstance.findFirst({
    where: {
      clientId
    }
  })
  if (!whatsappInstance) {
    throw new Error('Whatsapp instance not found')
  }
  const updatedInstance = await prisma.whatsappInstance.update({
    where: {
      id: whatsappInstance.id
    },
    data: {
      whatsappInboxId
    }
  })
  return updatedInstance
}

