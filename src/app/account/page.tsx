import { auth } from "@/lib/auth"
import { EditableField } from "@/components/editable-field"
import { updateUserAvatar, updateUserName } from "./actions"
import { getUserDAO } from "@/services/user-services"
import { AvatarField } from "@/components/avatar-field"

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) {
    console.log("No user id, user: ", session?.user)
    return null
  }

  const user = await getUserDAO(session.user.id)

  return (
    <div className="mx-auto p-6 w-full">
      <h1 className="text-2xl text-center font-bold mb-6">Perfil de Usuario</h1>
      
      <div className="space-y-4">
        <EditableField
            label="Nombre"
            description="Por favor, ingresa tu nombre o un nombre que te resulte cómodo."
            value={user.name || ""}
            maxLength={32}
            onUpdate={updateUserName}
        />

        <AvatarField 
            label="Avatar"
            description="Este es tu avatar."
            imageUrl={user.image} 
            onUpdate={updateUserAvatar} 
            />
      </div>
    </div>
  )
}