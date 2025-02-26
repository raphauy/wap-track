import { getWhatsappInstancesDAO } from "@/services/whatsappinstance-services"
import { WhatsappInstanceDialog } from "./whatsappinstance-dialogs"
import { DataTable } from "./whatsappinstance-table"
import { columns } from "./whatsappinstance-columns"

export default async function WhatsappInstancePage() {
  
  const data= await getWhatsappInstancesDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <WhatsappInstanceDialog />
      </div>

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white dark:bg-black">
        <DataTable columns={columns} data={data} subject="WhatsappInstance"/>      
      </div>
    </div>
  )
}
  
