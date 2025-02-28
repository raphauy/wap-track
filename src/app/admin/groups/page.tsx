import { getAllGroupsDAO } from "@/services/group-services"
import { columns } from "./group-columns"
import { DataTable } from "./group-table"

export default async function GroupPage() {
  
  const data= await getAllGroupsDAO()

  return (
    <div className="w-full space-y-4">      

      <p className="text-2xl font-bold">Grupos</p>

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white dark:bg-black">
        <DataTable columns={columns} data={data} subject="Group"/>      
      </div>
    </div>
  )
}
  
