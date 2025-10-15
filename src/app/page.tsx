"use client";

import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { LLMSearchBar } from "@/components/LLMSearchBar";
import { DailyBriefing } from "@/components/DailyBriefing";
import { ActionCategories } from "@/components/ActionCategories";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In future: trigger LLM search API
    console.log("Search query:", query);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Top Bar */}
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex lg:ml-20">
        {/* Toolbar */}
        <Toolbar />

        {/* Content Area with padding for mobile nav */}
        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Hero Section - Search */}
            <section className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold">Buongiorno!</h2>
              <p className="text-muted-foreground">
                Cerca clienti, immobili, vie e molto altro con l'intelligenza artificiale
              </p>
            </section>

            {/* Search Bar */}
            <section>
              <LLMSearchBar onSearch={handleSearch} />
            </section>

            {/* Briefing Section */}
            <section>
              <DailyBriefing />
            </section>

            {/* Action Categories */}
            <section>
              <ActionCategories onViewAll={() => router.push("/actions")} />
            </section>

            {/* Quick Stats Grid - Optional for future */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-xs text-muted-foreground mb-2">Proprietà</p>
                <p className="text-2xl font-bold">152</p>
                <p className="text-xs text-muted-foreground mt-1">Nel database</p>
              </div>
              <div className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-xs text-muted-foreground mb-2">Clienti</p>
                <p className="text-2xl font-bold">48</p>
                <p className="text-xs text-muted-foreground mt-1">Attivi</p>
              </div>
              <div className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-xs text-muted-foreground mb-2">Match</p>
                <p className="text-2xl font-bold">234</p>
                <p className="text-xs text-muted-foreground mt-1">Questa settimana</p>
              </div>
              <div className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-xs text-muted-foreground mb-2">Conversion</p>
                <p className="text-2xl font-bold">18%</p>
                <p className="text-xs text-muted-foreground mt-1">Tasso medio</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
