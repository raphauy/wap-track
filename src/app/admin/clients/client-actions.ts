"use server"
  
import { revalidatePath } from "next/cache"
import { ClientDAO, ClientFormValues, createClient, updateClient, getClientDAO, deleteClient } from "@/services/client-services"


export async function getClientDAOAction(id: string): Promise<ClientDAO | null> {
    return getClientDAO(id)
}

export async function createOrUpdateClientAction(id: string | null, data: ClientFormValues): Promise<ClientDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateClient(id, data)
    } else {
        updated= await createClient(data)
    }     

    revalidatePath("/admin/clients")

    return updated as ClientDAO
}

export async function deleteClientAction(id: string): Promise<ClientDAO | null> {    
    const deleted= await deleteClient(id)

    revalidatePath("/admin/clients")

    return deleted as ClientDAO
}

