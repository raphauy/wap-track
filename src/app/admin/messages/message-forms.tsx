"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { deleteMessageAction, createOrUpdateMessageAction, getMessageDAOAction } from "./message-actions"
import { MessageSchema, MessageFormValues } from '@/services/message-services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader } from "lucide-react"




type Props = {
  id?: string
  closeDialog: () => void
}

export function MessageForm({ id, closeDialog }: Props) {
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      role: "user",
      content: "",
      gptData: "",
      tokens: 0,
      name: "",
      toolInvocations: "",
      groupId: ""
    },
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)


  const onSubmit = async (data: MessageFormValues) => {
    setLoading(true)
    try {
      await createOrUpdateMessageAction(id ? id : null, data)
      toast({ title: id ? "Message updated" : "Message created" })
      closeDialog()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      getMessageDAOAction(id).then((data) => {
        if (data) {
          form.setValue("role", data.role as "user" | "assistant" | "system" | "data")
          form.setValue("content", data.content)
          form.setValue("tokens", data.tokens)
          form.setValue("groupId", data.groupId)
          form.setValue("gptData", data.gptData)
          form.setValue("name", data.name)
          form.setValue("toolInvocations", data.toolInvocations)
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
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="Message's role" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Input placeholder="Message's content" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gptData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GptData</FormLabel>
                <FormControl>
                  <Input placeholder="Message's gptData" {...field} />
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

export function DeleteMessageForm({ id, closeDialog }: DeleteProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!id) return
    setLoading(true)
    deleteMessageAction(id)
    .then(() => {
      toast({title: "Message deleted" })
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
