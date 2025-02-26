"use server"

import { getInboxId } from "@/services/chatwoot"
import { getClientDAOBySlug } from "@/services/client-services"
import { createWhatsappInstance, deleteWhatsappInstance, getWhatsappInstanceDAOByClientId, getWhatsappInstanceDAOByName, setChatwootData, setWhatsappInboxId, WhatsappInstanceFormValues } from "@/services/whatsappinstance-services"
import { connectInstance, connectionState, createInstanceBasic, deleteInstance, disableChatwoot, enableChatwoot, logoutInstance, restartInstance } from "@/services/wrc-sdk"
import { ChatwootParams } from "@/services/wrc-sdk-types"
import { revalidatePath } from "next/cache"

export async function createInstanceAction(instanceName: string) {
    const client= await getClientDAOBySlug(instanceName)
    if (!client) {
        throw new Error('Client not found')
    }
    const response = await createInstanceBasic(instanceName)
    const instanceData: WhatsappInstanceFormValues = {
        name: response.instance.instanceName,
        externalId: response.instance.instanceId,
        whatsappInboxId: undefined,
        chatwootUrl: undefined,
        chatwootAccountId: undefined,
        chatwootAccessToken: undefined,
        clientId: client.id,
    }
    const instance = await createWhatsappInstance(instanceData)
    revalidatePath('/[clientSlug]/whatsapp', "page")
    return instance
}

export async function getConnectionStatusAction(instanceName: string) {
    const status = await connectionState(instanceName)
    return status
}

export async function connectInstanceAction(instanceName: string) {
    const instance = await connectInstance(instanceName)
    revalidatePath('/[clientSlug]/whatsapp', "page")
    return instance
}

export async function logoutInstanceAction(instanceName: string) {
    const instance = await logoutInstance(instanceName)
    revalidatePath('/[clientSlug]/whatsapp', "page")
    return instance
}

export async function deleteInstanceAction(instanceName: string) {
    const instance = await deleteInstance(instanceName)
    if (instance) {
        const whatsappInstance= await getWhatsappInstanceDAOByName(instanceName)
        if (whatsappInstance) {
            await deleteWhatsappInstance(whatsappInstance.id)
        } else {
            throw new Error('Whatsapp instance with name ' + instanceName + ' not found')
        }
    }
    revalidatePath('/[clientSlug]/whatsapp', "page")
    return instance
}

export async function restartInstanceAction(instanceName: string) {
    const instance = await restartInstance(instanceName)
    revalidatePath('/[clientSlug]/whatsapp', "page")
    return instance
}

export async function enableChatwootAction(clientId: string, instanceName: string, chatwootAccountId: string) {
    const url= process.env.CHATWOOT_URL
    const token= process.env.CHATWOOT_ACCESS_TOKEN
    if (!url || !token) {
        throw new Error('CHATWOOT_URL or CHATWOOT_ACCESS_TOKEN is not set')
    }
    const whatsappInstance = await getWhatsappInstanceDAOByClientId(clientId)
    if (!whatsappInstance) {
        throw new Error('Whatsapp instance not found')
    }

    const params: ChatwootParams = {
        enabled: true,
        accountId: chatwootAccountId,
        token,
        url,
        signMsg: false,
        reopenConversation: false,
        conversationPending: true,        
        nameInbox: "whatsapp",
        importContacts: false,        
        importMessages: false,
        daysLimitImportMessages: 7,
        signDelimiter: '\n',
        autoCreate: true,
        organization: 'WRC',
        logo: '',
    }

    await enableChatwoot(instanceName, params)

    const whatsappInboxId = await getInboxId(Number(chatwootAccountId), "whatsapp")

    const chatwootUpdated= await setChatwootData(clientId, chatwootAccountId, token, url, String(whatsappInboxId))

    revalidatePath('/[clientSlug]/whatsapp', "page")

    return chatwootUpdated
}

export async function disableChatwootAction(instanceName: string) {
    const result = await disableChatwoot(instanceName)
    return result
}

export async function setWhatsappInboxIdAction(clientId: string, whatsappInboxId: string) {
    const client = await setWhatsappInboxId(clientId, whatsappInboxId)
    revalidatePath('/[clientSlug]/whatsapp', "page")
    return client
}