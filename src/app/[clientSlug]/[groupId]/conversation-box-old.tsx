"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { formatWhatsAppStyle } from "@/lib/utils"
import { GroupDAOWithMessages } from "@/services/group-services"
import clsx from "clsx"
import { Bot, Terminal, User } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import GPTData from "./gpt-data"

type Props = {
  group: GroupDAOWithMessages
  isAdmin: boolean
}
  
export default function ConversationBox({ group, isAdmin }: Props) {

  const params= useParams()
  const slug= params.slug as string

  const [loading, setLoading] = useState(false)
  const [showSystem, setShowSystem] = useState(false)

  const messages= showSystem && isAdmin ? group.messages : group.messages.filter(message => message.role !== "system")

  return (
      <main className="flex flex-col items-center justify-between w-full p-3 border-l">
        <div className="flex justify-between w-full pb-2 text-center border-b">
          <div className="flex items-center gap-2">
            {isAdmin && 
              <>
                <p>Prompt:</p><Switch checked={showSystem} onCheckedChange={setShowSystem} />
              </>
            }
          </div>          
        </div>  

        <div className="w-full max-w-3xl mt-5 ">
        {
          messages.map((message, i) => (
            <div key={i} className="w-full">
              <div className={clsx(
                  "flex w-full items-center justify-between px-1 lg:px-4 border-b border-gray-200 py-5",
                  message.role === "user" ? "bg-gray-100 dark:bg-gray-800" : "bg-background",
                )}
              >
                <div className="flex items-center w-full max-w-screen-md px-5 space-x-4 sm:px-0">
                  {
                    !message.gptData &&
                    <div className="flex flex-col">
                      <div
                          className={clsx(
                          "p-1.5 text-white flex justify-center",
                          (message.role === "assistant") ? "bg-green-500" : (message.role === "system" || message.role === "function") ? "bg-blue-500" : "bg-black",
                        )}
                      >
                          {message.role === "user" ? (
                          <User width={20} />
                          ) : message.role === "system" || message.role === "function" ? (
                            <Terminal width={20} />
                          ) : (
                          <Bot width={20} />
                          )
                          }
                      </div>
                      <p className="text-sm">{formatWhatsAppStyle(message.createdAt)}</p>
                    </div>
                  }
                  {message.role === "system" ?
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="Prompt">
                      <AccordionTrigger>Prompt</AccordionTrigger>
                      <AccordionContent>
                        <div className="whitespace-pre-line">
                          {message.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion> :
                    <div className="w-full">
                      {
                        message.role != "system" &&
                        <ReactMarkdown                        
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // open links in new tab
                            a: (props) => (
                              <a {...props} target="_blank" rel="noopener noreferrer" />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      }
                    </div>
                }
                </div>
                {
                  message.tokens > 0 && isAdmin ? (
                    <div className="grid p-2 text-right border rounded-md">
                      <p className="whitespace-nowrap">{Intl.NumberFormat("es-UY").format(message.tokens)} tokens</p>
                    </div>
                  ) : 
                  <div></div>
                }
              </div>
              {
                message.gptData && isAdmin && (
                  <GPTData gptData={message.gptData} slug={group.client.slug} />
                )
              }              
            </div>
          ))
        }
        </div>

      </main>
    );
  }


