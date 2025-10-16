"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="container max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla home
        </Button>

        <div className="text-center py-16">
          <h1 className="text-4xl font-bold mb-4">Ricerca AI</h1>
          {query && (
            <p className="text-muted-foreground mb-8">
              Risultati per: <span className="font-semibold">{query}</span>
            </p>
          )}
          <p className="text-lg text-muted-foreground">
            Coming soon: Ricerca intelligente con RAG su clienti, immobili e zone
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-subtle p-8 flex items-center justify-center"><p>Caricamento...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
