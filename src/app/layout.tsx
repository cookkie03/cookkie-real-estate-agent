import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "RealEstate AI - Dashboard Intelligente per Agenti",
  description: "Piattaforma AI per agenti immobiliari: gestisci clienti, immobili e appuntamenti con intelligenza artificiale avanzata e automazione smart",
  keywords: ["real estate", "CRM", "AI", "agenti immobiliari", "gestione clienti", "matching immobili"],
  authors: [{ name: "RealEstate AI" }],
  openGraph: {
    title: "RealEstate AI - Dashboard Intelligente per Agenti",
    description: "Piattaforma AI per agenti immobiliari: gestisci clienti, immobili e appuntamenti con intelligenza artificiale",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
