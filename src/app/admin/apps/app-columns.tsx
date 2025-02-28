"use client"

import { Button } from "@/components/ui/button"
import { AppDAO } from "@/services/app-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { DeleteAppDialog, AppDialog } from "./app-dialogs"
import Link from "next/link"


export const columns: ColumnDef<AppDAO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const data= row.original
      return (
        <Link href={`/admin/apps/${data.id}`}>
          <Button variant="link" className="p-0">{data.name}</Button>
        </Link>
      )
    },
    filterFn: (row, id, value) => {
      const data = row.original
      const valueLower = value.toLowerCase()
      return !!(data.name?.toLowerCase().includes(valueLower))
    },
  },
  
  {
    accessorKey: "prompt",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Prompt
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            UpdatedAt
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
		cell: ({ row }) => {
      const data= row.original
      const date= data.updatedAt && format(new Date(data.updatedAt), "yyyy-MM-dd")
      return (<p>{date}</p>)
    }
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

      const deleteDescription= `Do you want to delete App ${data.id}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <AppDialog id={data.id} />
          <DeleteAppDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


