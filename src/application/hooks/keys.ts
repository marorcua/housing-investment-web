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
