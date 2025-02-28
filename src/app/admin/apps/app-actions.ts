"use server"
  
import { revalidatePath } from "next/cache"
import { AppDAO, AppFormValues, createApp, updateApp, getAppDAO, deleteApp, setPrompt } from "@/services/app-services"
import { createPromptVersion } from "@/services/prompt-version-services"
import { PromptVersionFormValues } from "@/services/prompt-version-services"


export async function getAppDAOAction(id: string): Promise<AppDAO | null> {
    return getAppDAO(id)
}

export async function createOrUpdateAppAction(id: string | null, data: AppFormValues): Promise<AppDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateApp(id, data)
    } else {
        updated= await createApp(data)
    }     

    revalidatePath("/admin/apps")

    return updated as AppDAO
}

export async function deleteAppAction(id: string): Promise<AppDAO | null> {    
    const deleted= await deleteApp(id)

    revalidatePath("/admin/apps")

    return deleted as AppDAO
}

export async function updatePromptAndCreateVersionAction(versionPrompt: PromptVersionFormValues) {

    await setPrompt(versionPrompt.content, versionPrompt.appId)
    const newVersion= await createPromptVersion(versionPrompt)
    if (!newVersion) throw new Error("Error al crear la versión del prompt")

    revalidatePath("/admin/apps")
    return newVersion
}

export async function updatePromptAction(versionPrompt: PromptVersionFormValues) {
    await setPrompt(versionPrompt.content, versionPrompt.appId)
    revalidatePath("/admin/apps")
    return true
}