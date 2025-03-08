import { getCurrentUser } from "@/lib/utils";
import { getClientDAOBySlug } from "@/services/client-services";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GroupsTable, GroupsTableSkeleton } from "./groups-table";

interface Props {
  children: React.ReactNode
  params: Promise<{
    clientSlug: string
  }>
}

export default async function ChatLayout({ children, params }: Props) {

  const currentUser = await getCurrentUser()

  if (currentUser?.role !== "ADMIN") {
    return notFound()
  }

  const { clientSlug } = await params
  const client= await getClientDAOBySlug(clientSlug)
  if (!client) return <div>Cliente no encontrado</div>

  return (
    <>
      <div className="flex flex-grow w-full h-full">
        <div className="flex flex-grow w-full gap-2">
          <div className="w-[350px] flex-shrink-0 overflow-hidden">
            <Suspense fallback={<GroupsTableSkeleton />}>
              <GroupsTable params={params} />
            </Suspense>
          </div>
          <div className="flex flex-grow w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}