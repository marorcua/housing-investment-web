import type { RecurringExpense } from '../../shared/types.js';
import { parseLocalDate } from '../../shared/date.js';

export function getRecurringExpenseForMonth(
  re: RecurringExpense,
  year: number,
  month: number,
  monthlyRent: number,
): number | null {
  const start = parseLocalDate(re.startDate);
  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1;
  if (year < startYear || (year === startYear && month < startMonth))
    return null;
  const amount = re.percentage
    ? (re.percentage / 100) * monthlyRent
    : re.amount;
  if (re.frequency === 'monthly') return amount;
  if (re.frequency === 'annual' && month === startMonth) return amount;
  return null;
}
