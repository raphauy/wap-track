"use client"

import { Button } from "@/components/ui/button"
import { GroupDAO } from "@/services/group-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { DeleteGroupDialog, GroupDialog } from "./group-dialogs"


export const columns: ColumnDef<GroupDAO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nombre
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      )
    },    
    filterFn: (row, id, value) => {
      const data = row.original
      const valueLower = value.toLowerCase()
      return !!(data.name?.toLowerCase().includes(valueLower))
    },
  },
  
  {
    accessorKey: "chatwootConversationId",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            ChatwootConversationId
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "appId",
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="pl-0 dark:text-white">AppId</Button>
      )
    },
  },
  
  {
    id: "actions",
    cell: ({ row }) => {
      const data= row.original

      const deleteDescription= `Seguro que quieres eliminar el grupo ${data.name}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <DeleteGroupDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


