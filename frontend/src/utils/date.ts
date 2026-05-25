/**
 * Safe date formatter — always uses 'en-US' locale explicitly.
 * Prevents Next.js SSR/client hydration mismatch where server and client
 * may use different locales (e.g. "20/5/2026" vs "5/20/2026").
 */
export function formatDate(
  date: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US', options);
  } catch {
    return '';
  }
}

/** Short format: "May 20, 2026" */
export const formatDateShort = (date: string | Date | undefined | null) =>
  formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });

/** Numeric format: "05/20/2026" */
export const formatDateNumeric = (date: string | Date | undefined | null) =>
  formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });

/**
 * Static ISO strings for demo/fallback data.
 * Use fixed dates instead of new Date().toISOString() to avoid
 * different server/client timestamps causing hydration mismatches.
 */
export const STATIC_DEMO_DATE = '2025-01-15T10:00:00.000Z';
export const STATIC_DEMO_DATE_2 = '2025-02-10T10:00:00.000Z';
export const STATIC_DEMO_DATE_3 = '2025-03-05T10:00:00.000Z';
export const STATIC_DEMO_DATE_4 = '2025-04-01T10:00:00.000Z';
