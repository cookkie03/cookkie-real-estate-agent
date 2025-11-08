import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { TopBar } from "@/components/layouts/TopBar";

export const metadata: Metadata = {
  title: "CRM Immobiliare - Gestione Completa",
  description: "Sistema CRM per agenzie immobiliari con AI integrata",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {/* Top Bar Navigation - Fixed top */}
          <TopBar />

          {/* Main content area - with top padding for fixed header */}
          <main className="pt-16 min-h-screen bg-background">
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
