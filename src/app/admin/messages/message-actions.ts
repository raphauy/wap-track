"use server"
  
import { revalidatePath } from "next/cache"
import { MessageDAO, MessageFormValues, createMessage, updateMessage, getMessageDAO, deleteMessage } from "@/services/message-services"


export async function getMessageDAOAction(id: string): Promise<MessageDAO | null> {
    return getMessageDAO(id)
}

export async function createOrUpdateMessageAction(id: string | null, data: MessageFormValues): Promise<MessageDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateMessage(id, data)
    } else {
        updated= await createMessage(data)
    }     

    revalidatePath("/admin/messages")

    return updated as MessageDAO
}

export async function deleteMessageAction(id: string): Promise<MessageDAO | null> {    
    const deleted= await deleteMessage(id)

    revalidatePath("/admin/messages")

    return deleted as MessageDAO
}

