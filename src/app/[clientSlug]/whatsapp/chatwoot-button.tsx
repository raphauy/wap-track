"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader, MessageSquare } from "lucide-react";
import { useState } from "react";
import { enableChatwootAction } from "./actions";


type ChatwootButtonProps = {
    clientId: string;
    instanceName: string;    
}
export default function ChatwootButton({ clientId, instanceName }: ChatwootButtonProps) {
    const [loadingSetChatwoot, setLoadingSetChatwoot] = useState(false);
    const [chatwootAccountId, setChatwootAccountId] = useState<number | null>(null);

    function handleEnableChatwoot() {
      if (!chatwootAccountId) {
          toast({ title: "Se necesita un ID de cuenta de Chatwoot", variant: "destructive" })
          return;
      }

      setLoadingSetChatwoot(true)
      enableChatwootAction(clientId, instanceName, chatwootAccountId)
      .then((result) => {
        if (result) {
          toast({ title: "Chatwoot habilitado" })
        } else {
          toast({ title: "Error habilitando Chatwoot", description: "No se pudo habilitar Chatwoot", variant: "destructive" })
        }
      })
      .catch((error) => {
        toast({ title: "Error habilitando Chatwoot", description: error.message, variant: "destructive" })
      })
      .finally(() => {
          setLoadingSetChatwoot(false)
      })
    }

    
    return (
        <div className="flex flex-col gap-4 border p-8 rounded-md w-full">
            <Input
              type="text"
              placeholder="ID de la cuenta de Chatwoot"
              value={chatwootAccountId ? chatwootAccountId.toString() : ""}
              onChange={(e) => setChatwootAccountId(e.target.value ? parseInt(e.target.value) : null)}
            />
            <Button onClick={handleEnableChatwoot} className="col-span-2 mt-2">
              { loadingSetChatwoot ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" /> }
              Habilitar Chatwoot
            </Button>
        </div>
    )
}

