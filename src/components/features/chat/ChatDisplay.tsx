"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles } from 'lucide-react';
import { Message } from '@/types';

interface ChatDisplayProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatDisplay({ messages, isLoading }: ChatDisplayProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8">
                <AvatarFallback><Sparkles /></AvatarFallback>
              </Avatar>
            )}
            <div className={`rounded-lg p-3 max-w-md ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback><Sparkles /></AvatarFallback>
            </Avatar>
            <div className="rounded-lg p-3 max-w-md bg-muted">
              <p className="text-sm">...</p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
