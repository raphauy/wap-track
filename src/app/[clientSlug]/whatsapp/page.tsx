import { getClientDAOBySlug } from "@/services/client-services"
import { getWhatsappInstanceDAOByClientId } from "@/services/whatsappinstance-services"
import { fetchInstance } from "@/services/wrc-sdk"
import { ConnectionDetails } from "./connection-details"
import CreateInstanceButton from "./create-instance-button"

type Props = {
    params: Promise<{
        clientSlug: string
    }>
}
export default async function WhatsappPage({ params }: Props) {
    const { clientSlug } = await params
    const client= await getClientDAOBySlug(clientSlug)
    if (!client) return <div>Cliente no encontrado: {clientSlug}</div>
    const whatsappInstance= await getWhatsappInstanceDAOByClientId(client.id)

    if (!whatsappInstance) {
        const instanceName = client.slug
      
        return (
            <div className="flex items-center justify-center w-full mt-10 border rounded-md border-dashed h-40">
                <CreateInstanceButton name={instanceName} />
            </div>
        )
    } else {
        const wrcInstance = await fetchInstance(whatsappInstance.name)
        if (!wrcInstance) {
            return <div>No instance found</div>
        } else {
            return (<ConnectionDetails instance={wrcInstance} clientId={client.id} chatwootAccountId={whatsappInstance.chatwootAccountId} whatsappInboxId={whatsappInstance.whatsappInboxId}/>)
        }
    }  
  
}