import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api, isAuthenticated } from './api-client';
import type { Property, Transaction, Tenant, RentIncrease, Loan, RecurringExpense, Summary, GlobalData, MonthData, MonthlySummaryRow } from './types';
import { calcMonthlyPayment, calcMonthlyBreakdown } from './loan';

// --- Query keys ---
export const keys = {
  properties: ['properties'] as const,
  haciendaSummary: (id: number, year?: string) => ['hacienda-summary', id, year] as const,
  haciendaGlobal: (mode: string, year?: string) => ['hacienda-global', mode, year] as const,
  tenants: (id: number) => ['tenants', id] as const,
  loans: (id: number) => ['loans', id] as const,
  recurringExpenses: (id: number) => ['recurring-expenses', id] as const,
  revenues: (id: number) => ['revenues', id] as const,
  expenses: (id: number) => ['expenses', id] as const,
  rentIncreases: (id: number) => ['rent-increases', id] as const,
};

export interface DashboardData {
  properties: Property[];
  summaries: Record<number, Summary>;
  activeTenants: Record<number, { name: string; monthlyRent: number } | null>;
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    enabled: isAuthenticated(),
    queryFn: async () => {
      const properties = await api.properties.list();
      const summaryResults = await Promise.allSettled(
        properties.map(p => api.hacienda.summary(p.id).then(s => ({ id: p.id, summary: s })))
      );
      const summaries: Record<number, Summary> = {};
      summaryResults.forEach(r => {
        if (r.status === 'fulfilled') summaries[r.value.id] = r.value.summary;
      });
      const tenantResults = await Promise.allSettled(
        properties.map(p => api.tenants.listByProperty(p.id).then(tenants => {
          const todayStr = new Date().toISOString().split('T')[0];
          const active = tenants.find(t => !t.endDate || t.endDate >= todayStr);
          return { id: p.id, tenant: active || null };
        }))
      );
      const activeTenants: Record<number, { name: string; monthlyRent: number } | null> = {};
      tenantResults.forEach(r => {
        if (r.status === 'fulfilled') activeTenants[r.value.id] = r.value.tenant;
      });
      return { properties, summaries, activeTenants };
    },
  });
}

// --- Property hooks ---
export function useProperties() {
  return useQuery({
    queryKey: keys.properties,
    queryFn: () => api.properties.list(),
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => api.properties.get(id),
  });
}

// --- Summary hooks ---
export function useHaciendaSummary(propertyId: number, year?: string) {
  return useQuery({
    queryKey: keys.haciendaSummary(propertyId, year),
    queryFn: () => api.hacienda.summary(propertyId, year),
  });
}

export function useGlobalData(mode: string, year?: string) {
  return useQuery({
    queryKey: keys.haciendaGlobal(mode, year),
    queryFn: () => api.hacienda.global(year),
  });
}

// --- Per-property data hooks ---
export function useTenants(propertyId: number) {
  return useQuery({
    queryKey: keys.tenants(propertyId),
    queryFn: () => api.tenants.listByProperty(propertyId),
  });
}

export function useLoans(propertyId: number) {
  return useQuery({
    queryKey: keys.loans(propertyId),
    queryFn: () => api.loans.listByProperty(propertyId),
  });
}

export function useRecurringExpenses(propertyId: number) {
  return useQuery({
    queryKey: keys.recurringExpenses(propertyId),
    queryFn: () => api.recurringExpenses.listByProperty(propertyId),
  });
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function computeEscalatedRent(baseRent: number, startDate: string, targetYear: number, increases: RentIncrease[]): number {
  const startYear = new Date(startDate).getFullYear();
  const yearsSinceStart = targetYear - startYear;
  let multiplier = 1;
  for (const inc of increases) {
    if (inc.applied && inc.yearOffset <= yearsSinceStart) {
      multiplier *= (1 + inc.percentage / 100);
    }
  }
  return baseRent * multiplier;
}

function getTenantRevenueForMonth(tenant: Tenant, year: number, month: number): number {
  const totalDays = new Date(year, month, 0).getDate();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, totalDays);
  const contractStart = parseLocalDate(tenant.startDate);
  const contractEnd = tenant.endDate ? parseLocalDate(tenant.endDate) : null;
  const overlapStart = contractStart > monthStart ? contractStart : monthStart;
  const overlapEnd = contractEnd && contractEnd < monthEnd ? contractEnd : monthEnd;
  if (overlapStart > overlapEnd) return 0;
  const activeDays = overlapEnd.getDate() - overlapStart.getDate() + 1;
  const escalated = computeEscalatedRent(tenant.monthlyRent, tenant.startDate, year, tenant.rentIncreases || []);
  return (escalated / totalDays) * activeDays;
}

