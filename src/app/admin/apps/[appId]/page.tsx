import { getAppDAO } from "@/services/app-services"
import { getPromptVersionsDAO } from "@/services/prompt-version-services"
import PromptVersionManager from "./prompt-version-manager"

type Props = {
  params: Promise<{appId: string}>
}

export default async function AppPage({ params }: Props) {
  const { appId } = await params

  const app = await getAppDAO(appId)

  const versions= await getPromptVersionsDAO(app.id)

  return (
    <div className="space-y-4">
        <p className="text-2xl font-bold">Prompt para {app.name}</p>
        <PromptVersionManager appId={app.id} prompt={app.prompt || ""} versions={versions} />
    </div>
  )
}
