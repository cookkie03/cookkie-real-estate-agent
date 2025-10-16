"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calculator, 
  TrendingUp, 
  MapPin, 
  FileText, 
  Mail, 
  Phone,
  Calendar,
  BarChart3,
  Building2,
  Users,
  Zap
} from "lucide-react";

export default function ToolPage() {
  const router = useRouter();

  const tools = [
    {
      id: "calculator",
      title: "Calcolatore Mutuo",
      description: "Calcola rate, interessi e piani di ammortamento",
      icon: Calculator,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      available: true
    },
    {
      id: "valuation",
      title: "Valutazione Immobile",
      description: "Stima il valore di mercato di un immobile",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      available: true
    },
    {
      id: "area-analysis",
      title: "Analisi Zona",
      description: "Statistiche e trend di mercato per zona",
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      available: true
    },
    {
      id: "contract-generator",
      title: "Generatore Contratti",
      description: "Crea contratti personalizzati con AI",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      available: false
    },
    {
      id: "email-templates",
      title: "Template Email",
      description: "Email pre-compilate per ogni situazione",
      icon: Mail,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      available: true
    },
    {
      id: "call-script",
      title: "Script Chiamate",
      description: "Guide per chiamate efficaci",
      icon: Phone,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      available: true
    },
    {
      id: "appointment-scheduler",
      title: "Pianificatore Appuntamenti",
      description: "Ottimizza il tuo calendario",
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      available: false
    },
    {
      id: "market-report",
      title: "Report di Mercato",
      description: "Genera report dettagliati per clienti",
      icon: BarChart3,
      color: "text-red-600",
      bgColor: "bg-red-50",
      available: false
    },
    {
      id: "property-comparison",
      title: "Confronto Immobili",
      description: "Compara caratteristiche e prezzi",
      icon: Building2,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      available: true
    },
    {
      id: "lead-scoring",
      title: "Lead Scoring",
      description: "Valuta automaticamente i potenziali clienti",
      icon: Users,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      available: true
    },
    {
      id: "automation",
      title: "Automazioni",
      description: "Configura workflow automatici",
      icon: Zap,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
          <h1 className="text-xl font-bold">Toolkit Intelligente</h1>
        </div>
      </header>

      <div className="container px-4 py-8">
        {/* Intro */}
        <div className="max-w-3xl mb-8">
          <h2 className="text-3xl font-bold mb-3">
            Strumenti AI per il <span className="bg-gradient-accent bg-clip-text text-transparent">Real Estate</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Una suite completa di strumenti intelligenti per ottimizzare il tuo lavoro quotidiano
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.id} 
                className={`hover:shadow-lg transition-all ${
                  tool.available ? 'cursor-pointer hover:scale-105' : 'opacity-60'
                }`}
                onClick={() => tool.available && console.log(`Opening ${tool.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${tool.bgColor} mb-3`}>
                      <Icon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    {!tool.available && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        Prossimamente
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {tool.available ? (
                    <Button variant="outline" className="w-full">
                      Apri Tool
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full" disabled>
                      In Sviluppo
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border-2 border-dashed">
          <h3 className="text-xl font-semibold mb-2">Hai bisogno di un tool specifico?</h3>
          <p className="text-muted-foreground mb-4">
            Stiamo continuamente aggiungendo nuovi strumenti. Facci sapere cosa ti serve!
          </p>
          <Button>
            Richiedi un Tool
          </Button>
        </div>
      </div>
    </div>
  );
}
