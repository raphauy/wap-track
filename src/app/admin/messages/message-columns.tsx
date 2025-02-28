"use client"

import { Button } from "@/components/ui/button"
import { MessageDAO } from "@/services/message-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { DeleteMessageDialog, MessageDialog } from "./message-dialogs"


export const columns: ColumnDef<MessageDAO>[] = [
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Role
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      )
    },
    filterFn: (row, id, value) => {
      const data = row.original
      const valueLower = value.toLowerCase()
      return !!(data.role?.toLowerCase().includes(valueLower) ||
        data.content?.toLowerCase().includes(valueLower) ||
        data.groupId?.toLowerCase().includes(valueLower))
    },
  },
  
  // {
  //   accessorKey: "role",
  //   header: ({ column }) => {
  //     return (
  //       <Button variant="ghost" className="pl-0 dark:text-white"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
  //         Rol
  //         <ArrowUpDown className="w-4 h-4 ml-1" />
  //       </Button>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const data= row.original

      const deleteDescription= `Do you want to delete Message ${data.id}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <MessageDialog id={data.id} />
          <DeleteMessageDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


