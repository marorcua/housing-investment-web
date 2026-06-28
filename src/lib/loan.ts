export const calcMonthlyPayment = (principal: number, annualInterestRate: number, years: number): number => {
  if (annualInterestRate === 0) return principal / (years * 12);
  const monthlyRate = annualInterestRate / 100 / 12;
  const totalMonths = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
};
