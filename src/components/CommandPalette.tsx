import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, Users, MapPin, Calendar, Zap, Settings, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commands = [
  { id: "search", label: "Cerca globale", icon: Search, path: "/search", hotkey: "S" },
  { id: "agenda", label: "Agenda", icon: Calendar, path: "/agenda", hotkey: "G" },
  { id: "actions", label: "Azioni suggerite", icon: Zap, path: "/actions", hotkey: "A" },
  { id: "map", label: "Mappa", icon: MapPin, path: "/map", hotkey: "M" },
  { id: "clients", label: "Clienti", icon: Users, path: "/clients" },
  { id: "properties", label: "Immobili", icon: FileText, path: "/properties" },
  { id: "connectors", label: "Connettori", icon: Settings, path: "/connectors", hotkey: "C" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <Command>
          <CommandInput 
            placeholder="Cerca azioni, pagine..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nessun risultato trovato.</CommandEmpty>
            <CommandGroup heading="Navigazione">
              {commands.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleSelect(cmd.path)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <cmd.icon className="h-4 w-4" />
                  <span className="flex-1">{cmd.label}</span>
                  {cmd.hotkey && (
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {cmd.hotkey}
                    </kbd>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
