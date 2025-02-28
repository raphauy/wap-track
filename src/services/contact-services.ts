import { prisma } from "@/lib/db"
import { ApiError } from "@figuro/chatwoot-sdk"
import * as z from "zod"
import { createChatwootConversation, createContactInChatwoot, deleteContactInChatwoot } from "./chatwoot"
import { getChatwootAccountId, getWhatsappInstanceDAO } from "./whatsappinstance-services"
import { GroupDAO } from "./group-services"

export type ContactDAO = {
	id: string
	chatwootId: string | undefined | null
	name: string
	phone: string
	imageUrl: string | null
	clientId: string
	createdAt: Date
	updatedAt: Date
}

export const contactSchema = z.object({
	chatwootId: z.string().optional(),
	name: z.string().min(1, "name is required."),
	phone: z.string().min(1, "phone is required."),
	imageUrl: z.string().optional(),
	clientId: z.string().min(1, "clientId is required."),
})

export type ContactFormValues = z.infer<typeof contactSchema>

export async function getContactsDAO(clientId: string) {
  const found = await prisma.contact.findMany({
    where: {
      clientId
    },
    orderBy: {
      id: 'asc'
    },
  })
  return found as ContactDAO[]
}

export async function getContactDAO(id: string) {
  const found = await prisma.contact.findUnique({
    where: {
      id
    },
  })
  return found as ContactDAO
}

export async function getContactDAOByPhone(phone: string) {
  const found = await prisma.contact.findUnique({
    where: {
      phone
    },
  })
  return found as ContactDAO
}
    
export async function createContact(data: ContactFormValues) {

  // check if contact already exists
  const existingContact= await getContactByChatwootId(data.chatwootId || "", data.clientId)
  if (existingContact) {
    const updated= await updateContact(existingContact.id, data)
    return updated
  }

  console.log("createContact: ", data)

  const created = await prisma.contact.create({
    data,
  })

  return created
}

export async function updateContact(id: string, data: ContactFormValues) {
  const updated = await prisma.contact.update({
    where: {
      id
    },
    data,
  })
  if (!updated) throw new Error("Error al actualizar el contacto")
  
  return updated
}

export async function deleteContact(id: string) {
  const contact = await getContactDAO(id)
  if (!contact) throw new Error("Contact not found")

  // check if contact is in any group
  const groups= await getContactGroupsDAO(id)
  if (groups.length > 0) {
    throw new Error("Contact is in a group, cannot delete")
  }

  const chatwootAccountId = await getChatwootAccountId(contact.clientId)
  if (!chatwootAccountId) throw new Error("Chatwoot account not found")

  const chatwootContactId= contact.chatwootId
  if (chatwootContactId && !isNaN(Number(chatwootContactId))) {
    console.log("deleting contact in chatwoot: ", chatwootContactId)
    // catch  Internal error: ApiError: Contact not found
    try {
      await deleteContactInChatwoot(Number(chatwootAccountId), Number(chatwootContactId))
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.log("Contact not found in chatwoot, skipping deletion")
      } else {
        console.error("Error deleting contact in chatwoot: ", error)
        throw error
      }
    }
  }

  const deleted = await prisma.contact.delete({
    where: {
      id
    },
  })
  return deleted
}
    

export async function getFullContactsDAO() {
  const found = await prisma.contact.findMany({
    orderBy: {
      id: 'asc'
    },
    include: {
			client: true,
		}
  })
  return found as ContactDAO[]
}
  
export async function getFullContactDAO(id: string) {
  const found = await prisma.contact.findUnique({
    where: {
      id
    },
    include: {
			client: true,
		}
  })
  return found as ContactDAO
}
    
export async function getContactByChatwootId(chatwootId: string, clientId: string) {
  const found = await prisma.contact.findFirst({
    where: {
      chatwootId,
      clientId
    }
  })
  return found
}

export async function getContactByPhone(phone: string, clientId: string) {
  const found = await prisma.contact.findFirst({
    where: {
      phone,
      clientId
    },
  })
  return found
}

export async function getFilteredContacts(clientId: string, from: Date | null, to: Date | null): Promise<ContactDAO[]> {
  const found = await prisma.contact.findMany({
    where: {
      clientId,
      name: {
        not: 'WRC'
      },
      updatedAt: {
        gte: from || undefined,
        lte: to || undefined
      },
    },
    orderBy: {
      id: "desc"
    }
  })
  return found
}

export async function getContactGroupsDAO(contactId: string): Promise<GroupDAO[]> {
  const found = await prisma.groupContact.findMany({
    where: {
      contactId
    },
    include: {
      group: true
    }
  })
  return found.map(groupContact => groupContact.group) as GroupDAO[]
}

export async function getContactsOfGroup(groupId: string): Promise<ContactDAO[]> {
  const found = await prisma.groupContact.findMany({
    where: {
      groupId
    },
    include: {
      contact: true
    }
  })
  return found.map(groupContact => groupContact.contact) as ContactDAO[]
}