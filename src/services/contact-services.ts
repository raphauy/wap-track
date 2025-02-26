import { prisma } from "@/lib/db"
import { ApiError } from "@figuro/chatwoot-sdk"
import * as z from "zod"
import { createChatwootConversation, createContactInChatwoot, deleteContactInChatwoot } from "./chatwoot"
import { getChatwootAccountId, getWhatsappInstanceDAO } from "./whatsappinstance-services"
import { createConversation, getLastConversationByContactId, removeContactFromAllConversations } from "./conversation-service"

export type ContactDAO = {
	id: string
	chatwootId: string | undefined | null
	name: string
	phone: string | undefined | null
	imageUrl: string | null
	clientId: string
	createdAt: Date
	updatedAt: Date
}

export const contactSchema = z.object({
	chatwootId: z.string().optional(),
	name: z.string().min(1, "name is required."),
	phone: z.string().optional(),
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

  await removeContactFromAllConversations(contact.id, contact.clientId)

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

// esta función se encarga de buscar un contacto por el número de teléfono y el cliente
// si existe el contacto, debe buscar la última conversación del contacto en la base de datos y devolver el chatwootConversationId
// si no encuentra un contacto, lo crea tanto en Chatwoot como en la base de datos, además debe crear una conversación en Chatwoot y una conversación en la base de datos
export async function getLastChatwootConversationIdByPhoneNumber(phone: string, clientId: string) {
  const contact= await getContactByPhone(phone, clientId)
  if (!contact) {
    const whatsappInstance= await getWhatsappInstanceDAO(clientId)
    if (!whatsappInstance) throw new Error("Whatsapp instance not found")
    if (!whatsappInstance.whatsappInboxId) throw new Error("Whatsapp inbox not found")
    const name= "Actualizar"
    // create contact in chatwoot
    const chatwootContact= await createContactInChatwoot(Number(whatsappInstance.chatwootAccountId), Number(whatsappInstance.whatsappInboxId), phone, name)
    if (!chatwootContact.id) throw new Error("Error al crear el contacto en Chatwoot")

    // Verificar si ya existe un contacto con este chatwootId
    const existingContact = await prisma.contact.findFirst({
      where: {
        chatwootId: String(chatwootContact.id),
        clientId
      }
    })

    let dbContact
    if (existingContact) {
      // Si existe, actualizamos el teléfono si es necesario
      if (existingContact.phone !== phone) {
        dbContact = await prisma.contact.update({
          where: { id: existingContact.id },
          data: { phone }
        })
      } else {
        dbContact = existingContact
      }
    } else {
      // Si no existe, creamos uno nuevo
      const contactValues: ContactFormValues= {
        chatwootId: String(chatwootContact.id),
        name,
        phone,
        clientId
      }
      dbContact = await createContact(contactValues)
    }

    if (!dbContact) throw new Error("Error al gestionar el contacto en la base de datos")

    // create conversation in chatwoot
    const chatwootConversationId= await createChatwootConversation(Number(whatsappInstance.chatwootAccountId), whatsappInstance.whatsappInboxId, chatwootContact.id)
    if (!chatwootConversationId) throw new Error("Error al crear la conversación en Chatwoot")

    // create conversation in database
    const createdConversation= await createConversation(dbContact.phone, clientId, dbContact.id, chatwootConversationId)
    if (!createdConversation) throw new Error("Error al crear la conversación en la base de datos")

    return chatwootConversationId
  } else {
    // get the last conversation of the contact
    const lastConversation= await getLastConversationByContactId(contact.id, clientId)
    if (!lastConversation) throw new Error("Error al obtener la última conversación del contacto")

    return lastConversation.chatwootConversationId
  }
}


