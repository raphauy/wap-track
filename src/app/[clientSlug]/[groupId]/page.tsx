'use client';

import { getGroupDAOWithMessagesAction } from '@/app/admin/groups/group-actions';
import CodeBlock from '@/components/code-block';
import { cn } from '@/lib/utils';
import { GroupDAO } from '@/services/group-services';
import { useChat } from '@ai-sdk/react';
import { Message } from 'ai';
import { Clock, Loader, Phone, SendIcon, User, UserPlus, Receipt, DollarSign, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Textarea from "react-textarea-autosize";

// Mock de usuarios para simular un chat grupal
const mockUsers = [
  { id: 1, name: 'Agustín (Shock)', avatar: '👨‍💻' },
  { id: 2, name: 'Joaco', avatar: '👨‍🚀' },
  { id: 3, name: 'IA Asistente', avatar: '🤖' }
];

export default function Chat() {

  const [group, setGroup] = useState<GroupDAO | null>(null)

  const { clientSlug, groupId } = useParams()

  const { messages, input, setInput, status, setMessages, handleInputChange, handleSubmit } = useChat({
    body: {
      groupId: groupId as string
    }
  });

  useEffect(() => {

    const fetchGroup = async () => {
      const group = await getGroupDAOWithMessagesAction(groupId as string)
      if (!group) return
      setGroup(group)
      setMessages(group?.messages as Message[])
    }
    fetchGroup()
  }, [groupId, setMessages])

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const disabled = status === 'streaming' || input.length === 0;

  // Asignar un usuario aleatorio a cada mensaje para simular chat grupal
  const chatMessages = messages.map((m, index) => ({
    ...m,
    user: m.role === 'user' 
      ? mockUsers[Math.floor(index % 2)] // Usuario aleatorio entre los dos primeros
      : mockUsers[2] // El asistente IA
  }));

  // Scroll al último mensaje cuando se añade uno nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!group) return null

  return (
    <div className="flex flex-col w-full h-full overflow-hidden pt-2">
      <div className="bg-emerald-600 dark:bg-emerald-800 p-3 text-white flex items-center">
        <div className="font-semibold">{group?.name}</div>
      </div>

      <div style={{ backgroundImage: 'url("/chat-bg.png")', backgroundSize: 'contain' }} className="flex flex-col w-full h-full justify-between overflow-auto">
        <div className="flex flex-col w-full mx-auto justify-between h-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-3xl sm:px-0">
          {/* Header del chat */}

          {/* Contenedor de mensajes */}
          <div className="flex-1 p-4 space-y-3">
            {chatMessages.map((m) => {
              const isUser = m.role === 'user';
              if (isUser) return <UserRowMessage key={m.id} message={m} />

              const isAssistant = m.role === 'assistant';
              if (isAssistant) return <AssistantRowMessage key={m.id} message={m} />

              const isData = m.role === 'data';
              if (isData) return <DataRowMessage key={m.id} message={m} />
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input y botón de envío */}
          <div className="flex flex-col items-center w-full pb-5">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="relative w-full px-4 pt-3 pb-2 bg-white border border-gray-200 shadow-lg rounded-xl"
            >
              <Textarea
                ref={inputRef}
                tabIndex={0}
                required
                rows={1}
                autoFocus
                placeholder="Escribe aquí"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    formRef.current?.requestSubmit();
                    e.preventDefault();
                  }
                }}
                spellCheck={false}
                className="w-full pr-10 focus:outline-none"
              />
              <button
                className={cn(
                  "absolute inset-y-0 right-4 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
                  disabled
                    ? "cursor-not-allowed bg-white"
                    : "bg-green-500 hover:bg-green-600",
                )}
                disabled={disabled}
              >
                {status === 'streaming' ? (
                  <Loader className="animate-spin" />
                ) : (
                  <SendIcon
                    className={cn(
                      "h-4 w-4",
                      input.length === 0 ? "text-gray-300" : "text-white",
                    )}
                  />
                )}
              </button>
            </form>
            
          </div>

        </div>
      </div>
    </div>
  );
}

