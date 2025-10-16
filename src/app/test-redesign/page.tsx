"use client";

import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { LLMSearchBar } from "@/components/LLMSearchBar";
import { DailyBriefing } from "@/components/DailyBriefing";
import { ActionCategories } from "@/components/ActionCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function TestRedesignPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex lg:ml-20">
        <Toolbar />

        <div className="flex-1 overflow-auto pb-20 lg:pb-0 mb-16">
          <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-8">
            <section>
              <h1 className="text-3xl font-bold mb-2">Test Redesign</h1>
              <p className="text-muted-foreground">
                Pagina di test per i nuovi componenti e layout responsive
              </p>
            </section>

            {/* Color System Test */}
            <Card>
              <CardHeader>
                <CardTitle>Design System - Colori Funzionali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-priority-high-bg border-l-4 border-priority-high text-priority-high">
                    <p className="font-semibold text-sm">Priorità Alta</p>
                    <p className="text-xs mt-1">Urgente</p>
                  </div>
                  <div className="p-4 rounded-lg bg-priority-medium-bg border-l-4 border-priority-medium text-priority-medium">
                    <p className="font-semibold text-sm">Priorità Media</p>
                    <p className="text-xs mt-1">Importante</p>
                  </div>
                  <div className="p-4 rounded-lg bg-priority-low-bg border-l-4 border-priority-low text-priority-low">
                    <p className="font-semibold text-sm">Priorità Bassa</p>
                    <p className="text-xs mt-1">Normale</p>
                  </div>
                  <div className="p-4 rounded-lg bg-success-bg border-l-4 border-success text-success">
                    <p className="font-semibold text-sm">Success</p>
                    <p className="text-xs mt-1">Completato</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Bar Test */}
            <Card>
              <CardHeader>
                <CardTitle>LLM Search Bar</CardTitle>
              </CardHeader>
              <CardContent>
                <LLMSearchBar onSearch={(q) => console.log("Search:", q)} />
              </CardContent>
            </Card>

            {/* Briefing Test */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Briefing</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyBriefing />
              </CardContent>
            </Card>

            {/* Action Categories Test */}
            <Card>
              <CardHeader>
                <CardTitle>Action Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionCategories />
              </CardContent>
            </Card>

            {/* Responsive Grid Test */}
            <Card>
              <CardHeader>
                <CardTitle>Responsive Grid Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg bg-muted/30 border flex items-center justify-center h-32 text-sm font-medium"
                    >
                      Grid Item {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Responsive Info */}
            <Card>
              <CardHeader>
                <CardTitle>Responsive Breakpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-3 rounded bg-muted/30">
                  <span className="sm:hidden">Visibile solo su mobile</span>
                  <span className="hidden sm:inline lg:hidden">Visibile su tablet</span>
                  <span className="hidden lg:inline">Visibile su desktop (lg+)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
