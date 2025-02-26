"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { deleteWhatsappInstanceAction, createOrUpdateWhatsappInstanceAction, getWhatsappInstanceDAOAction } from "./whatsappinstance-actions"
import { WhatsappInstanceSchema, WhatsappInstanceFormValues } from '@/services/whatsappinstance-services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader } from "lucide-react"




type Props = {
  id?: string
  closeDialog: () => void
}

export function WhatsappInstanceForm({ id, closeDialog }: Props) {
  const form = useForm<WhatsappInstanceFormValues>({
    resolver: zodResolver(WhatsappInstanceSchema),
    defaultValues: {
      name: "",
      chatwootUrl: "",
      chatwootAccessToken: ""
    },
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)


  const onSubmit = async (data: WhatsappInstanceFormValues) => {
    setLoading(true)
    try {
      await createOrUpdateWhatsappInstanceAction(id ? id : null, data)
      toast({ title: id ? "WhatsappInstance updated" : "WhatsappInstance created" })
      closeDialog()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      getWhatsappInstanceDAOAction(id).then((data) => {
        if (data) {
          form.reset(data)
        }
        Object.keys(form.getValues()).forEach((key: any) => {
          if (form.getValues(key) === null) {
            form.setValue(key, "")
          }
        })
      })
    }
  }, [form, id])

  return (
    <div className="rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="WhatsappInstance's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chatwootUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ChatwootUrl</FormLabel>
                <FormControl>
                  <Input placeholder="WhatsappInstance's chatwootUrl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chatwootAccessToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ChatwootAccessToken</FormLabel>
                <FormControl>
                  <Input placeholder="WhatsappInstance's chatwootAccessToken" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button onClick={() => closeDialog()} type="button" variant={"secondary"} className="w-32">Cancel</Button>
            <Button type="submit" className="w-32 ml-2">
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <p>Save</p>}
            </Button>
          </div>
        </form>
      </Form>
    </div>     
  )
}

type DeleteProps= {
  id: string
  closeDialog: () => void
}

export function DeleteWhatsappInstanceForm({ id, closeDialog }: DeleteProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!id) return
    setLoading(true)
    deleteWhatsappInstanceAction(id)
    .then(() => {
      toast({title: "WhatsappInstance deleted" })
    })
    .catch((error) => {
      toast({title: "Error", description: error.message, variant: "destructive"})
    })
    .finally(() => {
      setLoading(false)
      closeDialog && closeDialog()
    })
  }
  
  return (
    <div>
      <Button onClick={() => closeDialog && closeDialog()} type="button" variant={"secondary"} className="w-32">Cancel</Button>
      <Button onClick={handleDelete} variant="destructive" className="w-32 ml-2 gap-1">
        { loading && <Loader className="h-4 w-4 animate-spin" /> }
        Delete  
      </Button>
    </div>
  )
}
