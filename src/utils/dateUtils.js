/**
 * Safely creates a new Date object from various input types.
 * Specifically handles Safari's strictness with date strings.
 *
 * @param {string|Date|number|null} input
 * @returns {Date|null}
 */
export const safeNewDate = (input) => {
  if (!input) return null;
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);

  if (typeof input === 'string') {
    // 1. Handle "YYYY-MM-DD HH:mm:ss" -> replace '-' with '/' for Safari
    // 2. Handle "YYYY-MM-DDTHH:mm:ss" (ISO) -> Safari usually handles this if it's valid
    let processed = input;

    // Replace hyphens with slashes if it looks like a date string but not ISO
    if (input.includes('-') && !input.includes('T')) {
      processed = input.replace(/-/g, '/');
    }

    const date = new Date(processed);

    // Fallback for tricky strings
    if (isNaN(date.getTime())) {
      // Try again with the original if processing broke it
      const originalDate = new Date(input);
      if (!isNaN(originalDate.getTime())) return originalDate;

      console.error(`[safeNewDate] Failed to parse date: ${input}`);
      return null;
    }

    return date;
  }

  return new Date(input);
};

/**
 * Formats a date to YYYY-MM-DD for API inputs if needed
 */
export const formatDateOnly = (date) => {
  const d = safeNewDate(date);
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