function getLoanPaymentForMonth(loan: Loan, year: number, month: number): number | null {
  const start = parseLocalDate(loan.startDate);
  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1;
  const totalMonths = loan.termYears * 12;
  const elapsedMonths = (year - startYear) * 12 + (month - startMonth);
  if (elapsedMonths < 0 || elapsedMonths >= totalMonths) return null;
  if (loan.actualPayment) return loan.actualPayment;
  return calcMonthlyPayment(loan.principal, loan.interestRate, loan.termYears);
}

function getRecurringExpenseForMonth(re: RecurringExpense, year: number, month: number, monthlyRent: number): number | null {
  const start = parseLocalDate(re.startDate);
  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1;
  if (year < startYear || (year === startYear && month < startMonth)) return null;
  const amount = re.percentage ? (re.percentage / 100) * monthlyRent : re.amount;
  if (re.frequency === 'monthly') return amount;
  if (re.frequency === 'annual' && month === startMonth) return amount;
  return null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function useCashflowData(propertyId: number, year: number) {
  return useQuery({
    queryKey: ['cashflow', propertyId, year],
    queryFn: async () => {
      const [allRevenues, allExpenses, allTenants, allLoans, allRecurring] = await Promise.all([
        api.revenues.listByProperty(propertyId),
        api.expenses.listByProperty(propertyId),
        api.tenants.listByProperty(propertyId),
        api.loans.listByProperty(propertyId),
        api.recurringExpenses.listByProperty(propertyId),
      ]);

      const yearStr = year.toString();
      const yearRevenues = allRevenues.filter(r => r.date.startsWith(yearStr));
      const yearExpenses = allExpenses.filter(e => e.date.startsWith(yearStr));

      const monthData: MonthData[] = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const mStr = `${yearStr}-${String(m).padStart(2, '0')}`;
        const revs = yearRevenues.filter(r => r.date.startsWith(mStr));
        const exps = yearExpenses.filter(e => e.date.startsWith(mStr));

        const tenantRevenues: Transaction[] = [];
        let monthlyRent = 0;
        for (const t of allTenants) {
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

        const loanExpenses: Transaction[] = allLoans
          .filter(l => getLoanPaymentForMonth(l, year, m) !== null)
          .map(l => ({
            id: -(l.id + 1000),
            propertyId,
            amount: getLoanPaymentForMonth(l, year, m)!,
            date: `${yearStr}-${String(m).padStart(2, '0')}-01`,
            description: `Loan: ${l.name}`,
            type: 'loan',
          }));

        const recurringExp: Transaction[] = allRecurring
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

      return monthData;
    },
  });
}

export function useMonthlySummary(propertyId: number, year: number) {
  return useQuery({
    queryKey: ['monthly-summary', propertyId, year],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const [allRevenues, allExpenses, allTenants, allLoans, allRecurring] = await Promise.all([
        api.revenues.listByProperty(propertyId),
        api.expenses.listByProperty(propertyId),
        api.tenants.listByProperty(propertyId),
        api.loans.listByProperty(propertyId),
        api.recurringExpenses.listByProperty(propertyId),
      ]);

      const yearStr = year.toString();
      const yearRevenues = allRevenues.filter(r => r.date.startsWith(yearStr));
      const yearExpenses = allExpenses.filter(e => e.date.startsWith(yearStr));

      const rows: MonthlySummaryRow[] = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const mStr = `${yearStr}-${String(m).padStart(2, '0')}`;
        const monthRevs = yearRevenues.filter(r => r.date.startsWith(mStr));
        const manualRev = monthRevs.reduce((a, r) => a + r.amount, 0);

        let tenantRev = 0;
        for (const t of allTenants) {
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
        for (const re of allRecurring) {
          const amt = getRecurringExpenseForMonth(re, year, m, tenantRev);
          if (amt === null) continue;
          if (re.type === 'community') recurringCommunity += amt;
          else if (re.type === 'insurance_housing' || re.type === 'insurance_life') recurringInsurance += amt;
          else if (re.type === 'tax_ibi') recurringIbi += amt;
          else recurringOther += amt;
        }

        let mortgageInterest = 0;
        let principal = 0;
        for (const loan of allLoans) {
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

      return rows;
    },
  });
}

export function useGlobalSummary(propertyIds: number[] | null, year: number) {
  return useQuery({
    queryKey: ['global-summary', propertyIds, year],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const ids = propertyIds;
      if (!ids || ids.length === 0) {
        const empty = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1, label: MONTHS[i], earnings: 0, mortgageInterest: 0, community: 0,
          insurance: 0, ibi: 0, repairs: 0, otherExpenses: 0, subtotalExclPrincipal: 0, principal: 0, total: 0,
        }));
        return empty;
      }
      const allRows = await Promise.all(ids.map(pid => computePropertySummary(pid, year)));
      return Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const props = ['earnings', 'mortgageInterest', 'community', 'insurance', 'ibi', 'repairs', 'otherExpenses', 'subtotalExclPrincipal', 'principal', 'total'] as const;
        const row: any = { month: m, label: MONTHS[i] };
        for (const p of props) {
          row[p] = allRows.reduce((a, r) => a + (r[m - 1] as any)[p], 0);
        }
        return row as MonthlySummaryRow;
      });
    },
  });
}

