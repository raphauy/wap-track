import { getCurrentUser } from "@/lib/utils"
import { getGroupDAO, getGroupDAOWithMessages } from "@/services/group-services"
import ConversationBox from "./conversation-box"

type Props = {
  params: Promise<{
    clientSlug: string
    groupId: string
  }>
}

export default async function GroupChatPage({ params }: Props) {
  const { clientSlug, groupId } = await params
  const user= await getCurrentUser()

  const group= await getGroupDAOWithMessages(groupId)
  if (!group) return <div>Grupo no encontrado</div>

  const isAdmin= user?.role === "ADMIN"

  return (
    <div className="flex flex-grow w-full">

      <div className="flex flex-col items-center flex-grow p-1">
        
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold">{group.name}</p>
            { isAdmin && <p className="text-sm text-muted-foreground">(Admin mode)</p>}
          </div>
          <ConversationBox
            group={group}
            isAdmin={isAdmin}
          />  
        
        
      </div>
    </div>

    );
  }
    