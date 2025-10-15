import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
