'use client'

import * as React from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Camera, Loader } from 'lucide-react'
import { generateReactHelpers } from "@uploadthing/react"
import { OurFileRouter } from '@/app/api/uploadthing/core'
import { useSession } from 'next-auth/react'

const { useUploadThing } = generateReactHelpers<OurFileRouter>()

type Props = {
  label: string
  description: string
  imageUrl: string | null | undefined
  onUpdate: (url: string) => Promise<boolean>
}

export function AvatarField({ label = "Avatar", description = "Este es tu avatar.", imageUrl, onUpdate }: Props) {
  const { update, data } = useSession()
  const { toast } = useToast()
  const [avatarUrl, setAvatarUrl] = React.useState<string | null | undefined>(imageUrl)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (res) => {
      if (res?.[0]) {
        const success = await onUpdate(res[0].url)
        if (success) {
          setAvatarUrl(res[0].url)
          toast({
            title: label,
            description: "Tu avatar se ha actualizado correctamente.",
          })
          update({
            trigger: "update"
          })
        } else {
          toast({
            variant: "destructive",
            title: label,
            description: "No se pudo actualizar el avatar. Por favor, intenta de nuevo.",
          })
        }
      }
    },
    onUploadError: (error: Error) => {
      toast({
        variant: "destructive",
        title: label,
        description: error.message || "Error al subir la imagen.",
      })
    },
  })

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await startUpload([file])
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Label className="text-base font-semibold">
                {label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {
                isUploading && (
                  <div className='h-16 w-16 flex items-center justify-center border rounded-full'>
                    <Loader className="h-6 w-6 text-muted-foreground animate-spin" />
                  </div>
                )
            }
            {
              !isUploading && (            
              <Avatar 
                className="h-16 w-16 rounded-full cursor-pointer transition-opacity hover:opacity-90"
                onClick={handleClick}
              >
                <AvatarImage 
                  src={avatarUrl || undefined} 
                  className="object-cover"
                  alt="Avatar"
                />
                <AvatarFallback className="bg-muted">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Haz clic en el avatar para subir una imagen desde tus archivos.
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted py-4 border-t">
        <p className="text-sm text-muted-foreground">
          El avatar es opcional pero altamente recomendado.
        </p>
      </CardFooter>
    </Card>
  )
}