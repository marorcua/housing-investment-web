export const formatEuros = (amount: number, fractionDigits = 2): string =>
  amount.toLocaleString('es-ES', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });

export const formatEurosShort = (amount: number): string =>
  amount.toLocaleString('es-ES');
