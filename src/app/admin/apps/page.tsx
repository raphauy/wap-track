import { getAppsDAO } from "@/services/app-services"
import { AppDialog } from "./app-dialogs"
import { DataTable } from "./app-table"
import { columns } from "./app-columns"

export default async function AppPage() {
  
  const data= await getAppsDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <AppDialog />
      </div>

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white dark:bg-black">
        <DataTable columns={columns} data={data} subject="App"/>      
      </div>
    </div>
  )
}
  
