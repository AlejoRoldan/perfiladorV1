import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, NecesidadDetectadaEvent, ScoreCompetenciaEvent } from '../types';
import { sendChatMessage } from '../services/api';

interface ChatPageProps {
  scoreEvent: ScoreCompetenciaEvent;
  necesidadEvent: NecesidadDetectadaEvent | null;
}

export function ChatPage({ scoreEvent, necesidadEvent }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Generar el saludo inicial del agente al montar el componente
  useEffect(() => {
    const initAgent = async () => {
      try {
        const { reply } = await sendChatMessage({
          executionId: scoreEvent.execution_id,
          userId: scoreEvent.user_id,
          roleId: scoreEvent.role_id,
          necesidades: necesidadEvent?.necesidades ?? [],
          history: [],
          userMessage: '__INIT__', // Señal especial para el saludo inicial
        });
        setMessages([{ role: 'assistant', content: reply }]);
      } catch {
        setMessages([{ role: 'assistant', content: '¡Hola! Estoy aquí para ayudarte a desarrollar tus competencias. ¿Por dónde te gustaría empezar?' }]);
      } finally {
        setIsInitializing(false);
      }
    };
    initAgent();
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const { reply } = await sendChatMessage({
        executionId: scoreEvent.execution_id,
        userId: scoreEvent.user_id,
        roleId: scoreEvent.role_id,
        necesidades: necesidadEvent?.necesidades ?? [],
        history: messages,
        userMessage: text,
      });
      setMessages([...updatedHistory, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...updatedHistory, { role: 'assistant', content: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-2xl flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 3rem)' }}>

        {/* Header del chat */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Mentor Digital · Grupo Vázquez</p>
            <p className="text-xs text-green-500 font-medium">● En línea</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isInitializing ? (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading || isInitializing}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition disabled:bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isInitializing || !input.trim()}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 text-white px-4 py-2.5 rounded-xl transition text-sm font-medium"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
