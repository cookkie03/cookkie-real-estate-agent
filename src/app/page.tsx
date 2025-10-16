"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, HelpCircle, Command as CommandIcon, Phone, Calendar as CalendarIcon, Zap, Settings, Home, Users, Wrench, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/layouts/CommandPalette";
import { StatPill } from "@/components/features/dashboard/StatPill";
import { MiniAgenda } from "@/components/features/dashboard/MiniAgenda";
import { QuickDialer } from "@/components/features/dashboard/QuickDialer";
import { IntelToolkit } from "@/components/features/dashboard/IntelToolkit";
import { SuggestedActions } from "@/components/features/dashboard/SuggestedActions";
import { MapPreview } from "@/components/features/dashboard/MapPreview";
import { ConnectorsStatus } from "@/components/features/dashboard/ConnectorsStatus";
import { ActivityFeed } from "@/components/features/dashboard/ActivityFeed";
import { TrendingUp, Clock } from "lucide-react";
import {
  mockAgendaItems,
  mockContacts,
  mockAreaStats,
  mockBuildingInfo,
  mockSimilars,
  mockSuggestedActions,
  mockMapZones,
  mockConnectors,
  mockFeedEvents,
} from "@/lib/mockData";

export default function HomePage() {
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "s" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          router.push("/search");
        }
      }
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          router.push("/agenda");
        }
      }
      if (e.key === "a" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          router.push("/actions");
        }
      }
      if (e.key === "m" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          router.push("/map");
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  const actionLists = mockSuggestedActions.map((list) => ({
    ...list,
    icon: list.icon === "TrendingUp" ? TrendingUp : Clock,
  }));

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              RealEstate AI
            </h1>
            
            {/* Navigation Icons - Desktop (Left side) */}
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => router.push("/immobili")}
                title="Immobili"
              >
                <Home className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => router.push("/clienti")}
                title="Contatti"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => router.push("/tool")}
                title="Tool"
              >
                <Wrench className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => router.push("/settings")}
              title="Impostazioni"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex gap-2"
              title="Shortcut tastiera"
            >
              <CommandIcon className="h-4 w-4" />
              <span className="text-xs">⌘K</span>
            </Button>
            <Button variant="ghost" size="sm" title="Notifiche">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" title="Help">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        {/* Hero Search */}
        <section className="mb-8 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
              La tua <span className="bg-gradient-accent bg-clip-text text-transparent">AI</span> per il real estate
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Cerca clienti, immobili, vie e molto altro con l&apos;intelligenza artificiale
            </p>
            <div
              onClick={() => router.push('/search')}
              className="relative group cursor-pointer"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <div className="pl-12 pr-36 h-16 text-base bg-card border-2 rounded-md flex items-center text-muted-foreground shadow-md group-hover:shadow-glow transition-all">
                  Cerca: &apos;appartamenti con terrazzo in Brera...&apos;
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 h-12 px-4 rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                  Cerca AI
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Pills */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            Azioni Rapide
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatPill
              label="Immobili"
              value={120}
              icon={Home}
              variant="default"
              onClick={() => router.push("/immobili")}
            />
            <StatPill
              label="Clienti"
              value={45}
              icon={Users}
              variant="default"
              onClick={() => router.push("/clienti")}
            />
            <StatPill
              label="Chiamate urgenti"
              value={5}
              icon={Phone}
              variant="urgent"
              onClick={() => router.push("/actions?type=urgent")}
            />
            <StatPill
              label="Appuntamenti"
              value={3}
              icon={CalendarIcon}
              variant="success"
              onClick={() => router.push("/agenda")}
            />
            <StatPill
              label="Follow-up"
              value={4}
              icon={Zap}
              variant="warning"
              onClick={() => router.push("/actions?type=followup")}
            />
            <StatPill
              label="Lead nuovi"
              value={2}
              icon={TrendingUp}
              variant="default"
              onClick={() => router.push("/actions?type=new")}
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <MiniAgenda items={mockAgendaItems} />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <QuickDialer contacts={mockContacts} />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <ConnectorsStatus connectors={mockConnectors} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <IntelToolkit
                areaStats={mockAreaStats}
                buildingInfo={mockBuildingInfo}
                similars={mockSimilars}
              />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <SuggestedActions lists={actionLists} />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <MapPreview zones={mockMapZones} />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <ActivityFeed events={mockFeedEvents} />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-card/95 backdrop-blur">
          <div className="grid grid-cols-4 gap-1 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="flex-col h-auto py-2"
            >
              <Menu className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/search")}
              className="flex-col h-auto py-2"
            >
              <CommandIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Cerca</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/agenda")}
              className="flex-col h-auto py-2"
            >
              <CalendarIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Agenda</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/actions")}
              className="flex-col h-auto py-2"
            >
              <Zap className="h-5 w-5 mb-1" />
              <span className="text-xs">Azioni</span>
            </Button>
          </div>
        </nav>

              </div>
    </div>
  );
}
