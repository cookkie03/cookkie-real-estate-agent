"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Send, Bot, User, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/**
 * CRM IMMOBILIARE - AI Chat Component
 *
 * Intelligent chatbot interface with:
 * - Conversational AI with 11 tools (database access, scoring, analytics)
 * - Context-aware suggested queries
 * - Real-time message streaming
 * - Loading states and error handling
 * - Mobile-responsive sheet design
 *
 * @module features/AIChat
 * @since v3.1.1
 */

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface AIChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChat({ open, onOpenChange }: AIChatProps) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch suggested queries when pathname changes
  useEffect(() => {
    if (open) {
      fetchSuggestedQueries();
    }
  }, [pathname, open]);

  const fetchSuggestedQueries = async () => {
    try {
      const response = await fetch(
        `/api/ai/suggested-queries?current_page=${encodeURIComponent(pathname)}`
      );
      const data = await response.json();

      if (data.success && data.queries) {
        setSuggestedQueries(data.queries);
      }
    } catch (error) {
      console.error("Error fetching suggested queries:", error);
      // Fallback queries
      setSuggestedQueries([
        "Come sta andando il mio portfolio?",
        "Mostrami le opportunità più promettenti",
        "Quali azioni urgenti ho in scadenza?"
      ]);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build context
      const context = {
        current_page: pathname,
      };

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      if (data.success && data.content) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Refresh suggested queries after interaction
        fetchSuggestedQueries();
      } else {
        throw new Error(data.error || "No response from AI");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Mi dispiace, si è verificato un errore. Riprova tra poco.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestedQuery = (query: string) => {
    sendMessage(query);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg">Assistente AI</SheetTitle>
                <p className="text-xs text-muted-foreground">
                  Gemini 2.0 Flash • 11 tools
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Ciao! Come posso aiutarti?
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Posso cercare immobili, analizzare richieste, calcolare match,
                fornire statistiche e molto altro.
              </p>

              {/* Suggested Queries */}
              {suggestedQueries.length > 0 && (
                <div className="w-full space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Prova a chiedermi:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedQueries.slice(0, 3).map((query, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1.5"
                        onClick={() => handleSuggestedQuery(query)}
                      >
                        {query}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback
                  className={
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Message Bubble */}
              <div
                className={`flex-1 ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <Card
                  className={`inline-block max-w-[85%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="px-4 py-2.5">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </Card>
                {message.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-muted">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="inline-block bg-muted">
                <div className="px-4 py-2.5 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Sto pensando...
                  </span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t px-6 py-4">
          {/* Show suggested queries if no messages yet */}
          {messages.length > 0 && suggestedQueries.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedQueries.slice(0, 2).map((query, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                  onClick={() => handleSuggestedQuery(query)}
                >
                  {query.length > 40 ? query.slice(0, 40) + "..." : query}
                </Badge>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi un messaggio..."
              disabled={isLoading}
              className="flex-1"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Gemini può commettere errori. Verifica informazioni importanti.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
