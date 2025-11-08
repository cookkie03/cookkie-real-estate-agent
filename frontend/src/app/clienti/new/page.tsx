"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

/**
 * CRM IMMOBILIARE - New Client Form
 *
 * Simple client creation form with essential contact fields
 *
 * @module pages/clienti/new
 * @since v3.1.1
 */

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Basic Info
    entityType: "person",
    fullName: "",
    firstName: "",
    lastName: "",

    // Contact
    primaryPhone: "",
    primaryEmail: "",

    // Address
    city: "",
    province: "",

    // Profiling
    importance: "normal",
    status: "active",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await api.contacts.create(formData);
    },
    onSuccess: (response) => {
      router.push(`/clienti/${response.contact.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  // Auto-update fullName when firstName or lastName change
  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    const newData = { ...formData, [field]: value };
    if (field === 'firstName' || field === 'lastName') {
      newData.fullName = `${field === 'firstName' ? value : formData.firstName} ${field === 'lastName' ? value : formData.lastName}`.trim();
    }
    setFormData(newData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/clienti")}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai clienti
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nuovo Cliente</h1>
        <p className="text-muted-foreground mt-1">
          Compila i campi essenziali per aggiungere un cliente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Personali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={(e) => handleNameChange('firstName', e.target.value)}
                  placeholder="Mario"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cognome *</label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={(e) => handleNameChange('lastName', e.target.value)}
                  placeholder="Rossi"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contatti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefono *</label>
                <Input
                  required
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                  placeholder="+39 333 1234567"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                  placeholder="mario.rossi@email.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Località</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Città</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Milano"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Provincia</label>
              <Input
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                placeholder="MI"
                maxLength={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Classificazione</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Importanza</label>
              <Select
                value={formData.importance}
                onValueChange={(value) => setFormData({ ...formData, importance: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bassa</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Alta (VIP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stato</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="inactive">Inattivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/clienti")}
            disabled={createMutation.isPending}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending ? "Salvataggio..." : "Salva Cliente"}
          </Button>
        </div>

        {createMutation.isError && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            Errore durante il salvataggio. Riprova.
          </div>
        )}
      </form>
    </div>
  );
}
