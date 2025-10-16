"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AISearchBar } from "@/components/layouts/AISearchBar";
import { ChatDisplay } from "@/components/features/chat/ChatDisplay";
import { Message } from "@/types";

export default function SearchPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Using DataPizza AI RAG system through Python backend
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.content };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage: Message = { role: 'assistant', content: 'Spiacente, si è verificato un errore.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Indietro
          </Button>
          <h1 className="text-xl font-bold">Ricerca AI</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col container max-w-4xl mx-auto py-8">
        <div className="flex-1">
          <ChatDisplay messages={messages} isLoading={isLoading} />
        </div>
        <div className="mt-4">
          <AISearchBar 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            autoFocus={true}
            placeholder="Invia un messaggio all'AI..."
          />
        </div>
      </main>
    </div>
  );
}