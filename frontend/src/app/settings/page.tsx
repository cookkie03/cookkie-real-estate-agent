"use client";

import { Save, Key, User, Building, Shield, TestTube } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";

/**
 * Settings Page
 * CRITICAL: User configuration including API keys
 */
export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("api-keys");

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
        return await api.settings.get();
      } catch {
        return { data: null };
      }
    },
  });

  const settings = data?.data;

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      alert("Impostazioni salvate con successo!");
    },
    onError: (error: any) => {
      alert(`Errore: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    googleApiKey: "",
    fullName: "",
    email: "",
    phone: "",
    agencyName: "",
    agencyVat: "",
    agencyAddress: "",
    commissionPercentage: 0,
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const testGoogleApi = async () => {
    try {
      const response = await api.health.check();
      alert("Connessione database OK! L'API Google sarà testata quando implementata.");
    } catch (error: any) {
      alert(`Errore: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="h-96 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header">Impostazioni</h1>
        <p className="text-muted-foreground">
          Configura il tuo CRM e le API esterne
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <TabButton
          active={activeTab === "api-keys"}
          onClick={() => setActiveTab("api-keys")}
          icon={Key}
          label="API Keys"
        />
        <TabButton
          active={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
          icon={User}
          label="Profilo"
        />
        <TabButton
          active={activeTab === "agency"}
          onClick={() => setActiveTab("agency")}
          icon={Building}
          label="Agenzia"
        />
        <TabButton
          active={activeTab === "system"}
          onClick={() => setActiveTab("system")}
          icon={Shield}
          label="Sistema"
        />
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* API KEYS TAB */}
        {activeTab === "api-keys" && (
          <>
            <div className="stat-card">
              <h2 className="section-header">Google AI API</h2>
              <p className="text-sm text-muted-foreground mb-4">
                ⚠️ <strong>Richiesta</strong> per tutte le funzionalità AI (RAG Assistant, Matching, Briefing, Ricerca Semantica).
                Ottieni la tua chiave da{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
                {" "}(gratuita con limiti generosi).
              </p>

              <div className="space-y-4">
                <div>
                  <label className="form-label mb-2 block">
                    Google API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIza..."
                    value={formData.googleApiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, googleApiKey: e.target.value })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {settings?.googleApiKey && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ✓ Chiave configurata: ***{settings.googleApiKey.slice(-8)}
                    </p>
                  )}
                </div>

                <button
                  onClick={testGoogleApi}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent"
                >
                  <TestTube className="h-4 w-4" />
                  Testa Connessione
                </button>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "Salvataggio..." : "Salva API Keys"}
            </button>
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <>
            <div className="stat-card">
              <h2 className="section-header">Informazioni Personali</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label mb-2 block">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Mario Rossi"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="form-label mb-2 block">Email</label>
                  <input
                    type="email"
                    placeholder="mario@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="form-label mb-2 block">Telefono</label>
                  <input
                    type="tel"
                    placeholder="+39 123 456 7890"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              Salva Profilo
            </button>
          </>
        )}

        {/* AGENCY TAB */}
        {activeTab === "agency" && (
          <>
            <div className="stat-card">
              <h2 className="section-header">Informazioni Agenzia</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label mb-2 block">Nome Agenzia</label>
                  <input
                    type="text"
                    placeholder="Agenzia Immobiliare XYZ"
                    value={formData.agencyName}
                    onChange={(e) =>
                      setFormData({ ...formData, agencyName: e.target.value })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="form-label mb-2 block">Partita IVA</label>
                  <input
                    type="text"
                    placeholder="IT12345678901"
                    value={formData.agencyVat}
                    onChange={(e) =>
                      setFormData({ ...formData, agencyVat: e.target.value })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label mb-2 block">Indirizzo</label>
                  <input
                    type="text"
                    placeholder="Via Roma 1, Milano"
                    value={formData.agencyAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, agencyAddress: e.target.value })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="form-label mb-2 block">
                    Percentuale Provvigione (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="3.0"
                    value={formData.commissionPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionPercentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              Salva Info Agenzia
            </button>
          </>
        )}

        {/* SYSTEM TAB */}
        {activeTab === "system" && (
          <div className="stat-card">
            <h2 className="section-header">Informazioni Sistema</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Versione CRM:</span>
                <span className="font-medium">3.0.0</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Database:</span>
                <span className="font-medium">PostgreSQL</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Ambiente:</span>
                <span className="font-medium">
                  {process.env.NODE_ENV || "development"}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Backend URL:</span>
                <span className="font-medium text-xs">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
