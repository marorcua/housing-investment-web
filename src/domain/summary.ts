import type { Transaction, Tenant, Loan, RecurringExpense, MonthlySummaryRow } from './types.js';
import { getTenantRevenueForMonth } from './tenant.js';
import { getRecurringExpenseForMonth } from './recurring-expense.js';
import { calcMonthlyBreakdown } from './loan.js';
import { parseLocalDate } from './date.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function buildMonthlySummaryRows(
  revenues: Transaction[],
  expenses: Transaction[],
  tenants: Tenant[],
  loans: Loan[],
  recurring: RecurringExpense[],
  year: number,
): MonthlySummaryRow[] {
  const yearStr = year.toString();
  const yearRevenues = revenues.filter(r => r.date.startsWith(yearStr));
  const yearExpenses = expenses.filter(e => e.date.startsWith(yearStr));

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const mStr = `${yearStr}-${String(m).padStart(2, '0')}`;
    const monthRevs = yearRevenues.filter(r => r.date.startsWith(mStr));
    const manualRev = monthRevs.reduce((a, r) => a + r.amount, 0);

    let tenantRev = 0;
    for (const t of tenants) {
      tenantRev += getTenantRevenueForMonth(t, year, m);
    }
    const earnings = manualRev + tenantRev;

    const monthExps = yearExpenses.filter(e => e.date.startsWith(mStr));

    const manualCommunity = monthExps.filter(e => e.type === 'community').reduce((a, e) => a + e.amount, 0);
    const manualInsurance = monthExps.filter(e => e.type === 'insurance').reduce((a, e) => a + e.amount, 0);
    const manualIbi = monthExps.filter(e => e.type === 'tax').reduce((a, e) => a + e.amount, 0);
    const manualRepairs = monthExps.filter(e => e.type === 'repair').reduce((a, e) => a + e.amount, 0);
    const manualOther = monthExps.filter(e => !['community', 'insurance', 'tax', 'repair', 'interest'].includes(e.type!))
      .reduce((a, e) => a + e.amount, 0);

    let recurringCommunity = 0;
    let recurringInsurance = 0;
    let recurringIbi = 0;
    let recurringOther = 0;
    for (const re of recurring) {
      const amt = getRecurringExpenseForMonth(re, year, m, tenantRev);
      if (amt === null) continue;
      if (re.type === 'community') recurringCommunity += amt;
      else if (re.type === 'insurance_housing' || re.type === 'insurance_life') recurringInsurance += amt;
      else if (re.type === 'tax_ibi') recurringIbi += amt;
      else recurringOther += amt;
    }

    let mortgageInterest = 0;
    let principal = 0;
    for (const loan of loans) {
      const start = parseLocalDate(loan.startDate);
      const startYearL = start.getFullYear();
      const startMonthL = start.getMonth() + 1;
      const elapsedMonths = (year - startYearL) * 12 + (m - startMonthL);
      const totalMonths = loan.termYears * 12;
      if (elapsedMonths >= 0 && elapsedMonths < totalMonths) {
        const breakdown = calcMonthlyBreakdown(loan.principal, loan.interestRate, loan.termYears, elapsedMonths, loan.actualPayment);
        mortgageInterest += breakdown.interest;
        principal += breakdown.principal;
      }
    }

    const community = manualCommunity + recurringCommunity;
    const insurance = manualInsurance + recurringInsurance;
    const ibi = manualIbi + recurringIbi;
    const repairs = manualRepairs;
    const otherExpenses = manualOther + recurringOther;
    const subtotalExclPrincipal = mortgageInterest + community + insurance + ibi + repairs + otherExpenses;
    const total = subtotalExclPrincipal + principal;

    return { month: m, label: MONTHS[i], earnings, mortgageInterest, community, insurance, ibi, repairs, otherExpenses, subtotalExclPrincipal, principal, total };
  });
}
