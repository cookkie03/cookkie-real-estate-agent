"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Loader2, Bot, User, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'processing' | 'complete' | 'error';
  results?: any;
  highlights?: string[];
  suggestions?: string[];
}

interface TaskUpdate {
  task_number: number;
  task: string;
  success: boolean;
  count: number;
}

export default function AIAssistantPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  const hasInitialized = useRef(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<TaskUpdate[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, taskUpdates]);

  // Initialize WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000/ai/orchestrator/chat/stream');

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, []);

  // Handle initial query from URL parameter
  useEffect(() => {
    if (initialQuery && ws && !hasInitialized.current) {
      hasInitialized.current = true;
      // Wait a bit for WebSocket to be fully ready
      setTimeout(() => {
        sendMessage(initialQuery);
      }, 500);
    }
  }, [initialQuery, ws]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'status':
        // Update last assistant message with status
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.type === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: data.message, status: 'processing' }
            ];
          }
          return prev;
        });
        break;

      case 'task_complete':
        setTaskUpdates(prev => [...prev, data as TaskUpdate]);
        break;

      case 'result':
        // Final result received
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.type === 'assistant') {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                content: data.data.summary,
                status: 'complete',
                results: data.data.detailed_results,
                highlights: data.data.highlights,
                suggestions: data.data.suggestions
              }
            ];
          }
          return prev;
        });
        setIsProcessing(false);
        setTaskUpdates([]);
        break;

      case 'error':
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'system',
            content: `Errore: ${data.message}`,
            timestamp: new Date(),
            status: 'error'
          }
        ]);
        setIsProcessing(false);
        setTaskUpdates([]);
        break;
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date(),
      status: 'complete'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Add placeholder for assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'Sto elaborando la tua richiesta...',
      timestamp: new Date(),
      status: 'processing'
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Send via WebSocket if connected
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        prompt: userMessage.content,
        context: {}
      }));
    } else {
      // Fallback to REST API
      try {
        const response = await fetch('http://localhost:8000/ai/orchestrator/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage.content,
            context: {}
          })
        });

        const data = await response.json();

        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.type === 'assistant') {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                content: data.summary,
                status: 'complete',
                results: data.detailed_results,
                highlights: data.highlights,
                suggestions: data.suggestions
              }
            ];
          }
          return prev;
        });
        setIsProcessing(false);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'system',
            content: 'Errore di connessione al server',
            timestamp: new Date(),
            status: 'error'
          }
        ]);
        setIsProcessing(false);
      }
    }
  };

  const quickPrompts = [
    "Trova appartamenti a Milano sotto 300k€",
    "Cerca ville con piscina vicino a Roma",
    "Mostrami nuovi annunci di oggi",
    "Appartamenti in vendita zona Porta Romana",
    "Case con giardino fino a 400k€"
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Assistant</h1>
            <p className="text-sm text-gray-500">
              Chiedi qualsiasi cosa sui tuoi immobili
            </p>
          </div>
          {ws && ws.readyState === WebSocket.OPEN && (
            <Badge variant="outline" className="ml-auto">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
              Connesso
            </Badge>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Come posso aiutarti?</h2>
            <p className="mb-6 text-gray-500">
              Fai una domanda o seleziona un suggerimento qui sotto
            </p>

            {/* Quick Prompts */}
            <div className="grid w-full max-w-2xl grid-cols-1 gap-2 md:grid-cols-2">
              {quickPrompts.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start text-left"
                  onClick={() => setInput(prompt)}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Task Updates */}
            {taskUpdates.length > 0 && (
              <Card className="border-purple-200 bg-purple-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-700">
                  <Clock className="h-4 w-4" />
                  Esecuzione in corso...
                </div>
                <div className="space-y-2">
                  {taskUpdates.map((update, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>
                        {update.task}: trovati {update.count} risultati
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Scrivi la tua richiesta..."
            disabled={isProcessing}
            className="flex-1"
          />

          <Button
            onClick={sendMessage}
            disabled={isProcessing || !input.trim()}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser
              ? 'bg-blue-500'
              : isSystem
              ? 'bg-gray-400'
              : 'bg-gradient-to-br from-purple-500 to-blue-500'
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <Card className={`p-4 ${isUser ? 'bg-blue-50' : isSystem ? 'bg-gray-50' : ''}`}>
          <div className="prose prose-sm max-w-none">
            {message.content}
          </div>

          {/* Status */}
          {message.status === 'processing' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Elaborazione...
            </div>
          )}

          {/* Highlights */}
          {message.highlights && message.highlights.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold text-gray-700">
                Punti salienti:
              </div>
              {message.highlights.map((highlight, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold text-gray-700">
                Suggerimenti:
              </div>
              <div className="space-y-1">
                {message.suggestions.map((suggestion, i) => (
                  <Badge key={i} variant="secondary" className="mr-1">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          {message.results && message.results.length > 0 && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="text-sm font-medium text-green-700">
                ✓ Trovati {message.results.reduce((acc: number, r: any) => acc + (r.result?.count || 0), 0)} risultati
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-2 text-xs text-gray-400">
            {message.timestamp.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
