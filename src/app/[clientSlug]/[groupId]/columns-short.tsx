"use client"

import { Button } from "@/components/ui/button"
import { GroupDAO } from "@/services/group-services"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown } from "lucide-react"
import Link from "next/link"

export const columns: ColumnDef<GroupDAO>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Creado
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const data= row.original
      const date= format(data.createdAt, "dd/MM/yyyy")
      return (
        <div className="">
          {date}
        </div>
      )
    }
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Nombre
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    cell: ({ row }) => {
      const data= row.original
      // remove the text "(GROUP)"
      const name= data.name.replace("(GROUP)", "").trim()
 
      return (
        <div className="flex items-center justify-start flex-1 max-w-full overflow-hidden">
          <Link href={`/${data.client.slug}/${data.id}`} prefetch={false} className="w-full overflow-hidden">
              <Button variant="link" className="px-0">
                {name}
              </Button>
          </Link>
        </div>
      )
    },
  },
]
