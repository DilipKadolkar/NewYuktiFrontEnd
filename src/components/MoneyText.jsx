const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return formatter.format(num);
}

export default function MoneyText({ value, className = '', ...rest }) {
  return (
    <span className={`tabular-nums ${className}`.trim()} {...rest}>
      {formatMoney(value)}
    </span>
  );
}
