import { getClientDAO, getClientIdByChatwootAccountId } from "@/services/client-services";
import { getContactByPhone } from "@/services/contact-services";
import { createGroup, getGroupByChatwootConversationId, GroupFormValues } from "@/services/group-services";
import { onGroupMessageReceived } from "@/services/message-services";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 299

export async function POST(request: Request) {

    try {
        const json= await request.json()
        if (!json.account || !json.conversation) {
            console.log("error: ", "account or conversation is missing")
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }
        const accountId= json.account.id
        const conversationId= json.conversation.id
        const contentType= json.content_type
        const messageType= json.message_type
        const inboxName= json.inbox.name
        const conversationStatus= json.conversation.status
        const senderId= json.sender.id
        console.log("accountId: ", accountId)
        console.log("conversationId: ", conversationId)
        console.log("contentType: ", contentType)
        console.log("messageType: ", messageType)
        console.log("inboxName: ", inboxName)
        console.log("conversationStatus: ", conversationStatus)
        console.log("senderId: ", senderId)

        if (conversationStatus !== "pending") {
            console.log("skipping message because conversationStatus is not pending: ", conversationStatus)
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }


        if (!accountId || !conversationId || !contentType) {
            console.log("error: ", "accountId, conversationId or contentType is missing")
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }

        if (messageType !== "incoming") {
            console.log("messageType is not incoming: ", messageType)
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }

        const senderName= json.sender.name
        const senderPhone= json.sender.phone_number
        if (senderName === "EvolutionAPI" || senderPhone === "+123456") {
            console.log("connection API message, not processed")
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }

        // if ((accountId === 16 || accountId === 1 || accountId === 23) && (senderPhone !== "+59892265737")) {
        //     console.log("phone is not allowed for this account")
        //     return NextResponse.json({ data: "ACK" }, { status: 200 })
        // }

        const clientId= await getClientIdByChatwootAccountId(accountId)
        if (!clientId) {
            console.log("error: ", "clientId not found")
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }

        const client= await getClientDAO(clientId)
        if (!client) {
            console.log("error: ", "client not found")
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }

        const group= await getGroupByChatwootConversationId(clientId, conversationId)
        if (group) {
            console.log("group found: ", group.name)
        } else {
            console.log("group not found, creating a new group")
            // create a new group if name ends with "(GROUP)"
            if (senderName.endsWith("(GROUP)")) {
                const groupValues: GroupFormValues= {
                    clientId,
                    chatwootConversationId: conversationId,
                    name: senderName
                }
                const newGroup= await createGroup(groupValues)
                console.log("new group created: ", newGroup)
            } else {
                console.log(`Conversation name (${senderName}) is not a group, not creating a new group`)
            }
        }

        if (!group) {
            console.log("message is not a group message")
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }

        // if the group do not have appId, skip the message
        if (!group.appId) {
            console.log("group do not have appId, skipping the message")
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }

        console.log("general api json: ", json)

        let content= json.content
        console.log("content: ", content)

        if (contentType !== "text" || !content) {
            const audioUrl= json.attachments[0].data_url
            console.log("audioUrl:", audioUrl)
            if (audioUrl) {
                const transcription= await transcribeAudio(audioUrl)
                console.log("transcription:", transcription)
                content= transcription
            } else {
    
                console.log("error: ", "contentType is not text or content is empty")            
                const contact= await getContactByPhone(senderPhone, clientId)
                if (contact) {
                    console.log("ToDo: send message to contact: Por el momento no podemos procesar mensajes que no sean de texto.")
                    //await sendTextToConversation(parseInt(accountId), conversationId, "Por el momento no podemos procesar mensajes que no sean de texto.")
                } else {
                    console.log("contact not found or bot is not enabled")
                }
                return NextResponse.json({ data: "ACK" }, { status: 200 })
            }
        }

        // let phone= json.sender.phone_number
        // if (!phone) {
        //     phone= json.sender.name
        // }

        await onGroupMessageReceived(content, group.id)
    
        return NextResponse.json({ data: "ACK" }, { status: 200 })
    
    } catch (error) {
        console.log("error: ", error)
        return NextResponse.json({ error: "error: " + error}, { status: 502 })                
    }

}

function processConnectionUpdate(json: any) {
    console.log("processing connection update")
    console.log("json: ", json)
}

async function transcribeAudio(audioUrl: string): Promise<string> {
    console.log("transcribing audio")
    console.log("audioUrl: ", audioUrl)
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY_FOR_EMBEDDINGS,
    })
    
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const file = new File([arrayBuffer], 'audio.oga', { type: 'audio/ogg' });

    const transcription = await client.audio.transcriptions.create({
        model: "whisper-1",
        file: file,
        language: "es"
    })
    return transcription.text
}

