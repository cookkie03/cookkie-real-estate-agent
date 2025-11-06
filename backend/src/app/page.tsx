/**
 * Root Page - Backend API
 * Redirect to API documentation or frontend
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to API health check
  redirect('/api/health');
}
