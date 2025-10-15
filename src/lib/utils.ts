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
  // Deterministic formatter using Italian conventions: dot as thousands separator and comma as decimal separator.
  // This avoids relying on platform Intl implementations which can differ between server and client and
  // cause React hydration mismatches.
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  // Determine number of fraction digits to display
  const minFrac = options?.minimumFractionDigits ?? 0;
  const maxFrac = options?.maximumFractionDigits ?? (options?.minimumFractionDigits ?? 0);

  // If maxFrac is 0 and value is integer, no decimals
  let fracPart = "";
  let intPart = Math.trunc(abs).toString();

  if (maxFrac > 0) {
    // Use fixed representation based on maxFrac
    const fixed = abs.toFixed(maxFrac);
    const [i, f] = fixed.split(".");
    intPart = i;
    // Trim trailing zeros if minimumFractionDigits is lower
    if (minFrac < maxFrac) {
      let trimmed = f.replace(/0+$/, "");
      // Ensure at least minFrac digits
      while (trimmed.length < minFrac) {
        trimmed += "0";
      }
      fracPart = trimmed;
    } else {
      fracPart = f;
    }
  } else {
    // No specific fraction formatting requested
    if (!Number.isInteger(abs)) {
      const parts = abs.toString().split(".");
      intPart = parts[0];
      fracPart = parts[1] ?? "";
    }
  }

  // Add thousands separator (dot) for integer part
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const result = fracPart ? `${intPart},${fracPart}` : intPart;
  return sign + result;
}
