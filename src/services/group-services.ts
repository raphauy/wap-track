import * as z from "zod"
import { prisma } from "@/lib/db"
import { MessageDAO } from "./message-services"
import { openai } from "@ai-sdk/openai"
import { convertToCoreMessages, generateText } from "ai"
import { ContactDAO, getContactsDAO, getContactsOfGroup } from "./contact-services"
import { groupTools } from "./tools"
import { sendTextToConversation } from "./chatwoot"
import { saveLLMResponse } from "./function-call-services"
import { saveToolCallResponse } from "./function-call-services"
import { getChatwootAccountId } from "./whatsappinstance-services"

type ClientWithSlug = {
  slug: string
}

export type GroupDAO = {
	id: string
	chatwootConversationId: number
	appId: string | undefined
	name: string
	createdAt: Date
	updatedAt: Date
	clientId: string
  client: ClientWithSlug
  contacts: ContactDAO[]
}

export type GroupDAOWithMessages = GroupDAO & {
  messages: MessageDAO[]
}

export const GroupSchema = z.object({
	chatwootConversationId: z.number({required_error: "chatwootConversationId is required."}),
	appId: z.string().optional(),
	clientId: z.string().min(1, "clientId is required."),
	name: z.string().min(1, "name is required."),
})

export type GroupFormValues = z.infer<typeof GroupSchema>


export async function getGroupsDAO(clientId: string) {
  const found = await prisma.group.findMany({
    where: {
      clientId
    },
    orderBy: {
      updatedAt: "desc"
    },
    include: {
      client: {
        select: {
          slug: true
        }
      }
    }
  })
  return found as GroupDAO[]
}

export async function getAllGroupsDAO() {
  const found = await prisma.group.findMany({
    orderBy: {
      updatedAt: "desc"
    },
    include: {
      client: {
        select: {
          slug: true
        }
      }
    }
  })
  return found as GroupDAO[]
}

export async function getGroupDAO(id: string) {
  const found = await prisma.group.findUnique({
    where: {
      id
    },
    include: {
      client: {
        select: {
          slug: true
        }
      }
    }
  })
  return found as GroupDAO
}

export async function getGroupContactsDAO(id: string): Promise<ContactDAO[]> {
  const found = await prisma.groupContact.findMany({
    where: { groupId: id },
    include: {
      contact: true
    }
  })
  return found.map(groupContact => groupContact.contact) as ContactDAO[]
}

export async function getGroupDAOWithMessages(id: string) {
  const found = await prisma.group.findUnique({
    where: { id },
    include: { 
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })
  return found as GroupDAOWithMessages
}
    
export async function createGroup(data: GroupFormValues) {
  // TODO: implement createGroup
  const created = await prisma.group.create({
    data
  })
  return created
}

export async function updateGroup(id: string, data: GroupFormValues) {
  const updated = await prisma.group.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function addContactToGroup(groupId: string, contactId: string) {
  const created = await prisma.groupContact.create({
    data: {
      groupId,
      contactId
    }
  })
  return created
}

export async function deleteGroup(id: string) {
  const deleted = await prisma.group.delete({
    where: {
      id
    },
  })
  return deleted
}

export async function getGroupByChatwootConversationId(clientId: string, chatwootConversationId: number) {
  const found = await prisma.group.findUnique({
    where: {
      clientId_chatwootConversationId: {
        clientId,
        chatwootConversationId
      }
    },
  })
  return found as GroupDAO
}


export async function getLastGroupDAO(clientSlug: string) {
  const found = await prisma.group.findFirst({
    where: {
      client: { slug: clientSlug }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
  return found as GroupDAO
}

export async function processMessage(id: string) {
  const message= await prisma.message.findUnique({
    where: {
      id
    },
    include: {
      group: {
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          client: true,
          app: true
        }
      }
    }
  })
  if (!message) throw new Error("Message not found")

  const group= message.group

  const client= group.client

  if (!group.app?.prompt) throw new Error("App or App prompt not found")

  const groupContext= await getGroupContext(group.id)
  const context= group.app.prompt + "\n" + groupContext
  console.log("context: " + context)
  //await updateContext(conversation.id, context)

  const dbMessages= group.messages
  const messages= dbMessages.map(message => ({
    role: message.role as "user" | "assistant" | "system" | "data",
    content: message.content
  }))

  console.log("messages.count: " + messages.length)
  console.log(messages)
  
  const result= await generateText({
//    model: openai('gpt-4o-mini'),
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(messages),
    tools: groupTools,
    system: context,
    onStepFinish: async (event) => {
      console.log("onStepFinish");
      await saveToolCallResponse(event, group.id);
    },
    maxSteps: 5
  })

  const usage= result.usage
  const text= result.text

  await saveLLMResponse(text, result.finishReason, usage, group.id)

  const chatwootAccountId= await getChatwootAccountId(client.id)
  if (!chatwootAccountId) throw new Error("Chatwoot accountId not found")
  if (!group.chatwootConversationId) throw new Error("Chatwoot conversationId not found")
  if (text.trim() !== "<SILENCIO>") {
    await sendTextToConversation(chatwootAccountId, group.chatwootConversationId, text)
  } else {
    console.log("Silencio mantenido, no se envía mensaje al grupo.")
  }

}

async function getGroupContext(groupId: string) {

  const group= await getGroupDAO(groupId)
  if (!group) throw new Error("Group not found")

  let groupContext= "Información de este grupo:\n"
  groupContext+= `- id: ${group.id}, name: ${group.name}\n\n`

  const contacts= await getContactsOfGroup(groupId)
  if (!contacts || contacts.length === 0) {
    groupContext+= "No hay contactos registrados en el grupo"
  } else {
    groupContext+= "Los contactos registrados en el grupo son:\n"
    contacts.forEach(contact => {
      groupContext+= `- id: ${contact.id}, name: ${contact.name}, phone: ${contact.phone}\n`
    })
  }

  return groupContext
}

