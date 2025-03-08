'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Loader, Send, SendIcon } from 'lucide-react';
import Textarea from "react-textarea-autosize";
import { cn } from '@/lib/utils';

// Mock de usuarios para simular un chat grupal
const mockUsers = [
  { id: 1, name: 'Agustín (Shock)', avatar: '👨‍💻' },
  { id: 2, name: 'Joaco', avatar: '👨‍🚀' },
  { id: 3, name: 'IA Asistente', avatar: '🤖' }
];

export default function Chat() {
  const { messages, input, setInput, status, handleInputChange, handleSubmit } = useChat();
  const [hasText, setHasText] = useState(false);
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

  // Función para manejar cambios en el input y actualizar el estado del botón
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    setHasText(e.target.value.trim().length > 0);
  };

  // Scroll al último mensaje cuando se añade uno nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden mt-2">
      <div className="bg-emerald-600 dark:bg-emerald-800 p-3 text-white flex items-center">
        <div className="font-semibold">SHOCK IA - Chat Grupal</div>
      </div>

      <div style={{ backgroundImage: 'url("/chat-bg.png")', backgroundSize: 'contain' }} className="flex flex-col w-full h-full justify-between overflow-auto">
        <div className="flex flex-col w-full mx-auto justify-between h-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-3xl sm:px-0">
          {/* Header del chat */}

          {/* Contenedor de mensajes */}
          <div className="flex-1 p-4 space-y-3">
            {chatMessages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={cn("flex", isUser ? 'justify-end' : 'justify-start')}>
                  <div className={`max-w-[70%] min-w-[300px] rounded-lg p-3 ${isUser ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-white dark:bg-zinc-800'}`}>
                    {/* Nombre del remitente */}
                    <div className={`text-xs font-bold ${isUser ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {m.user.name}
                    </div>
                    
                    {/* Contenido del mensaje */}
                    <div className="whitespace-pre-wrap text-sm mt-1 text-zinc-800 dark:text-zinc-200">
                      {m.content}
                    </div>
                    
                    {/* Hora del mensaje (simulada) */}
                    <div className="text-xs text-right mt-1 text-zinc-500">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
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