function UserRowMessage({message}: {message: Message}) {
  const isUser= message.role === 'user'
  if (!isUser) return null

  // take the user name from the message content
  // user message content starts in the first line with ** {phone} - {name} **
  const firstLine= message.content.split('\n')[0]
  const isSiumulator= !firstLine.includes("-")
  const userName=  isSiumulator ? 'Simulador:' : firstLine.split(' - ')[1].trim().replace('**', '').trim()
  const content= isSiumulator ? message.content : message.content.split('\n').slice(1).join('\n')
  const createdAt= message.createdAt

  return (
    <div key={message.id} className="flex justify-end">
      <div className={`max-w-[70%] min-w-[300px] rounded-lg p-3 bg-emerald-100 dark:bg-emerald-900 border-l-4 border-emerald-500`}>
        <div className={`text-xs font-bold text-emerald-700 dark:text-emerald-400`}>
          {userName}
        </div>
        
        <div className="whitespace-pre-wrap text-sm mt-1 text-zinc-800 dark:text-zinc-200">
          {content}
        </div>
        
        <div className="text-xs text-right mt-1 text-zinc-500">
          {createdAt ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  )
}

function AssistantRowMessage({message}: {message: Message}) {
  const isAssistant= message.role === 'assistant'
  if (!isAssistant) return null

  const content= message.content
  if (content === "<SILENCIO>") return null

  const createdAt= message.createdAt

  return (
    <div key={message.id} className="flex justify-start">
      <div className={`max-w-[70%] min-w-[300px] rounded-lg p-3 bg-white dark:bg-zinc-800 border-l-4 border-blue-500`}>
        {/* Nombre del remitente */}
        <div className={`text-xs font-bold text-blue-600 dark:text-blue-400`}>
          WapTrack:
        </div>
        
        {/* Contenido del mensaje */}
        <div className="whitespace-pre-wrap text-sm mt-1 text-zinc-800 dark:text-zinc-200">
          {content}
        </div>
        
        {/* Hora del mensaje (simulada) */}
        <div className="text-xs text-right mt-1 text-zinc-500">
          {createdAt ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  )
}

function DataRowMessage({message}: {message: Message}) {
  const isData= message.role === 'data'
  if (!isData) return null

  const jsonContent= JSON.parse(message.content)
  const toolName= jsonContent.toolName
  const toolArgs= jsonContent.args
  const createdAt= message.createdAt

  if (toolName === 'registrarParticipante') return registrarParticipante(toolArgs.phone, toolArgs.name, createdAt)
  if (toolName === 'registrarGasto') return registrarGasto(toolArgs.amount, toolArgs.description, createdAt)
  return (
    <div key={message.id} className="flex justify-start">
      <div className={`max-w-[70%] min-w-[300px] rounded-lg p-3 bg-white dark:bg-zinc-800`}>
        {/* Nombre del remitente */}
        <div className={`text-xs font-bold text-blue-600 dark:text-blue-400`}>
          {toolName}
        </div>

        {/* Contenido del mensaje */}
        <CodeBlock code={JSON.stringify(toolArgs, null, 2)} showLineNumbers={false} />

        {/* Hora del mensaje (simulada) */}
        <div className="text-xs text-right mt-1 text-zinc-500">
          {createdAt ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  )
}

function registrarParticipante(phone: string, name: string, date: Date | undefined) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] min-w-[300px] rounded-lg p-4 bg-white dark:bg-zinc-800 border-l-4 border-blue-500">
        {/* Encabezado con icono */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
            Nuevo Participante Registrado
          </div>
        </div>
        
        {/* Tarjeta de contacto */}
        <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-3 mb-2">
          {/* Nombre con icono */}
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <div className="text-sm font-medium text-muted-foreground">
              {name}
            </div>
          </div>
          
          {/* Teléfono con icono */}
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <div className="text-sm font-medium text-muted-foreground">
              {phone}
            </div>
          </div>
        </div>
        
        {/* Hora del mensaje con icono */}
        <div className="flex justify-end items-center gap-1 text-xs text-muted-foreground">
          {date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  );
}

function registrarGasto(amount: number, description: string, date: Date | undefined) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] min-w-[300px] rounded-lg p-4 bg-white dark:bg-zinc-800 border-l-4 border-amber-500">
        {/* Encabezado con icono */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
            <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
            Nuevo Gasto Registrado
          </div>
        </div>
        
        {/* Tarjeta de gasto */}
        <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-3 mb-2">
          {/* Monto con icono */}
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4" />
            <div className="text-sm font-medium text-muted-foreground">
              ${amount.toFixed(2)}
            </div>
          </div>
          
          {/* Descripción con icono */}
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <div className="text-sm font-medium text-muted-foreground">
              {description}
            </div>
          </div>
        </div>
        
        {/* Hora del mensaje */}
        <div className="flex justify-end items-center gap-1 text-xs text-muted-foreground">
          {date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  );
}

