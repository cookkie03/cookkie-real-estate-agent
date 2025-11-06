"use client";

import { Users, Plus, Filter, Mail, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CONTACT_TYPE_LABELS, CONTACT_STATUS_LABELS, IMPORTANCE_LABELS } from "@/lib/constants";

/**
 * Clients List Page
 * Browse all contacts/clients
 */
export default function ClientsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      try {
        return await api.contacts.list({ page: 1, pageSize: 20 });
      } catch {
        return { data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
      }
    },
  });

  const contacts = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Clienti</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi contatti e lead
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuovo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="stat-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtri disponibili: tipo, stato, importanza, città</span>
        </div>
      </div>

      {/* Contacts List */}
      <div className="stat-card">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 skeleton" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <h3 className="mb-2 text-lg font-medium">Nessun cliente</h3>
            <p className="text-sm text-muted-foreground">
              Inizia aggiungendo il tuo primo cliente
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact: any) => (
              <a
                key={contact.id}
                href={`/clienti/${contact.id}`}
                className="data-table-row flex items-center gap-4 p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                  {contact.firstName[0]}{contact.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-sm font-medium">
                    {CONTACT_TYPE_LABELS[contact.type as keyof typeof CONTACT_TYPE_LABELS]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {CONTACT_STATUS_LABELS[contact.status as keyof typeof CONTACT_STATUS_LABELS]}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-accent">
            Precedente
          </button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Pagina {data.pagination.page} di {data.pagination.totalPages}
          </span>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-accent">
            Successiva
          </button>
        </div>
      )}
    </div>
  );
}
