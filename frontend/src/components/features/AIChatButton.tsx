"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "./AIChat";

/**
 * CRM IMMOBILIARE - AI Chat Floating Button
 *
 * Floating action button that triggers the AI chat interface.
 * Shows unread indicator and provides quick access to chatbot.
 *
 * @module features/AIChatButton
 * @since v3.1.1
 */

export function AIChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setOpen(!open)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        aria-label="Apri chat AI"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            {/* Optional: Badge for notifications */}
            {/* <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge> */}
          </div>
        )}
      </Button>

      {/* Chat Sheet */}
      <AIChat open={open} onOpenChange={setOpen} />
    </>
  );
}
