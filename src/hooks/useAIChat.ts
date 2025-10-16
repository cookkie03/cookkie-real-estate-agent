/**
 * React Query Hook for AI Chat (RAG Assistant)
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import type { Message } from '@/types';

interface ChatResponse {
  content: string;
  role: string;
  metadata?: {
    model: string;
    tools_used: boolean;
  };
}

interface ChatMutationVariables {
  messages: Message[];
}

export function useAIChat() {
  return useMutation<ChatResponse, Error, ChatMutationVariables>({
    mutationFn: async ({ messages }) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella chat AI');
      }

      return response.json();
    },
  });
}

export function useAIChatStatus() {
  return useQuery({
    queryKey: ['ai-chat-status'],
    queryFn: async () => {
      const response = await fetch('/api/ai/chat');
      if (!response.ok) {
        throw new Error('Backend AI non disponibile');
      }
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });
}
