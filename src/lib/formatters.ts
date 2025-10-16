// src/lib/formatters.ts

/**
 * Formatta un numero secondo il locale italiano (it-IT)
 * Previene errori di hydration garantendo formattazione consistente server/client
 * @param value - Il numero da formattare
 * @param options - Opzioni di formattazione (es. minimumFractionDigits, maximumFractionDigits)
 * @returns Stringa formattata (es. "5.200" per 5200)
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("it-IT", options).format(value);
}
