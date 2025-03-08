import { getClientDAOBySlug } from "@/services/client-services"
import { DataTable } from "./data-table"
import { getGroupsDAO } from "@/services/group-services"
import { columns } from "./columns-short"

type Props = {
    params: Promise<{ clientSlug: string }>
}

export async function GroupsTable({ params }: Props) {
    const { clientSlug } = await params
    const client = await getClientDAOBySlug(clientSlug)
    if (!client) return <div>Cliente no encontrado</div>

    const groups = await getGroupsDAO(client.id)
    if (!groups || groups.length === 0) {
        return <div className="py-2 mx-auto text-muted-foreground dark:text-white w-full text-center">
            No hay grupos
        </div>
    }

    return (
        <div className="py-2 mx-auto text-muted-foreground dark:text-white w-full">
            <DataTable columns={columns} data={groups} />
        </div>
    )
} 

export function GroupsTableSkeleton() {
    return <div className="py-2 mx-auto text-muted-foreground dark:text-white w-full overflow-hidden">
        {/* Input skeleton */}
        <div className="mb-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
        
        {/* Headers skeleton */}
        <div className="flex mb-2 border-b pb-2">
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2"></div>
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Rows skeleton */}
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex py-3 border-b">
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2"></div>
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
        ))}
    </div>
}