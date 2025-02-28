import { StepResult } from "ai";
import { createMessage, MessageFormValues } from "./message-services";


export async function saveLLMResponse(text: string, finishReason: string, usage: any, groupId: string) {
 
  if (text) {
    const messageForm: MessageFormValues= {
      role: "assistant",
      content: text,
      tokens: usage.completionTokens + (usage.promptTokens * 3),
      groupId,
    }        
    await createMessage(messageForm)
  }

  console.log("saveLLMResponse finishReason", finishReason)
  console.log("saveLLMResponse usage", usage)

  return
}

export async function saveToolCallResponse(event: StepResult<any>, groupId: string) {

  const toolResults= event.toolResults
  if (!toolResults) {
    console.log("saveToolCallResponse toolResults is null")
    return
  }
  console.log("finishReason", event.finishReason)
  console.log("toolResults", toolResults)
  console.log("usage", event.usage)
  
  
  const usage= event.usage

  // Handle tool results
  for (const toolResult of toolResults) {
    const messageForm: MessageFormValues= {
      role: "data",
      content: "",
      name: toolResult.toolName,
      tokens: usage.completionTokens + (usage.promptTokens * 3),
      toolInvocations: JSON.stringify(toolResult),
      groupId,
    }
    await createMessage(messageForm)

  }      

  return
}
