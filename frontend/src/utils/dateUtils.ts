/**
 * Converts any date representation (ISO 8601 string, Date object, or custom format)
 * into a clean 'YYYY-MM-DD' format required by HTML <input type="date"> elements.
 */
export function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  if (!str) return '';

  // 1. Direct match for YYYY-MM-DD at start of string (e.g. "1995-05-15" or "1995-05-15T00:00:00.000Z")
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }

  // 2. Fallback parsing via JavaScript Date object
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Ignore error and return empty string
  }

  return '';
}

/**
 * Formats a date string for user-friendly display in UI text elements (DD/MM/YYYY).
 */
export function formatDateForDisplay(dateStr?: string | null): string {
  const formatted = formatDateForInput(dateStr);
  if (!formatted) return '—';
  const [year, month, day] = formatted.split('-');
  return `${day}/${month}/${year}`;
}

