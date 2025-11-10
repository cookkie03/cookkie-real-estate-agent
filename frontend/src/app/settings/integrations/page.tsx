'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, MessageSquare, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
  email?: string;
  accountName?: string;
  lastSyncAt?: string;
  errorCount?: number;
  lastError?: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Load integration status on mount
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations/status');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async (service: 'calendar' | 'gmail') => {
    try {
      setConnecting(service);
      const res = await fetch(`/api/integrations/google/auth?service=${service}`);
      const data = await res.json();

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        toast.error('Errore nella configurazione OAuth');
      }
    } catch (error) {
      toast.error(`Errore nella connessione a ${service}`);
      setConnecting(null);
    }
  };

  const handleSyncCalendar = async () => {
    try {
      toast.info('Sincronizzazione in corso...');
      const res = await fetch('/api/integrations/google-calendar/sync', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Sincronizzati ${data.summary.eventsProcessed} eventi`);
        loadIntegrations();
      } else {
        toast.error('Errore nella sincronizzazione');
      }
    } catch (error) {
      toast.error('Errore nella sincronizzazione');
    }
  };

  const handleFetchGmail = async () => {
    try {
      toast.info('Recupero email in corso...');
      const res = await fetch('/api/integrations/gmail/fetch', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Recuperate ${data.summary.messagesProcessed} email`);
        loadIntegrations();
      } else {
        toast.error('Errore nel recupero email');
      }
    } catch (error) {
      toast.error('Errore nel recupero email');
    }
  };

  const getIntegration = (provider: string) => {
    return integrations.find(i => i.provider === provider);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const calendarIntegration = getIntegration('google_calendar');
  const gmailIntegration = getIntegration('gmail');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Integrazioni</h1>
        <p className="text-gray-600 mt-2">
          Connetti servizi esterni al tuo CRM per automatizzare il workflow
        </p>
      </div>

      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Sincronizza appuntamenti e attività con Google Calendar
                </CardDescription>
              </div>
            </div>
            {calendarIntegration?.isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connesso
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-600">
                <XCircle className="h-3 w-3 mr-1" />
                Non connesso
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {calendarIntegration?.isActive ? (
            <>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Account:</span> {calendarIntegration.email}
                </p>
                {calendarIntegration.lastSyncAt && (
                  <p>
                    <span className="font-medium">Ultima sincronizzazione:</span>{' '}
                    {new Date(calendarIntegration.lastSyncAt).toLocaleString('it-IT')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSyncCalendar} size="sm">
                  Sincronizza ora
                </Button>
                <Button variant="outline" size="sm">
                  Disconnetti
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => handleConnectGoogle('calendar')}
              disabled={connecting === 'calendar'}
            >
              {connecting === 'calendar' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connessione in corso...
                </>
              ) : (
                'Connetti Google Calendar'
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Gmail */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Mail className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Gmail</CardTitle>
                <CardDescription>
                  Invia e ricevi email direttamente dal CRM
                </CardDescription>
              </div>
            </div>
            {gmailIntegration?.isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connesso
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-600">
                <XCircle className="h-3 w-3 mr-1" />
                Non connesso
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {gmailIntegration?.isActive ? (
            <>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Account:</span> {gmailIntegration.email}
                </p>
                {gmailIntegration.lastSyncAt && (
                  <p>
                    <span className="font-medium">Ultimo controllo:</span>{' '}
                    {new Date(gmailIntegration.lastSyncAt).toLocaleString('it-IT')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFetchGmail} size="sm">
                  Recupera email ora
                </Button>
                <Button variant="outline" size="sm">
                  Disconnetti
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => handleConnectGoogle('gmail')}
              disabled={connecting === 'gmail'}
            >
              {connecting === 'gmail' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connessione in corso...
                </>
              ) : (
                'Connetti Gmail'
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>WhatsApp Business</CardTitle>
                <CardDescription>
                  Invia messaggi WhatsApp ai tuoi contatti tramite Twilio
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              <XCircle className="h-3 w-3 mr-1" />
              Non configurato
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>Per abilitare WhatsApp, configura le credenziali Twilio nel file .env:</p>
            <ul className="list-disc list-inside space-y-1 text-xs font-mono bg-gray-50 p-3 rounded">
              <li>TWILIO_ACCOUNT_SID</li>
              <li>TWILIO_AUTH_TOKEN</li>
              <li>TWILIO_WHATSAPP_NUMBER</li>
            </ul>
          </div>
          <Button variant="outline" size="sm" disabled>
            Configura WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
