/**
 * CRM IMMOBILIARE - Map Error Boundary
 *
 * Error boundary for map components to catch and handle errors gracefully.
 * Prevents entire app crash when map fails.
 *
 * @module components/map/MapErrorBoundary
 * @since v3.2.0
 */

'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[MapErrorBoundary] Caught error:', error, errorInfo);

    // Log to analytics/monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Map Error: ${error.message}`,
        fatal: false,
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full w-full flex items-center justify-center bg-muted">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Errore nella Mappa</h2>
            <p className="text-muted-foreground mb-6">
              Si è verificato un errore durante il caricamento della mappa.
              Prova a ricaricare la pagina.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Dettagli tecnici
                </summary>
                <pre className="mt-2 p-4 bg-muted/50 rounded text-xs overflow-auto max-h-32">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Ricarica Pagina
              </Button>
              <Button onClick={() => window.history.back()} variant="outline">
                Torna Indietro
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
