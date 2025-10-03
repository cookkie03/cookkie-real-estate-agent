import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

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
};

export default Search;
