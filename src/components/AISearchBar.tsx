import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AISearchBarProps {
  placeholder?: string;
}

export function AISearchBar({ placeholder = "Cerca: 'appartamenti con terrazzo in Brera sotto 500k'" }: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative group">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-32 h-14 text-base bg-card border-2 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all"
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
          size="sm"
        >
          <Sparkles className="h-4 w-4" />
          Cerca AI
        </Button>
      </div>
    </form>
  );
}
