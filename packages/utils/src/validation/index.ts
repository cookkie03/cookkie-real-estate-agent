/**
 * Validation Utilities
 * @packageDocumentation
 */

/**
 * Validate Italian Tax Code (Codice Fiscale)
 */
export function isValidTaxCode(taxCode: string): boolean {
  const regex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  return regex.test(taxCode.toUpperCase());
}

/**
 * Validate Italian VAT Number (Partita IVA)
 */
export function isValidVatNumber(vatNumber: string): boolean {
  const regex = /^[0-9]{11}$/;
  return regex.test(vatNumber);
}

/**
 * Validate Email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate Italian Phone Number
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Italian phone: +39 or 0039 prefix, then 9-10 digits
  const regex = /^(\+39|0039)?[0-9]{9,10}$/;
  return regex.test(cleaned);
}

/**
 * Validate Coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Validate Italian CAP (Postal Code)
 */
export function isValidCAP(cap: string): boolean {
  const regex = /^[0-9]{5}$/;
  return regex.test(cap);
}

/**
 * Sanitize string (remove special characters)
 */
export function sanitizeString(str: string): string {
  return str.replace(/[^\w\s\-]/gi, '').trim();
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
