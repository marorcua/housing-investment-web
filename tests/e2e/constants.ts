// ── Routes ──
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
} as const;

// ── Auth ──
export const PASSWORD = 'admin';
export const WRONG_PASSWORD = 'wrongpassword';

export const AUTH = {
  HEADING: 'Login',
  LABEL: 'Password',
  BUTTON_LOGIN: 'Login',
  BUTTON_LOGOUT: 'Logout',
  SUCCESS_TEXT: 'Your Investments',
  ERROR_PATTERN: /invalid password|login failed/i,
} as const;

// ── Calculator ──
export const CALCULATOR = {
  HEADING: 'Investment Calculator',
  SUBTITLE: 'Simulate your mortgage payments',
  LABEL_HOUSE_PRICE: 'House Price (€)',
  RESULT_LOAN_AMOUNT: 'Loan Amount',
  RESULT_MONTHLY_PAYMENT: 'Monthly Payment',
  RESULT_TOTAL_INTEREST: 'Total Interest Paid',
} as const;

// ── Properties ──
export const PROPERTY = {
  BUTTON_ADD: 'Add Property',
  BUTTON_SAVE: 'Save Property',
  BUTTON_SAVE_CHANGES: 'Save Changes',
  LABEL_NAME: 'Property Name',
  LABEL_PRICE: /Purchase Price/i,
  EMPTY_TEXT: 'No properties found',
} as const;

// ── Dashboard ──
export const DASHBOARD = {
  GLOBAL_OVERVIEW: 'Global Overview',
  PURCHASE_PRICE: 'Purchase Price',
  ANNUAL_REVENUE: 'Annual Revenue',
} as const;

// ── Hacienda / Transactions ──
export const HACIENDA = {
  BUTTON_REVENUE: 'Revenue',
  BUTTON_EXPENSE: 'Expense',
  BUTTON_CASHFLOW: 'Cashflow',
  BUTTON_ADD_REVENUE: 'Add Revenue',
  BUTTON_ADD_EXPENSE: 'Add Expense',
  HEADING_ADD_REVENUE: 'Add revenue',
  HEADING_ADD_EXPENSE: 'Add expense',
  LABEL_AMOUNT: 'Amount (€)',
  LABEL_DATE: 'Date',
  ANNUAL_CASHFLOW: /Annual Cashflow/,
  REVENUE_ENTRIES: 'Revenue entries',
  MANUAL_EXPENSES: 'Manual expenses',
  MONTH_JUN: 'Jun',
} as const;

// ── Test data values ──
export const TEST_VALUES = {
  PROPERTY_PRICE: '250000',
  PROPERTY_PRICE_ALT: '300000',
  PROPERTY_PRICE_LOW: '150000',
  REVENUE_AMOUNT: '1200',
  EXPENSE_AMOUNT: '300',
  TEST_DATE: '2026-06-15',
} as const;

export const TEST_NAMES = {
  GLOBAL: 'Global Test Property',
  HACIENDA: 'Hacienda Test Property',
  E2E: 'E2E Test Property',
  EDITABLE: 'Editable Property',
  EDITED: 'Edited Property',
} as const;

// ── Calculator test values ──
export const CALCULATOR_VALUES = {
  HOUSE_PRICE: '250000',
} as const;
