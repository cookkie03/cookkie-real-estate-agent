"use client";

/**
 * API Key Manager Component
 * Gestisce Google AI API key con test, save e restart servizio
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Key, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';

interface ApiKeyStatus {
  hasApiKey: boolean;
  maskedKey: string;
}

export function ApiKeyManager() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message?: string; needsRestart?: boolean } | null>(null);
  const [restartInfo, setRestartInfo] = useState<any>(null);

  // Load current API key status
  useEffect(() => {
    fetchApiKeyStatus();
    fetchRestartInfo();
  }, []);

  const fetchApiKeyStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/api-key');
      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching API key status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRestartInfo = async () => {
    try {
      const response = await fetch('/api/admin/restart-ai-service');
      const data = await response.json();
      if (data.success) {
        setRestartInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching restart info:', error);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Inserisci prima una API key' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/setup/test-google-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Errore durante il test' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (testFirst: boolean = true) => {
    if (!apiKey.trim()) {
      setSaveResult({ success: false, message: 'Inserisci una API key' });
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, testConnection: testFirst }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveResult({
          success: true,
          message: 'API key salvata con successo!',
          needsRestart: data.data?.needsRestart,
        });
        fetchApiKeyStatus(); // Refresh status
        setApiKey(''); // Clear input for security
      } else {
        setSaveResult({ success: false, message: data.message || 'Errore durante il salvataggio' });
      }
    } catch (error: any) {
      setSaveResult({ success: false, message: error.message || 'Errore durante il salvataggio' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = async () => {
    setIsRestarting(true);

    try {
      const response = await fetch('/api/admin/restart-ai-service', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Servizio AI riavviato con successo!');
        setSaveResult(null); // Clear "needs restart" message
      } else {
        if (data.instructions) {
          // Manual restart required
          alert(`ℹ️ ${data.message}\n\n${data.instructions.join('\n')}`);
        } else {
          alert(`❌ ${data.message}`);
        }
      }
    } catch (error: any) {
      alert(`❌ Errore: ${error.message}`);
    } finally {
      setIsRestarting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Google AI API Key
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
          <Key className="h-5 w-5" />
          Google AI API Key
        </CardTitle>
        <CardDescription>
          API key per Google Gemini AI (usata per chatbot, matching e analisi)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        {status && (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status.hasApiKey ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>API key configurata: <code className="text-xs">{status.maskedKey}</code></span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span>Nessuna API key configurata</span>
                  </>
                )}
              </div>
              {status.hasApiKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Vuoi rimuovere l\'API key?')) {
                      fetch('/api/settings/api-key', { method: 'DELETE' })
                        .then(() => fetchApiKeyStatus());
                    }
                  }}
                >
                  Rimuovi
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="apiKey">
            Nuova API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Incolla qui la tua Google AI Studio API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isSaving || isTesting}
          />
          <p className="text-xs text-muted-foreground">
            Ottieni una API key gratuita su{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {testResult.message || (testResult.success ? 'Test connessione riuscito!' : 'Test fallito')}
            </AlertDescription>
          </Alert>
        )}

        {/* Save Result */}
        {saveResult && (
          <Alert variant={saveResult.success ? "default" : "destructive"}>
            {saveResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription className="space-y-2">
              <div>{saveResult.message}</div>
              {saveResult.needsRestart && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold">Riavvio servizio necessario per applicare le modifiche</span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleTest}
          disabled={!apiKey.trim() || isTesting || isSaving}
          variant="outline"
        >
          {isTesting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Testa Connessione
        </Button>

        <Button
          onClick={() => handleSave(true)}
          disabled={!apiKey.trim() || isSaving || isTesting}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Salva e Testa
        </Button>

        {saveResult?.needsRestart && (
          <Button
            onClick={handleRestart}
            disabled={isRestarting}
            variant="default"
            className="ml-auto"
          >
            {isRestarting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            <RefreshCw className="h-4 w-4 mr-2" />
            Riavvia Servizio AI
          </Button>
        )}
      </CardFooter>

      {/* Restart Info */}
      {restartInfo && !restartInfo.canAutoRestart && (
        <CardFooter>
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Nota:</strong> Riavvio automatico non disponibile in {restartInfo.environment}.
              Dovrai riavviare manualmente il servizio AI per applicare le modifiche.
            </AlertDescription>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
}
