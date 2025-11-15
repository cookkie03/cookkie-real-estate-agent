export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-24">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold text-blue-600">
          CRM Immobiliare
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Sistema CRM per agenzie immobiliari con matching AI-powered
        </p>
        <div className="flex gap-4 mt-8">
          <a
            href="/properties"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            Gestione Immobili
          </a>
          <a
            href="/clients"
            className="rounded-lg border-2 border-blue-600 px-6 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition"
          >
            Gestione Clienti
          </a>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="p-6 rounded-lg bg-white shadow-md">
            <h3 className="text-lg font-semibold mb-2">🏠 Immobili</h3>
            <p className="text-gray-600">Gestisci il tuo portfolio immobiliare</p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-md">
            <h3 className="text-lg font-semibold mb-2">👥 Clienti</h3>
            <p className="text-gray-600">Traccia richieste e preferenze</p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-md">
            <h3 className="text-lg font-semibold mb-2">🤖 Matching AI</h3>
            <p className="text-gray-600">Abbinamenti automatici intelligenti</p>
          </div>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>v4.0.0 - Production Ready Build</p>
        </div>
      </main>
    </div>
  );
}
