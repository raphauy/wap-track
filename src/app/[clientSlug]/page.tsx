import { getClientDAO, getClientDAOBySlug } from "@/services/client-services"

type Props = {
  params: Promise<{
    clientSlug: string
  }>
}

export default async function ClientPage({ params }: Props) {
  const { clientSlug } = await params
  const client = await getClientDAOBySlug(clientSlug)
  return (
    <div>
      <p className="text-2xl font-bold">{client.name}</p>
    </div>
  )
}