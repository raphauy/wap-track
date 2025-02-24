"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { deleteOTPSessionAction, createOrUpdateOTPSessionAction, getOTPSessionDAOAction } from "./otpsession-actions"
import { oTPSessionSchema, OTPSessionFormValues } from '@/services/otpsession-services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader } from "lucide-react"

type Props= {
  id?: string
  closeDialog: () => void
}

export function OTPSessionForm({ id, closeDialog }: Props) {
  const form = useForm<OTPSessionFormValues>({
    resolver: zodResolver(oTPSessionSchema),
    defaultValues: {
      userId: "",
      deviceBrowser: "",
      deviceOs: "",
      ipAddress: "",
      city: "",
      country: "",
    },
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: OTPSessionFormValues) => {
    setLoading(true)
    try {
      await createOrUpdateOTPSessionAction(id ? id : null, data)
      toast({ title: id ? "OTPSession updated" : "OTPSession created" })
      closeDialog()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      getOTPSessionDAOAction(id).then((data) => {
        if (data) {
          const formData = {
            userId: data.userId,
            deviceBrowser: data.deviceBrowser || undefined,
            deviceOs: data.deviceOs || undefined,
            ipAddress: data.ipAddress || undefined,
            city: data.city || undefined,
            country: data.country || undefined,
          }
          form.reset(formData)
        }
      })
    }
  }, [form, id])

  return (
    <div className="p-4 bg-white rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <FormField
            control={form.control}
            name="deviceBrowser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DeviceBrowser</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="OTPSession's deviceBrowser" 
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="deviceOs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DeviceOs</FormLabel>
                <FormControl>
                  <Input placeholder="OTPSession's deviceOs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="ipAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IpAddress</FormLabel>
                <FormControl>
                  <Input placeholder="OTPSession's ipAddress" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="OTPSession's city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="OTPSession's country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UserId</FormLabel>
                <FormControl>
                  <Input placeholder="OTPSession's userId" {...field} />
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

export function DeleteOTPSessionForm({ id, closeDialog }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!id) return
    setLoading(true)
    deleteOTPSessionAction(id)
    .then(() => {
      toast({title: "OTPSession deleted" })
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

