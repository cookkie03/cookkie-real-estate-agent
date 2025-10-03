import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
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
          <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Impostazioni</h1>
          <p className="text-lg text-muted-foreground">
            Coming soon: Preferenze, scorciatoie, temi e configurazioni
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
