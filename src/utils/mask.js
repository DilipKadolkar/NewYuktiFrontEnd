/**
 * Masks all but the last few characters of a sensitive value (bank account,
 * IFSC, UAN, ESIC) for on-screen display - e.g. "XXXX XXXX 4521" instead of
 * the full number. The backend has no partial-reveal endpoint for these
 * fields, so the frontend's only lever is not showing the full value by
 * default.
 */
export function maskSensitive(value, visibleChars = 4) {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value);
  if (str.length <= visibleChars) return str;
  const masked = 'X'.repeat(str.length - visibleChars) + str.slice(-visibleChars);
  return masked.replace(/(.{4})/g, '$1 ').trim();
}
