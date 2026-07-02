import type { Tenant, RentIncrease } from './types.js';
import { parseLocalDate } from './date.js';

export function getActiveTenant(tenants: Tenant[]): Tenant | null {
  const todayStr = new Date().toISOString().split('T')[0];
  return tenants.find(t => !t.endDate || t.endDate >= todayStr) || null;
}

export function computeEscalatedRent(
  baseRent: number,
  startDate: string,
  targetYear: number,
  increases: RentIncrease[],
): number {
  const startYear = new Date(startDate).getFullYear();
  const yearsSinceStart = targetYear - startYear;
  let multiplier = 1;
  for (const inc of increases) {
    if (inc.applied && inc.yearOffset <= yearsSinceStart) {
      multiplier *= 1 + inc.percentage / 100;
    }
  }
  return baseRent * multiplier;
}

export function getTenantRevenueForMonth(
  tenant: Tenant,
  year: number,
  month: number,
): number {
  const totalDays = new Date(year, month, 0).getDate();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, totalDays);
  const contractStart = parseLocalDate(tenant.startDate);
  const contractEnd = tenant.endDate ? parseLocalDate(tenant.endDate) : null;
  const overlapStart = contractStart > monthStart ? contractStart : monthStart;
  const overlapEnd =
    contractEnd && contractEnd < monthEnd ? contractEnd : monthEnd;
  if (overlapStart > overlapEnd) return 0;
  const activeDays = overlapEnd.getDate() - overlapStart.getDate() + 1;
  const escalated = computeEscalatedRent(
    tenant.monthlyRent,
    tenant.startDate,
    year,
    tenant.rentIncreases || [],
  );
  return (escalated / totalDays) * activeDays;
}
