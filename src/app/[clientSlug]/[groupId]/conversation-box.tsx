import { Badge } from "@/components/ui/badge"
import { getFormatInTimezone } from "@/lib/utils"
import ConversationMessageBox from "./conversation-message-box"
import { GroupDAOWithMessages } from "@/services/group-services"
import { DeleteGroupDialog } from "@/app/admin/groups/group-dialogs"

type Props = {
  group: GroupDAOWithMessages
  isAdmin: boolean
}
  
export default function ConversationBox({ group, isAdmin }: Props) {

  const totalTokens= group.messages.reduce((acc, message) => acc + message.tokens, 0)
  const messagesCount= group.messages.length
  const credits= totalTokens / 1000

  const messages= isAdmin ? group.messages : group.messages.filter(message => message.role !== "system")

  return (
      <main className="flex flex-col items-center justify-between w-full p-3 border-l">
        <div className="flex justify-between w-full pb-2 text-center border-b">
          <div>
            <p className="text-lg font-bold">{group.name} ({getFormatInTimezone(group.updatedAt, "America/Montevideo")})</p>
            {
              totalTokens > 0 && isAdmin && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="border-gray-400">{messagesCount} mensajes</Badge>
                  <Badge variant="secondary" className="border-gray-400">{credits.toFixed(1)} créditos</Badge>
                </div>
              )
            }
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && 
              <>
                {/* <CloseConversationDialog id={conversation.id} description={`Seguro que desea cerrar la conversación de ${conversation.phone}`} redirectUri={`conversaciones`} closed={conversation.closed} /> */}
                <DeleteGroupDialog id={group.id} description={`Seguro que desea eliminar el grupo ${group.name}`} />
              </>
            }
          </div>          
        </div>  

        <div className="w-full mt-5">
          {messages.map((message, i) => {
            return(
              <ConversationMessageBox key={i} message={message} />            
            )})
          }
      </div>

      </main>
    );
  }


