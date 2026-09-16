export function formatCurrency(value: number, currency: string): string {
  try {
    if (!Number.isFinite(value)) {
      throw new TypeError('Currency value must be a finite number');
    }

    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    const fallbackCurrency = currency.trim() || 'GHS';
    const fallbackValue = Number.isFinite(value) ? value : 0;

    return `${fallbackCurrency} ${fallbackValue.toFixed(2)}`;
  }
}