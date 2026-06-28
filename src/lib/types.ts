export interface Property {
  id: number;
  name: string;
  address: string | null;
  purchasePrice: number;
  purchaseDate: string;
  cadastralValue: number | null;
  buildingValue: number | null;
}

export interface Transaction {
  id: number;
  propertyId: number;
  amount: number;
  date: string;
  description?: string;
  type?: string;
}

export interface Tenant {
  id: number;
  propertyId: number;
  name: string;
  startDate: string;
  endDate: string | null;
  monthlyRent: number;
}

export interface Loan {
  id: number;
  propertyId: number;
  name: string;
  principal: number;
  interestRate: number;
  termYears: number;
  startDate: string;
}

export interface RecurringExpense {
  id: number;
  propertyId: number;
  name: string;
  type: 'insurance_housing' | 'insurance_life' | 'tax_ibi' | 'community' | 'other';
  amount: number;
  frequency: 'monthly' | 'annual';
  startDate: string;
}

export interface Summary {
  property: string;
  year: string;
  metrics: {
    totalRevenue: number;
    totalDeductions: number;
    netYield: number;
    deductions: { interests: number; repairs: number; others: number; amortization: number };
    cashflow: { netCashflow: number; totalRevenue: number; totalCashOutflows: number; loanOutflows: number; recurringOutflows: number; manualOutflows: number };
  };
}

export interface YearPoint {
  year: number;
  revenue: number;
  expenses: number;
  net: number;
}

export interface MonthPoint {
  month: number;
  revenue: number;
  expenses: number;
  net: number;
}

export interface GlobalData {
  annual: YearPoint[];
  monthly: MonthPoint[];
  currentYear: number;
}

export interface MonthData {
  month: number;
  label: string;
  revenues: Transaction[];
  expenses: Transaction[];
  totalRevenue: number;
  totalExpense: number;
  net: number;
}
