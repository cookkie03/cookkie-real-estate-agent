"use client";

import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LLMSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function LLMSearchBar({
  onSearch,
  placeholder = "Cerca con AI: 'appartamenti con terrazzo in Brera sotto 500k'...",
  className,
}: LLMSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      setIsSearching(true);
      onSearch?.(query);
      // Simulate search delay
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={cn(
        "w-full flex items-center gap-2 px-4 py-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors",
        className
      )}
    >
      <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
      <Button
        size="sm"
        onClick={handleSearch}
        disabled={!query.trim() || isSearching}
        className="gap-2"
      >
        {isSearching ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Ricerca...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Cerca
          </>
        )}
      </Button>
    </div>
  );
}
