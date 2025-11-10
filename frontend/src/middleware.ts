/**
 * CRM IMMOBILIARE - Middleware
 *
 * Gestisce il redirect automatico al setup wizard se il setup non è completato.
 * Controlla la presenza di un UserProfile nel database.
 *
 * Routes protette: tutte tranne /setup, /api/setup, e assets statici
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { prisma } from '@/lib/db'; // Disabled - Prisma doesn't work in Edge Runtime

// Routes che non richiedono setup completato
const PUBLIC_ROUTES = [
  '/setup',
  '/api/setup',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // TEMPORARY FIX: Prisma doesn't work in Edge Runtime middleware
  // TODO: Move setup check to API route or use alternative approach
  // For now, allow all requests
  return NextResponse.next();

  /* DISABLED - Prisma Edge Runtime incompatibility
  try {
    // Check if setup is completed (UserProfile exists)
    const userProfile = await prisma.userProfile.findFirst({
      select: { id: true },
    });

    // Setup not completed -> redirect to /setup
    if (!userProfile && pathname !== '/setup') {
      const url = request.nextUrl.clone();
      url.pathname = '/setup';
      return NextResponse.redirect(url);
    }

    // Setup completed but trying to access /setup -> redirect to home
    if (userProfile && pathname === '/setup') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error checking setup status:', error);
    // On error, allow access (fail-open to avoid blocking the app)
    return NextResponse.next();
  }
  */
}

// Configure matcher to run middleware on specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
