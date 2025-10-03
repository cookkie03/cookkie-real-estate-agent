import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Agenda = () => {
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
          <Calendar className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Agenda</h1>
          <p className="text-lg text-muted-foreground">
            Coming soon: Gestione completa appuntamenti con integrazione calendario
          </p>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
