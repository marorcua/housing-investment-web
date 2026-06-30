export const calcMonthlyPayment = (principal: number, annualInterestRate: number, years: number): number => {
  if (annualInterestRate === 0) return principal / (years * 12);
  const monthlyRate = annualInterestRate / 100 / 12;
  const totalMonths = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
};

export const calcMonthlyBreakdown = (
  principal: number, annualInterestRate: number, years: number, monthIndex: number,
  actualPayment?: number
): { interest: number; principal: number } => {
  const payment = actualPayment ?? calcMonthlyPayment(principal, annualInterestRate, years);
  if (annualInterestRate === 0) return { interest: 0, principal: payment };

  const monthlyRate = annualInterestRate / 100 / 12;
  let balance = principal;
  for (let m = 0; m < monthIndex; m++) {
    const interest = balance * monthlyRate;
    const principalPortion = payment - interest;
    balance -= principalPortion;
  }
  const interest = balance * monthlyRate;
  const principalPortion = payment - interest;
  return { interest, principal: principalPortion };
};
