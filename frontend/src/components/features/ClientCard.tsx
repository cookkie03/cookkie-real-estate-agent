"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * CRM IMMOBILIARE - Client Card Component
 *
 * Professional client card for list views with:
 * - Avatar with initials fallback
 * - Client info (name, phone, email)
 * - Type badges (buyer/seller/renter)
 * - Quick action buttons (Call/Email)
 *
 * @module features/ClientCard
 * @since v3.1.1
 */

interface ClientCardProps {
  contact: {
    id: string;
    code: string;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    primaryPhone?: string | null;
    primaryEmail?: string | null;
    entityType: string;
    importance: string;
    status: string;
  };
}

export function ClientCard({ contact }: ClientCardProps) {
  // Get initials for avatar
  const initials = contact.firstName && contact.lastName
    ? `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
    : contact.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/clienti/${contact.id}`}
      className="flex gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:bg-accent/50"
    >
      {/* Avatar */}
      <Avatar className="h-14 w-14 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name + Badges */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-base truncate">
            {contact.fullName}
          </h3>

          {/* Importance Badge */}
          {contact.importance === "high" && (
            <Badge variant="destructive" className="text-xs flex-shrink-0">
              VIP
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-1 text-sm text-muted-foreground">
          {contact.primaryPhone && (
            <p className="flex items-center gap-1.5 truncate">
              <Phone className="h-3 w-3 flex-shrink-0" />
              {contact.primaryPhone}
            </p>
          )}
          {contact.primaryEmail && (
            <p className="flex items-center gap-1.5 truncate">
              <Mail className="h-3 w-3 flex-shrink-0" />
              {contact.primaryEmail}
            </p>
          )}
          {!contact.primaryPhone && !contact.primaryEmail && (
            <p className="text-xs italic">Nessun contatto disponibile</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        {contact.primaryPhone && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `tel:${contact.primaryPhone}`;
            }}
            className="h-8 w-20"
          >
            <Phone className="h-3 w-3 mr-1" />
            Chiama
          </Button>
        )}
        {contact.primaryEmail && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `mailto:${contact.primaryEmail}`;
            }}
            className="h-8 w-20"
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        )}
      </div>
    </Link>
  );
}
