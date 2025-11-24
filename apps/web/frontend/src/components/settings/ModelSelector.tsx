"use client";

/**
 * Model Selector Component
 * Permette selezione del modello Google AI da usare
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Sparkles, AlertTriangle, Zap, Brain, Check } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
}

interface ModelData {
  currentModel: string;
  availableModels: Model[];
}

export function ModelSelector() {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message?: string; needsRestart?: boolean } | null>(null);

  useEffect(() => {
    fetchModelData();
  }, []);

  const fetchModelData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/ai-model');
      const data = await response.json();

      if (data.success) {
        setModelData(data.data);
        setSelectedModel(data.data.currentModel);
      }
    } catch (error) {
      console.error('Error fetching model data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedModel) {
      setSaveResult({ success: false, message: 'Seleziona un modello' });
      return;
    }

    // No change
    if (selectedModel === modelData?.currentModel) {
      setSaveResult({ success: false, message: 'Modello già selezionato' });
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch('/api/settings/ai-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveResult({
          success: true,
          message: 'Modello aggiornato con successo!',
          needsRestart: data.data?.needsRestart,
        });
        fetchModelData(); // Refresh
      } else {
        setSaveResult({ success: false, message: data.message || 'Errore durante il salvataggio' });
      }
    } catch (error: any) {
      setSaveResult({ success: false, message: error.message || 'Errore durante il salvataggio' });
    } finally {
      setIsSaving(false);
    }
  };

  const getModelIcon = (model: Model) => {
    if (model.id.includes('thinking')) return <Brain className="h-4 w-4" />;
    if (model.id.includes('8b')) return <Zap className="h-4 w-4" />;
    if (model.id.includes('pro')) return <Sparkles className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Modello AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Caricamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Modello Google AI
        </CardTitle>
        <CardDescription>
          Scegli quale modello Gemini usare per chatbot, matching e analisi
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Model Status */}
        {modelData && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Modello attuale:</strong>{' '}
              <code className="text-xs">{modelData.currentModel}</code>
            </AlertDescription>
          </Alert>
        )}

        {/* Model Selection */}
        {modelData && (
          <div className="space-y-2">
            {modelData.availableModels.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`w-full flex items-start space-x-3 rounded-lg border p-4 text-left transition-colors ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="mt-1">
                  {selectedModel === model.id ? (
                    <Check className="h-5 w-5 text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    {getModelIcon(model)}
                    {model.name}
                    {model.recommended && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Consigliato
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {model.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Save Result */}
        {saveResult && (
          <Alert variant={saveResult.success ? "default" : "destructive"}>
            {saveResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription className="space-y-2">
              <div>{saveResult.message}</div>
              {saveResult.needsRestart && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold">
                    Riavvio servizio necessario per applicare il nuovo modello
                  </span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSave}
          disabled={isSaving || selectedModel === modelData?.currentModel}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Salva Modello
        </Button>
      </CardFooter>
    </Card>
  );
}
