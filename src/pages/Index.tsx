import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, HelpCircle, Command as CommandIcon, Phone, Calendar as CalendarIcon, Zap, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/CommandPalette";
import { AISearchBar } from "@/components/AISearchBar";
import { StatPill } from "@/components/StatPill";
import { MiniAgenda } from "@/components/MiniAgenda";
import { QuickDialer } from "@/components/QuickDialer";
import { IntelToolkit } from "@/components/IntelToolkit";
import { SuggestedActions } from "@/components/SuggestedActions";
import { MapPreview } from "@/components/MapPreview";
import { ConnectorsStatus } from "@/components/ConnectorsStatus";
import { ActivityFeed } from "@/components/ActivityFeed";
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

const Index = () => {
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "s" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[placeholder*="Cerca"]')?.focus();
        }
      }
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          navigate("/agenda");
        }
      }
      if (e.key === "a" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          navigate("/actions");
        }
      }
      if (e.key === "m" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          navigate("/map");
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [navigate]);

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
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex gap-2"
            >
              <CommandIcon className="h-4 w-4" />
              <span className="text-xs">⌘K</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
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
              Cerca clienti, immobili, vie e molto altro con l'intelligenza artificiale
            </p>
            <AISearchBar />
          </div>
        </section>

        {/* Quick Actions Pills */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            Prossime azioni
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatPill
              label="Chiamate urgenti"
              value={5}
              icon={Phone}
              variant="urgent"
              onClick={() => navigate("/actions?type=urgent")}
            />
            <StatPill
              label="Appuntamenti oggi"
              value={3}
              icon={CalendarIcon}
              variant="success"
              onClick={() => navigate("/agenda")}
            />
            <StatPill
              label="Follow-up post visita"
              value={4}
              icon={Zap}
              variant="warning"
              onClick={() => navigate("/actions?type=followup")}
            />
            <StatPill
              label="Lead nuovi"
              value={2}
              icon={TrendingUp}
              variant="default"
              onClick={() => navigate("/actions?type=new")}
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
              onClick={() => navigate("/")}
              className="flex-col h-auto py-2"
            >
              <Menu className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/search")}
              className="flex-col h-auto py-2"
            >
              <CommandIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Cerca</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/agenda")}
              className="flex-col h-auto py-2"
            >
              <CalendarIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Agenda</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/actions")}
              className="flex-col h-auto py-2"
            >
              <Zap className="h-5 w-5 mb-1" />
              <span className="text-xs">Azioni</span>
            </Button>
          </div>
        </nav>

        {/* Desktop Side Rail - Hidden for now, can be activated later */}
        <aside className="hidden xl:block fixed left-4 top-24 w-16">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex-col h-auto py-3"
              onClick={() => navigate("/search")}
            >
              <CommandIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex-col h-auto py-3"
              onClick={() => navigate("/agenda")}
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex-col h-auto py-3"
              onClick={() => navigate("/actions")}
            >
              <Zap className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex-col h-auto py-3"
              onClick={() => navigate("/map")}
            >
              <MapPin className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex-col h-auto py-3"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
