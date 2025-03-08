import { getGastosContext } from '@/services/app-gastos';
import { saveLLMTextResponse, saveToolCallResponse } from '@/services/function-call-services';
import { getFullGroupDAO, getGroupContext } from '@/services/group-services';
import { onGroupMessageReceived } from '@/services/message-services';
import { groupTools } from '@/services/tools';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, groupId, input } = await req.json();

  console.log("groupId: ", groupId)
  console.log("input: ", input)
  const lastMessage= messages[messages.length - 1]
  const lastMessageContent= lastMessage.content
  console.log("lastMessageContent: ", lastMessageContent)
  await onGroupMessageReceived(lastMessageContent, groupId)

  const group= await getFullGroupDAO(groupId)
  const app= group.app

  if (!app) throw new Error(`El grupo ${groupId} no tiene una app asociada`)
  if (!app.prompt) throw new Error(`La app ${app.name} no tiene configurado el prompt`)

  const groupContext= await getGroupContext(group)
  const gastosContext= await getGastosContext(group)
  const context= app.prompt + "\n" + groupContext + "\n" + gastosContext
  console.log("context: " + context)

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: context,
    messages,
    maxSteps: 5,
    tools: groupTools,
    onStepFinish: async (event) => {
      console.log("onStepFinish");
      const text= event.text
      if (text) {
        const usage= event.usage
        await saveLLMTextResponse(text, usage, group.id)
      }
      if (event.toolResults.length > 0) {
        await saveToolCallResponse(event, group.id)
      }
    },
  });

  return result.toDataStreamResponse();
}