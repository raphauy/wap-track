import { getMessagesDAO } from "@/services/message-services"
import { MessageDialog } from "./message-dialogs"
import { DataTable } from "./message-table"
import { columns } from "./message-columns"

export default async function MessagePage() {
  
  const data= await getMessagesDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <MessageDialog />
      </div>

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white dark:bg-black">
        <DataTable columns={columns} data={data} subject="Message"/>      
      </div>
    </div>
  )
}
  
