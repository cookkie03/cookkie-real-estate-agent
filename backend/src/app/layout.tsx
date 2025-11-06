/**
 * Root Layout - Backend API
 * Minimal layout for API routes only
 */

export const metadata = {
  title: 'CRM Immobiliare API',
  description: 'Backend API for CRM Immobiliare',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
