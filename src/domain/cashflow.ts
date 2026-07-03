import type { Transaction, Loan, RecurringExpense, MonthData } from './types.js';
import type { Tenant } from '../leases/domain/tenant.js';
import { getTenantRevenueForMonth } from '../leases/domain/tenant.js';
import { getLoanPaymentForMonth } from './loan.js';
import { getRecurringExpenseForMonth } from './recurring-expense.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function buildMonthData(
  revenues: Transaction[],
  expenses: Transaction[],
  tenants: Tenant[],
  loans: Loan[],
  recurring: RecurringExpense[],
  propertyId: number,
  year: number,
): MonthData[] {
  const yearStr = year.toString();
  const yearRevenues = revenues.filter(r => r.date.startsWith(yearStr));
  const yearExpenses = expenses.filter(e => e.date.startsWith(yearStr));

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const mStr = `${yearStr}-${String(m).padStart(2, '0')}`;
    const revs = yearRevenues.filter(r => r.date.startsWith(mStr));
    const exps = yearExpenses.filter(e => e.date.startsWith(mStr));

    const tenantRevenues: Transaction[] = [];
    let monthlyRent = 0;
    for (const t of tenants) {
      const rev = getTenantRevenueForMonth(t, year, m);
      if (rev > 0) {
        monthlyRent += rev;
        tenantRevenues.push({
          id: -(t.id),
          propertyId,
          amount: rev,
          date: `${yearStr}-${String(m).padStart(2, '0')}-01`,
          description: `Rent: ${t.name}`,
        });
      }
    }

    const loanExpenses: Transaction[] = loans
      .filter(l => getLoanPaymentForMonth(l, year, m) !== null)
      .map(l => ({
        id: -(l.id + 1000),
        propertyId,
        amount: getLoanPaymentForMonth(l, year, m)!,
        date: `${yearStr}-${String(m).padStart(2, '0')}-01`,
        description: `Loan: ${l.name}`,
        type: 'loan',
      }));

    const recurringExp: Transaction[] = recurring
      .filter(re => getRecurringExpenseForMonth(re, year, m, monthlyRent) !== null)
      .map(re => ({
        id: -(re.id + 2000),
        propertyId,
        amount: getRecurringExpenseForMonth(re, year, m, monthlyRent)!,
        date: `${yearStr}-${String(m).padStart(2, '0')}-01`,
        description: re.name,
        type: 'recurring',
      }));

    const allRevs = [...revs, ...tenantRevenues];
    const allExps = [...exps, ...loanExpenses, ...recurringExp];
    const totalRevenue = allRevs.reduce((a, r) => a + r.amount, 0);
    const totalExpense = allExps.reduce((a, e) => a + e.amount, 0);
    return { month: m, label: MONTHS[i], revenues: allRevs, expenses: allExps, totalRevenue, totalExpense, net: totalRevenue - totalExpense };
  });
}
