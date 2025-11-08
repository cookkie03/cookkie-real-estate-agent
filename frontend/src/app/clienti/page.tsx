"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Filter, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientCard } from "@/components/features/ClientCard";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Clients List Page
 *
 * Professional contact management with:
 * - Search bar (debounced)
 * - Quick filters (All, Active, Leads)
 * - Client cards with avatars
 * - FAB for new client
 *
 * @module pages/clienti
 * @since v3.1.1
 */

type QuickFilter = "all" | "active" | "lead";

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  // Fetch contacts
  const { data, isLoading } = useQuery({
    queryKey: ["contacts", quickFilter],
    queryFn: async () => {
      try {
        const filters: any = { page: 1, pageSize: 50 };
        if (quickFilter === "active") {
          filters.status = "active";
        } else if (quickFilter === "lead") {
          filters.source = "lead";
        }
        return await api.contacts.list(filters);
      } catch {
        return { contacts: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
      }
    },
  });

  const contacts = data?.contacts || [];

  // Filter contacts by search query (client-side)
  const filteredContacts = searchQuery
    ? contacts.filter((c: any) =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clienti</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci i tuoi contatti e lead
        </p>
      </div>

      {/* Search & Filters - Sticky */}
      <div className="sticky top-16 z-10 space-y-3 pb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, email, telefono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Quick Filters Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickFilter("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              quickFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Tutti
          </button>
          <button
            onClick={() => setQuickFilter("active")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              quickFilter === "active"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Attivi
          </button>
          <button
            onClick={() => setQuickFilter("lead")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              quickFilter === "lead"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Lead
          </button>

          {/* Advanced Filters Button */}
          <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-accent">
            <Filter className="h-4 w-4" />
            Filtri avanzati
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredContacts.length} {filteredContacts.length === 1 ? "contatto trovato" : "contatti trovati"}
        </div>
      </div>

      {/* Contacts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[100px] rounded-lg skeleton" />
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="py-16 text-center rounded-lg border-2 border-dashed">
          <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
          <h3 className="mb-2 text-lg font-semibold">
            {searchQuery || quickFilter !== "all"
              ? "Nessun contatto trovato"
              : "Nessun cliente in rubrica"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || quickFilter !== "all"
              ? "Prova a modificare i filtri di ricerca"
              : "Inizia aggiungendo il tuo primo cliente"}
          </p>
          <Button size="lg" asChild>
            <Link href="/clienti/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Cliente
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact: any) => (
            <ClientCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl p-0"
        aria-label="Nuovo cliente"
        asChild
      >
        <Link href="/clienti/new">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
