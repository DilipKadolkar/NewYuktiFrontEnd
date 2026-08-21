// Decimal hours (e.g. 11.80, meaning 11h48m) read confusingly as raw numbers -
// "11.80" looks like it could mean "11 hours 80 minutes". This renders the
// same value as "11h 48m" instead, without changing the underlying decimal
// that payroll math, sorting, and exports still rely on.
export function formatHours(value) {
  if (value === null || value === undefined || value === '') return '';
  const totalMinutes = Math.round(Number(value) * 60);
  if (Number.isNaN(totalMinutes)) return '';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) return '0h';
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
