import * as z from "zod"
import { prisma } from "@/lib/db"
import { getGroupDAO, GroupDAO, processMessage } from "./group-services"

export type MessageDAO = {
	id: string
	role: string
	content: string
	gptData: string | undefined
	tokens: number
	name: string | undefined
	toolInvocations: string | undefined
	createdAt: Date
	updatedAt: Date
	group: GroupDAO
	groupId: string
}

export const MessageSchema = z.object({
	role: z.enum(["user", "assistant", "system", "data"]),
	content: z.string().min(1, "content is required."),
	gptData: z.string().optional(),
	tokens: z.number({required_error: "tokens is required."}),
	name: z.string().optional(),
	toolInvocations: z.string().optional(),
	groupId: z.string().min(1, "groupId is required."),
})

export type MessageFormValues = z.infer<typeof MessageSchema>


export async function getMessagesDAO(groupId: string) {
  const found = await prisma.message.findMany({
    where: {
      groupId: groupId
    },
    orderBy: {
      createdAt: 'asc'
    },
  })
  return found as MessageDAO[]
}

export async function getMessageDAO(id: string) {
  const found = await prisma.message.findUnique({
    where: {
      id
    },
  })
  return found as MessageDAO
}


    
export async function createMessage(data: MessageFormValues) {
  // TODO: implement createMessage
  const created = await prisma.message.create({
    data
  })
  return created
}

export async function updateMessage(id: string, data: MessageFormValues) {
  const updated = await prisma.message.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteMessage(id: string) {
  const deleted = await prisma.message.delete({
    where: {
      id
    },
  })
  return deleted
}

export async function onGroupMessageReceived(content: string, groupId: string) {
  const group= await getGroupDAO(groupId)
  if (!group) {
      throw new Error("Group not found")
  }

  const messageValues: MessageFormValues= {
      content: content,
      role: "user",
      gptData: "",
      tokens: 0,
      groupId: groupId
  }
  const created= await createMessage(messageValues)

  return created
}