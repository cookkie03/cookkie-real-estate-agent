"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Building,
  Save,
  Edit,
  Plus,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Chrome,
  MessageCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Connector {
  id: string;
  name: string;
  type:
    | "gmail"
    | "calendar"
    | "whatsapp"
    | "studio"
    | "portale"
    | "idealista";
  status: "connected" | "pending" | "error" | "idle";
  icon: React.ComponentType<{ className?: string }>;
  lastSync?: string;
  description: string;
  email?: string;
}

const mockConnectors: Connector[] = [
  {
    id: "1",
    name: "Gmail",
    type: "gmail",
    status: "connected",
    icon: Mail,
    lastSync: "12 minuti fa",
    description: "Sincronizzazione email e contatti",
    email: "user@gmail.com",
  },
  {
    id: "2",
    name: "Google Calendar",
    type: "calendar",
    status: "connected",
    icon: Calendar,
    lastSync: "5 minuti fa",
    description: "Sincronizzazione appuntamenti",
  },
  {
    id: "3",
    name: "WhatsApp",
    type: "whatsapp",
    status: "pending",
    icon: MessageCircle,
    description: "Integrazione messaggi WhatsApp",
  },
  {
    id: "4",
    name: "Google Studio API",
    type: "studio",
    status: "error",
    icon: Chrome,
    description: "API per scraping e dati",
  },
  {
    id: "5",
    name: "PortaleX",
    type: "portale",
    status: "idle",
    icon: FileText,
    description: "Sincronizzazione annunci immobiliari",
  },
  {
    id: "6",
    name: "Idealista",
    type: "idealista",
    status: "idle",
    icon: FileText,
    description: "Scraping annunci da Idealista",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "connected":
      return "bg-success-bg text-success border-success/20";
    case "pending":
      return "bg-warning-bg text-warning border-warning/20";
    case "error":
      return "bg-priority-high-bg text-priority-high border-priority-high/20";
    case "idle":
      return "bg-muted/30 text-muted-foreground border-border";
    default:
      return "bg-muted/30 text-muted-foreground border-border";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "connected":
      return "Connesso";
    case "pending":
      return "In attesa";
    case "error":
      return "Errore";
    case "idle":
      return "Inattivo";
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "connected":
      return <Check className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "error":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function SettingsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Marco",
    lastName: "Rossi",
    email: "marco.rossi@realestate.it",
    phone: "+39 345 123 4567",
    company: "RealEstate Pro Milano",
    role: "Agente Immobiliare Senior",
  });

  const handleProfileSave = () => {
    setEditingProfile(false);
    // In future: save to backend
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex lg:ml-20">
        <Toolbar />

        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
            {/* Header */}
            <section>
              <h1 className="text-3xl font-bold">Impostazioni</h1>
              <p className="text-muted-foreground mt-1">
                Gestisci il tuo profilo e i connettori
              </p>
            </section>

            {/* Profile Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Profilo Utente
              </h2>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle>Informazioni Personali</CardTitle>
                  <Button
                    variant={editingProfile ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      editingProfile
                        ? handleProfileSave()
                        : setEditingProfile(true)
                    }
                    className="gap-2"
                  >
                    {editingProfile ? (
                      <>
                        <Save className="h-4 w-4" />
                        Salva
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        Modifica
                      </>
                    )}
                  </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary">
                        {profile.firstName[0]}
                        {profile.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.role}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            firstName: e.target.value,
                          })
                        }
                        disabled={!editingProfile}
                        className="w-full px-3 py-2 rounded-lg border bg-card disabled:opacity-50 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cognome</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            lastName: e.target.value,
                          })
                        }
                        disabled={!editingProfile}
                        className="w-full px-3 py-2 rounded-lg border bg-card disabled:opacity-50 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            email: e.target.value,
                          })
                        }
                        disabled={!editingProfile}
                        className="w-full px-3 py-2 rounded-lg border bg-card disabled:opacity-50 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefono</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            phone: e.target.value,
                          })
                        }
                        disabled={!editingProfile}
                        className="w-full px-3 py-2 rounded-lg border bg-card disabled:opacity-50 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Agenzia</label>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            company: e.target.value,
                          })
                        }
                        disabled={!editingProfile}
                        className="w-full px-3 py-2 rounded-lg border bg-card disabled:opacity-50 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ruolo</label>
                      <input
                        type="text"
                        value={profile.role}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            role: e.target.value,
                          })
                        }
                        disabled={!editingProfile}
                        className="w-full px-3 py-2 rounded-lg border bg-card disabled:opacity-50 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Connectors Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Chrome className="h-5 w-5 text-primary" />
                  Connettori Integrati
                </h2>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Aggiungi Connettore
                </Button>
              </div>

              <div className="grid gap-4">
                {mockConnectors.map((connector) => {
                  const Icon = connector.icon;
                  return (
                    <Card key={connector.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4 lg:items-center lg:gap-6">
                          {/* Icon */}
                          <div className="hidden lg:flex p-3 rounded-lg bg-muted/30 flex-shrink-0">
                            <Icon className="h-6 w-6 text-muted-foreground" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{connector.name}</h3>
                              <Badge
                                variant="outline"
                                className={getStatusColor(connector.status)}
                              >
                                <span className="inline mr-1">
                                  {getStatusIcon(connector.status)}
                                </span>
                                {getStatusLabel(connector.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {connector.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {connector.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {connector.email}
                                </div>
                              )}
                              {connector.lastSync && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Ultima sincronizzazione: {connector.lastSync}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            {connector.status === "connected" && (
                              <Button variant="outline" size="sm">
                                Sincronizza
                              </Button>
                            )}
                            {connector.status === "error" && (
                              <Button variant="outline" size="sm">
                                Ricollega
                              </Button>
                            )}
                            {connector.status === "idle" && (
                              <Button variant="outline" size="sm">
                                Connetti
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Info Section */}
            <section className="bg-info-bg border border-info/20 rounded-lg p-4 text-sm text-info">
              <p>
                I connettori vengono sincronizzati automaticamente ogni 15 minuti.
                Puoi forzare la sincronizzazione manualmente in qualsiasi momento.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
