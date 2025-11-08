"use client";

/**
 * CRM IMMOBILIARE - Setup Wizard
 *
 * Wizard multi-step per la configurazione iniziale dell'applicazione.
 * Viene mostrato solo al primo avvio, prima che esista un UserProfile.
 *
 * Steps:
 * 1. Benvenuto + Info agente
 * 2. Configurazione agenzia
 * 3. API Keys (Google AI)
 * 4. Test connessione
 * 5. Completamento
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Sparkles, Building2, Key, User } from 'lucide-react';

// Types
interface SetupData {
  // Step 1: User Info
  fullName: string;
  email: string;
  phone: string;

  // Step 2: Agency Info
  agencyName: string;
  agencyVat: string;
  agencyAddress: string;

  // Step 3: API Keys
  googleApiKey: string;
  commissionPercent: number;
}

export default function SetupWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState<SetupData>({
    fullName: '',
    email: '',
    phone: '',
    agencyName: '',
    agencyVat: '',
    agencyAddress: '',
    googleApiKey: '',
    commissionPercent: 3.0,
  });

  const totalSteps = 4;

  // Update form data
  const updateField = (field: keyof SetupData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Validate current step
  const validateStep = (): boolean => {
    setError(null);

    switch (currentStep) {
      case 1: // User Info
        if (!formData.fullName.trim()) {
          setError('Il nome completo è obbligatorio');
          return false;
        }
        if (!formData.email.trim()) {
          setError('L\'email è obbligatoria');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Email non valida');
          return false;
        }
        return true;

      case 2: // Agency Info (optional, can skip)
        return true;

      case 3: // API Keys (optional but recommended)
        if (formData.googleApiKey.trim() && formData.googleApiKey.length < 20) {
          setError('API key non valida (troppo corta)');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Go to next step
  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  // Go to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  };

  // Test Google AI connection
  const handleTestConnection = async () => {
    if (!formData.googleApiKey.trim()) {
      setError('Inserisci prima una Google API key');
      return;
    }

    setTestStatus('testing');
    setError(null);

    try {
      const response = await fetch('/api/setup/test-google-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: formData.googleApiKey }),
      });

      const data = await response.json();

      if (data.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setError(data.message || 'Test connessione fallito');
      }
    } catch (err) {
      setTestStatus('error');
      setError('Errore durante il test di connessione');
    }
  };

  // Complete setup and create UserProfile
  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore durante il setup');
      }

      // Setup completato con successo!
      router.push('/?setup=success');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Errore durante il completamento del setup');
      setIsLoading(false);
    }
  };

  // Skip setup (create minimal profile)
  const handleSkip = async () => {
    if (!formData.fullName || !formData.email) {
      setError('Nome ed email sono obbligatori anche per saltare');
      return;
    }

    handleComplete();
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Benvenuto!</h2>
              <p className="text-muted-foreground mt-2">
                Iniziamo configurando il tuo profilo personale
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                placeholder="Mario Rossi"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono (opzionale)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+39 333 123 4567"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Informazioni Agenzia</h2>
              <p className="text-muted-foreground mt-2">
                Configura i dati della tua agenzia immobiliare (opzionale)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencyName">Nome Agenzia</Label>
              <Input
                id="agencyName"
                placeholder="Agenzia Immobiliare Example"
                value={formData.agencyName}
                onChange={(e) => updateField('agencyName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencyVat">Partita IVA</Label>
              <Input
                id="agencyVat"
                placeholder="12345678901"
                value={formData.agencyVat}
                onChange={(e) => updateField('agencyVat', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencyAddress">Indirizzo</Label>
              <Input
                id="agencyAddress"
                placeholder="Via Example 123, Milano"
                value={formData.agencyAddress}
                onChange={(e) => updateField('agencyAddress', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionPercent">Percentuale Commissione (%)</Label>
              <Input
                id="commissionPercent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.commissionPercent}
                onChange={(e) => updateField('commissionPercent', parseFloat(e.target.value) || 3.0)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Key className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">API Keys</h2>
              <p className="text-muted-foreground mt-2">
                Configura le chiavi API per abilitare le funzionalità AI
              </p>
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Google AI Studio (Gemini)</strong> - Gratuito!<br />
                Abilita: Assistente RAG, Matching intelligente, Briefing giornaliero<br />
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Ottieni la tua API key qui →
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="googleApiKey">Google AI API Key (opzionale)</Label>
              <Input
                id="googleApiKey"
                type="password"
                placeholder="AIza..."
                value={formData.googleApiKey}
                onChange={(e) => updateField('googleApiKey', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Puoi configurarla anche dopo nelle Impostazioni
              </p>
            </div>

            {formData.googleApiKey && (
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="w-full"
              >
                {testStatus === 'testing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {testStatus === 'success' && <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />}
                {testStatus === 'error' && <XCircle className="mr-2 h-4 w-4 text-red-600" />}
                {testStatus === 'idle' && 'Testa Connessione'}
                {testStatus === 'testing' && 'Test in corso...'}
                {testStatus === 'success' && 'Connessione riuscita!'}
                {testStatus === 'error' && 'Riprova test'}
              </Button>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold">Tutto Pronto!</h2>
              <p className="text-muted-foreground mt-2">
                Rivedi le tue informazioni e completa il setup
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Riepilogo Configurazione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">Nome:</span> {formData.fullName}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {formData.email}
                </div>
                {formData.phone && (
                  <div>
                    <span className="font-semibold">Telefono:</span> {formData.phone}
                  </div>
                )}
                {formData.agencyName && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <span className="font-semibold">Agenzia:</span> {formData.agencyName}
                    </div>
                    {formData.agencyVat && (
                      <div>
                        <span className="font-semibold">P.IVA:</span> {formData.agencyVat}
                      </div>
                    )}
                  </>
                )}
                <div className="border-t pt-3 mt-3">
                  <span className="font-semibold">Commissione:</span> {formData.commissionPercent}%
                </div>
                <div>
                  <span className="font-semibold">Google AI:</span>{' '}
                  {formData.googleApiKey ? (
                    <span className="text-green-600">✓ Configurata</span>
                  ) : (
                    <span className="text-muted-foreground">Non configurata</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Setup CRM Immobiliare</CardTitle>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} di {totalSteps}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderStepContent()}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            Indietro
          </Button>

          <div className="flex gap-2">
            {currentStep < totalSteps && currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Salta
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStep === totalSteps ? 'Completa Setup' : 'Avanti'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
