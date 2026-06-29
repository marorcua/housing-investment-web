import React, { useState, useMemo } from 'react';
import { calcMonthlyPayment } from '../../lib/loan';

export const InvestmentCalculator: React.FC = () => {
  const [housePrice, setHousePrice] = useState<number>(200000);
  const [loanPercentage, setLoanPercentage] = useState<number>(80);
  const [interestRate, setInterestRate] = useState<number>(3.5);
  const [years, setYears] = useState<number>(30);

  const results = useMemo(() => {
    const loanAmount = housePrice * (loanPercentage / 100);
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = years * 12;

    const monthlyPayment = calcMonthlyPayment(loanAmount, interestRate, years);

    const totalPaid = monthlyPayment * totalMonths;
    const totalInterest = totalPaid - loanAmount;

    // First year breakdown
    let remainingBalance = loanAmount;
    let firstYearInterest = 0;
    let firstYearPrincipal = 0;

    for (let i = 0; i < 12; i++) {
      const interestForMonth = remainingBalance * monthlyRate;
      const principalForMonth = monthlyPayment - interestForMonth;
      firstYearInterest += interestForMonth;
      firstYearPrincipal += principalForMonth;
      remainingBalance -= principalForMonth;
    }

    return {
      loanAmount,
      monthlyPayment,
      totalPaid,
      totalInterest,
      firstYearInterest,
      firstYearPrincipal,
    };
  }, [housePrice, loanPercentage, interestRate, years]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Investment Details</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="calc-house-price" className="block text-sm font-medium text-gray-700 mb-1">House Price (€)</label>
            <input
              id="calc-house-price"
              type="number" 
              value={housePrice} 
              onChange={(e) => setHousePrice(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="calc-loan-pct" className="block text-sm font-medium text-gray-700 mb-1">Loan Percentage (%)</label>
            <input
              id="calc-loan-pct"
              type="number" 
              value={loanPercentage} 
              onChange={(e) => setLoanPercentage(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="calc-interest" className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input
              id="calc-interest"
              type="number" 
              step="0.1"
              value={interestRate} 
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="calc-term" className="block text-sm font-medium text-gray-700 mb-1">Loan Term (Years)</label>
            <input
              id="calc-term"
              type="number" 
              value={years} 
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-6">Simulation Results</h2>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-blue-500 pb-2">
            <span className="opacity-80">Loan Amount</span>
            <span className="text-2xl font-bold">{results.loanAmount.toLocaleString()} €</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-blue-500 pb-2">
            <span className="opacity-80">Monthly Payment</span>
            <span className="text-3xl font-bold">{results.monthlyPayment.toFixed(2)} €</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-700 p-4 rounded-lg">
              <span className="block text-xs opacity-70 mb-1">Total Interest Paid</span>
              <span className="text-lg font-semibold">{results.totalInterest.toLocaleString()} €</span>
            </div>
            <div className="bg-blue-700 p-4 rounded-lg">
              <span className="block text-xs opacity-70 mb-1">Total Cost of Loan</span>
              <span className="text-lg font-semibold">{results.totalPaid.toLocaleString()} €</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">First Year Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Principal Paid</span>
                <span>{results.firstYearPrincipal.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Interest Paid</span>
                <span>{results.firstYearInterest.toLocaleString()} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
