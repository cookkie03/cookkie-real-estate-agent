"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ActionsPage() {
  const router = useRouter();

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
          <Zap className="h-16 w-16 mx-auto mb-4 text-accent" />
          <h1 className="text-4xl font-bold mb-4">Azioni Suggerite</h1>
          <p className="text-lg text-muted-foreground">
            Coming soon: Liste complete di azioni suggerite dalla AI con priorità
          </p>
        </div>
      </div>
    </div>
  );
}
