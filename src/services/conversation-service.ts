import { prisma } from "@/lib/db";
import { createContact } from "./contact-services";
import { ContactFormValues } from "./contact-services";
import { getContactByChatwootId } from "./contact-services";
import { getUserByEmail } from "./login-services";

export async function createConversation(phone: string | null, clientId: string, contactId: string, chatwootConversationId: number) {
    const created= await prisma.conversation.create({
      data: {
        phone: phone || "",
        clientId,
        contactId,
        chatwootConversationId: chatwootConversationId
      }
    })
  
    return created
  }
  
export async function removeContactFromAllConversations(contactId: string, clientId: string) {
    await prisma.conversation.updateMany({
      where: {
        contactId,
        clientId
      },
      data: {
        contactId: null,
        chatwootConversationId: null
      }
    })
  }
  
  export async function getLastConversationByContactId(contactId: string, clientId: string) {
    const found= await prisma.conversation.findFirst({
      where: {
        contactId,
        clientId
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return found
  }
  
  // find an active conversation or create a new one to connect the messages
export async function messageArrived(phone: string, text: string, clientId: string, role: string, gptData: string, promptTokens?: number, completionTokens?: number, chatwootConversationId?: number, chatwootContactId?: number) {

    if (!clientId) throw new Error("clientId is required")
  
    let activeConversation= null
  
        //if (chatwootContactId) {
        //activeConversation= await getActiveConversationByChatwootContactId(chatwootContactId, clientId)
    if (chatwootConversationId) {
      activeConversation= await getActiveConversationByChatwootConversationId(Number(chatwootConversationId), clientId)
    } else {
      activeConversation= await getActiveConversation(phone, clientId)
    }
  
    if (activeConversation) {
      const message= await createMessage(activeConversation.id, role, text, gptData, promptTokens, completionTokens)
      return message    
    } else {
      // sleep 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("chatwootContactId on create conversation: ", chatwootContactId)
      let contact= await getContactByChatwootId(String(chatwootContactId), clientId)
  
      let chatwootId= String(chatwootContactId)
      if (!contact) {
        const isSimulator= phone && phone.includes("@")
        
        let name= phone
        if (isSimulator) {
          const user= await getUserByEmail(phone)
          if (user) {
            name= user.name || phone
          }
          chatwootId= phone
        }
  
        if (chatwootId) {
          const contactValues: ContactFormValues= {
            name,
            phone,
            clientId,
            chatwootId
          }
          console.log("creating contact from messageArrived")
          try {
            contact= await createContact(contactValues)
          } catch (error) {
            console.log("error creating contact from messageArrived, probably already exists")
            contact= await getContactByChatwootId(chatwootId, clientId)
          }
        }
      }
      const created= await prisma.conversation.create({
        data: {
          phone,
          clientId,
          chatwootConversationId,
          contactId: chatwootId ? contact?.id : undefined
        }
      })
      const message= await createMessage(created.id, role, text, gptData, promptTokens, completionTokens)
      return message   
    }
  }
  
  export async function getActiveConversationByChatwootConversationId(chatwootConversationId: number, clientId: string) {
    // 24 hours
    const sessionTimeInMinutes= 1440
      
    const found = await prisma.conversation.findFirst({
      where: {
        chatwootConversationId,
        clientId,        
        closed: false,
        messages: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - sessionTimeInMinutes * 60 * 1000)
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: true,
        contact: true
      }
    })
  
    return found;
  }
  
  export async function getActiveMessages(phone: string, clientId: string) {
  
    const activeConversation= await getActiveConversation(phone, clientId)
    if (!activeConversation) return null
  
    const messages= await prisma.message.findMany({
      where: {
        conversationId: activeConversation.id
      },
      orderBy: {
        createdAt: 'asc',
      }
    })
  
    return messages
  }

  // an active conversation is one that has a message in the last 10 minutes
export async function getActiveConversation(phone: string, clientId: string) {

    // 24 hours
    const sessionTimeInMinutes= 1440
      
    const found = await prisma.conversation.findFirst({
      where: {
        phone,
        clientId,        
        closed: false,
        messages: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - sessionTimeInMinutes * 60 * 1000)
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: true,
        contact: true
      }
    })
  
    return found;
}
  
function createMessage(conversationId: string, role: string, content: string, gptData?: string, promptTokens?: number, completionTokens?: number) {
    const created= prisma.message.create({
      data: {
        role,
        content,
        gptData,
        conversationId,      
        promptTokens,
        completionTokens,
      }
    })
  
    return created
}
  
export async function processMessage(id: string) {
    console.log("***** processMessage *****")
    
    const message= await prisma.message.findUnique({
      where: {
        id
      },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc',
              },
            },
            contact: true,
            client: true
          }
        }
      }
    })
    if (!message) throw new Error("Message not found")
  
    const conversation= message.conversation
    const client= conversation.client
  
    const input= message.content
  
    const contextResponse= "Contexto provisorio"
  
    const systemMessage= "Prompt provisorio"

    console.log("ToDo: processMessage")
    
}
  