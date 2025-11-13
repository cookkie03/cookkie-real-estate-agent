/**
 * Formatting Utilities
 * @packageDocumentation
 */

import { format, parseISO, formatDistance } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Format Currency (EUR)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'N/A';

  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Number with thousand separator
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';

  return new Intl.NumberFormat('it-IT').format(num);
}

/**
 * Format Square Meters
 */
export function formatSqm(sqm: number | null | undefined): string {
  if (sqm === null || sqm === undefined) return 'N/A';
  return `${formatNumber(sqm)} m²`;
}

/**
 * Format Date (Italian format)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: it });
}

/**
 * Format DateTime (Italian format)
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: it });
}

/**
 * Format Relative Time (e.g., "2 giorni fa")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: it });
}

/**
 * Format Phone Number (Italian format)
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return 'N/A';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format: +39 XXX XXX XXXX
  if (cleaned.startsWith('39') && cleaned.length === 12) {
    return `+39 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  // Format: XXX XXX XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Format Address
 */
export function formatAddress(
  street?: string,
  civic?: string,
  city?: string,
  province?: string,
  zip?: string
): string {
  const parts = [];

  if (street) {
    parts.push(civic ? `${street} ${civic}` : street);
  }

  if (city) {
    const cityPart = province ? `${city} (${province})` : city;
    parts.push(cityPart);
  }

  if (zip) {
    parts.push(zip);
  }

  return parts.join(', ') || 'N/A';
}

/**
 * Format Property Code
 */
export function formatPropertyCode(type: string, year: number, sequence: number): string {
  return `${type.toUpperCase()}-${year}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Truncate Text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format Percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Capitalize First Letter
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Slugify String
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
