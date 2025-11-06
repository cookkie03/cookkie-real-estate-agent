import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layouts/Sidebar";

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
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar - fixed left */}
            <Sidebar />

            {/* Main content area - with left margin for sidebar */}
            <main className="ml-64 flex-1 overflow-y-auto bg-background">
              <div className="container mx-auto p-6">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
