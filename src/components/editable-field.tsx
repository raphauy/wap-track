'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useSession } from 'next-auth/react'

interface EditableFieldProps {
  label: string
  description: string
  value: string
  maxLength?: number
  onUpdate: (value: string) => Promise<boolean>
}

export function EditableField({
  label,
  description,
  value: initialValue,
  maxLength = 32,
  onUpdate,
}: EditableFieldProps) {
  const [value, setValue] = React.useState(initialValue)
  const [isPending, setIsPending] = React.useState(false)
  const { toast } = useToast()
  const { update, data } = useSession()
  
  const hasChanges = value !== initialValue
  
  const handleSave = async () => {
    setIsPending(true)
    try {
      const success = await onUpdate(value)
      if (success) {
        toast({
          title: label,
          description: "Tus cambios se han guardado correctamente.",
        })
        console.log("updating session", data)
        update({
          trigger: "update"
        })
      } else {
        toast({
          variant: "destructive",
          title: label,
          description: "No se pudieron guardar los cambios. Por favor, intenta de nuevo.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: label,
        description: "Ocurrió un error inesperado.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6 space-y-2">
        <div className="space-y-1.5">
          <Label htmlFor={label} className="text-base font-semibold">
            {label}
          </Label>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="relative">
          <Input
            id={label}
            value={value}
            maxLength={maxLength}
            onChange={(e) => setValue(e.target.value)}
            className="pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted py-3 border-t">
        <div className="flex w-full justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {maxLength ? `Por favor usa máximo ${maxLength} caracteres.` : ""}
          </p>
          <Button
            onClick={handleSave}
            disabled={isPending || !hasChanges}
          >
            Guardar
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

