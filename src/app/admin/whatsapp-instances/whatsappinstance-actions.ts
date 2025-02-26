"use server"
  
import { revalidatePath } from "next/cache"
import { WhatsappInstanceDAO, WhatsappInstanceFormValues, createWhatsappInstance, updateWhatsappInstance, getWhatsappInstanceDAO, deleteWhatsappInstance } from "@/services/whatsappinstance-services"


export async function getWhatsappInstanceDAOAction(id: string): Promise<WhatsappInstanceDAO | null> {
    return getWhatsappInstanceDAO(id)
}

export async function createOrUpdateWhatsappInstanceAction(id: string | null, data: WhatsappInstanceFormValues): Promise<WhatsappInstanceDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateWhatsappInstance(id, data)
    } else {
        updated= await createWhatsappInstance(data)
    }     

    revalidatePath("/admin/whatsappInstances")

    return updated as WhatsappInstanceDAO
}

export async function deleteWhatsappInstanceAction(id: string): Promise<WhatsappInstanceDAO | null> {    
    const deleted= await deleteWhatsappInstance(id)

    revalidatePath("/admin/whatsappInstances")

    return deleted as WhatsappInstanceDAO
}

