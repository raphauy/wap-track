"use server"
  
import { revalidatePath } from "next/cache"
import { GroupDAO, GroupFormValues, createGroup, updateGroup, getGroupDAO, deleteGroup } from "@/services/group-services"


export async function getGroupDAOAction(id: string): Promise<GroupDAO | null> {
    return getGroupDAO(id)
}

export async function createOrUpdateGroupAction(id: string | null, data: GroupFormValues): Promise<GroupDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateGroup(id, data)
    } else {
        updated= await createGroup(data)
    }     

    revalidatePath("/admin/groups")

    return updated as GroupDAO
}

export async function deleteGroupAction(id: string): Promise<GroupDAO | null> {    
    const deleted= await deleteGroup(id)

    revalidatePath("/admin/groups")

    return deleted as GroupDAO
}