async function computePropertySummary(propertyId: number, year: number): Promise<MonthlySummaryRow[]> {
  const [allRevenues, allExpenses, allTenants, allLoans, allRecurring] = await Promise.all([
    api.revenues.listByProperty(propertyId),
    api.expenses.listByProperty(propertyId),
    api.tenants.listByProperty(propertyId),
    api.loans.listByProperty(propertyId),
    api.recurringExpenses.listByProperty(propertyId),
  ]);

  const yearStr = year.toString();
  const yearRevenues = allRevenues.filter(r => r.date.startsWith(yearStr));
  const yearExpenses = allExpenses.filter(e => e.date.startsWith(yearStr));

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const mStr = `${yearStr}-${String(m).padStart(2, '0')}`;
    const monthRevs = yearRevenues.filter(r => r.date.startsWith(mStr));
    const manualRev = monthRevs.reduce((a, r) => a + r.amount, 0);

    let tenantRev = 0;
    for (const t of allTenants) {
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
    for (const re of allRecurring) {
      const amt = getRecurringExpenseForMonth(re, year, m, tenantRev);
      if (amt === null) continue;
      if (re.type === 'community') recurringCommunity += amt;
      else if (re.type === 'insurance_housing' || re.type === 'insurance_life') recurringInsurance += amt;
      else if (re.type === 'tax_ibi') recurringIbi += amt;
      else recurringOther += amt;
    }

    let mortgageInterest = 0;
    let principal = 0;
    for (const loan of allLoans) {
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

// --- Active tenant helper ---
export function useActiveTenant(propertyId: number) {
  const { data: tenants } = useTenants(propertyId);
  if (!tenants) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  return tenants.find(t => !t.endDate || t.endDate >= todayStr) || null;
}

// --- Mutation hooks ---
function invalidateAll(qc: ReturnType<typeof useQueryClient>, keys: QueryKey[]) {
  keys.forEach(k => qc.invalidateQueries({ queryKey: k }));
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Property>) => api.properties.create(data),
    onSuccess: () => invalidateAll(qc, [['properties'], ['dashboard'], ['hacienda-global']]),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Property> }) => api.properties.update(id, data),
    onSuccess: () => invalidateAll(qc, [['properties'], ['dashboard'], ['hacienda-global']]),
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Tenant>) => api.tenants.create(data),
    onSuccess: () => invalidateAll(qc, [['tenants'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tenant> }) => api.tenants.update(id, data),
    onSuccess: () => invalidateAll(qc, [['tenants'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.tenants.delete(id),
    onSuccess: () => invalidateAll(qc, [['tenants'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

// --- Rent Increase hooks ---
export function useRentIncreases(tenantId: number) {
  return useQuery({
    queryKey: keys.rentIncreases(tenantId),
    queryFn: () => api.tenants.increases.list(tenantId),
  });
}

export function useCreateRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: number; data: { yearOffset: number; percentage: number } }) =>
      api.tenants.increases.create(tenantId, data),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], keys.rentIncreases(variables.tenantId)]),
  });
}

export function useUpdateRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, increaseId, data }: { tenantId: number; increaseId: number; data: Partial<RentIncrease> }) =>
      api.tenants.increases.update(tenantId, increaseId, data),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], keys.rentIncreases(variables.tenantId)]),
  });
}

export function useDeleteRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, increaseId }: { tenantId: number; increaseId: number }) =>
      api.tenants.increases.delete(tenantId, increaseId),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], keys.rentIncreases(variables.tenantId)]),
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Loan>) => api.loans.create(data),
    onSuccess: () => invalidateAll(qc, [['loans'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Loan> }) => api.loans.update(id, data),
    onSuccess: () => invalidateAll(qc, [['loans'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.loans.delete(id),
    onSuccess: () => invalidateAll(qc, [['loans'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useCreateRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RecurringExpense>) => api.recurringExpenses.create(data),
    onSuccess: () => invalidateAll(qc, [['recurring-expenses'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RecurringExpense> }) => api.recurringExpenses.update(id, data),
    onSuccess: () => invalidateAll(qc, [['recurring-expenses'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.recurringExpenses.delete(id),
    onSuccess: () => invalidateAll(qc, [['recurring-expenses'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useCreateRevenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => api.revenues.create(data),
    onSuccess: () => invalidateAll(qc, [['revenues'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateRevenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) => api.revenues.update(id, data),
    onSuccess: () => invalidateAll(qc, [['revenues'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteRevenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.revenues.delete(id),
    onSuccess: () => invalidateAll(qc, [['revenues'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => api.expenses.create(data),
    onSuccess: () => invalidateAll(qc, [['expenses'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) => api.expenses.update(id, data),
    onSuccess: () => invalidateAll(qc, [['expenses'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.expenses.delete(id),
    onSuccess: () => invalidateAll(qc, [['expenses'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}
