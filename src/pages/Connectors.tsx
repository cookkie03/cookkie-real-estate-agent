import { Button } from "@/components/ui/button";
import { ArrowLeft, Plug } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Connectors = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="container max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla home
        </Button>

        <div className="text-center py-16">
          <Plug className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Connettori & Scraping</h1>
          <p className="text-lg text-muted-foreground">
            Coming soon: Configurazione connettori per portali, CRM e rubrica
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connectors;
