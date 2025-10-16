"use client";

import { useEffect, useRef } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AISearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export function AISearchBar({ 
  value,
  onChange,
  onSubmit,
  placeholder = "Cerca con l'AI...",
  isLoading = false,
  autoFocus = false 
}: AISearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <form onSubmit={onSubmit} className="relative group">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isLoading}
          className="pl-12 pr-36 h-16 text-base bg-card border-2 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-md group-focus-within:shadow-glow"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 gap-2 h-12"
          size="default"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Cerca AI
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
