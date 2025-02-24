import { getUsersDAO } from "@/services/user-services"
import { UserDialog } from "./user-dialogs"
import { DataTable } from "./user-table"
import { columns } from "./user-columns"
import { Role } from "@prisma/client"

export default async function UserPage() {
  
  const data= await getUsersDAO()

  const roles= Object.values(Role)
  
  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <UserDialog />
      </div>

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white dark:bg-black">
        <DataTable columns={columns} data={data} subject="User" roles={roles}/>      
      </div>
    </div>
  )
}
  
