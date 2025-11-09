"use client";

import { Building2, Users, Search, Target, Activity, TrendingUp, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Dashboard Page
 * Main landing page with AI search, stats, quick actions, and recent activities
 */
export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Handle AI search submission
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/ai-assistant?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Fetch dashboard stats from API
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
  });

  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      try {
        const response = await api.activities.list({ page: 1, pageSize: 5 });
        return response.data;
      } catch {
        return [];
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="text-muted-foreground">
          Panoramica completa del tuo CRM immobiliare
        </p>
      </div>

      {/* AI Search Box */}
      <div className="stat-card bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Assistente AI</h3>
            <p className="text-sm text-muted-foreground">
              Chiedi qualsiasi cosa sul tuo portfolio immobiliare
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder='Es: "Mostrami immobili sotto 300k a Milano" o "Quali clienti cercano appartamenti?"'
            className="pl-10 pr-24 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <Button
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => {
              if (searchQuery.trim()) {
                router.push(`/ai-assistant?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          >
            Chiedi
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Immobili"
          value={stats?.properties.total || 0}
          subtitle={`${stats?.properties.available || 0} disponibili`}
          icon={Building2}
          iconColor="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-950"
          isLoading={isLoading}
        />

        <StatCard
          title="Clienti"
          value={stats?.contacts.total || 0}
          subtitle={`${stats?.contacts.leads || 0} lead attivi`}
          icon={Users}
          iconColor="text-green-600"
          bgColor="bg-green-50 dark:bg-green-950"
          isLoading={isLoading}
        />

        <StatCard
          title="Richieste"
          value={stats?.requests.total || 0}
          subtitle={`${stats?.requests.active || 0} in corso`}
          icon={Search}
          iconColor="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-950"
          isLoading={isLoading}
        />

        <StatCard
          title="Match"
          value={stats?.matches.total || 0}
          subtitle={`${stats?.matches.pending || 0} da contattare`}
          icon={Target}
          iconColor="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-950"
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="stat-card">
        <h2 className="section-header">Azioni Rapide</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/immobili"
            title="Nuovo Immobile"
            description="Aggiungi proprietà"
            icon={Building2}
          />
          <QuickAction
            href="/clienti"
            title="Nuovo Cliente"
            description="Aggiungi contatto"
            icon={Users}
          />
          <QuickAction
            href="/richieste"
            title="Nuova Richiesta"
            description="Registra richiesta"
            icon={Search}
          />
          <QuickAction
            href="/matching"
            title="Richieste & Matching"
            description="Abbinamenti AI"
            icon={Target}
          />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="stat-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-header mb-0">Attività Recenti</h2>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>

        {!recentActivities || recentActivities.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Activity className="mx-auto mb-2 h-12 w-12 opacity-20" />
            <p>Nessuna attività recente</p>
            <p className="text-sm">Le tue attività appariranno qui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className={`rounded-full p-2 ${getActivityColor(activity.type)}`}>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{activity.title}</p>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(activity.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
  isLoading,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  isLoading?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 skeleton" />
          ) : (
            <h3 className="text-3xl font-bold">{value}</h3>
          )}
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`rounded-lg p-3 ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

/**
 * Quick Action Button
 */
function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: any;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg border p-4 transition-all hover:bg-accent hover:shadow-md"
    >
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}

/**
 * Get activity type color
 */
function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    call: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    email: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    meeting: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    viewing: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    note: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
  };
  return colors[type] || colors.note;
}
