"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AISearchBarProps {
  placeholder?: string;
}

const placeholderSuggestions = [
  "Cerca: 'appartamenti con terrazzo in Brera sotto 500k'",
  "Cerca: 'villa con giardino zona Milano nord'",
  "Cerca: 'cliente Mario Rossi'",
  "Cerca: 'immobili in vendita con 3 camere'",
  "Cerca: 'appuntamenti questa settimana'",
];

export function AISearchBar({ placeholder }: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    placeholder || placeholderSuggestions[0]
  );
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const router = useRouter();

  // Rotate placeholder suggestions
  useEffect(() => {
    if (placeholder) return; // Don't rotate if custom placeholder is provided

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderSuggestions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [placeholder]);

  useEffect(() => {
    if (!placeholder) {
      setCurrentPlaceholder(placeholderSuggestions[placeholderIndex]);
    }
  }, [placeholderIndex, placeholder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative group">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={currentPlaceholder}
          className="pl-12 pr-36 h-16 text-base bg-card border-2 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-md group-focus-within:shadow-glow"
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 gap-2 h-12"
          size="default"
        >
          <Sparkles className="h-4 w-4" />
          Cerca AI
        </Button>
      </div>
    </form>
  );
}
