"use server"
  
import { revalidatePath } from "next/cache"
import { OTPSessionDAO, OTPSessionFormValues, createOTPSession, updateOTPSession, getOTPSessionDAO, deleteOTPSession } from "@/services/otpsession-services"


export async function getOTPSessionDAOAction(id: string): Promise<OTPSessionDAO | null> {
    return getOTPSessionDAO(id)
}

export async function createOrUpdateOTPSessionAction(id: string | null, data: OTPSessionFormValues): Promise<OTPSessionDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateOTPSession(id, data)
    } else {
        updated= await createOTPSession(data)
    }     

    revalidatePath("/admin/oTPSessions")

    return updated as OTPSessionDAO
}

export async function deleteOTPSessionAction(id: string): Promise<OTPSessionDAO | null> {    
    const deleted= await deleteOTPSession(id)

    revalidatePath("/admin/oTPSessions")

    return deleted as OTPSessionDAO
}

