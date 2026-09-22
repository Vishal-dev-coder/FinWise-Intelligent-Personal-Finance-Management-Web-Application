/**
 * Financial Health Score Calculation Algorithm (Score: 0 to 100)
 * Evaluates:
 * 1. Savings Rate (25% weight)
 * 2. Expense to Income Ratio (25% weight)
 * 3. Debt Burden / Debt-to-Income (20% weight)
 * 4. Budget Discipline (15% weight)
 * 5. Emergency Fund & Investments (15% weight)
 */

function calculateHealthScore({
  monthlyIncome = 0,
  monthlyExpenses = 0,
  monthlySavings = 0,
  totalDebts = 0,
  monthlyEmi = 0,
  budgets = [],
  transactions = [],
  emergencyFundSaved = 0,
  totalInvestments = 0,
}) {
  const safeIncome = Math.max(monthlyIncome, 1);

  // 1. Savings Rate Metric (Target >= 20%)
  const savingsRate = Math.max(0, ((safeIncome - monthlyExpenses) / safeIncome) * 100);
  let savingsScore = 0;
  if (savingsRate >= 30) savingsScore = 25;
  else if (savingsRate >= 20) savingsScore = 20;
  else if (savingsRate >= 10) savingsScore = 15;
  else if (savingsRate > 0) savingsScore = 8;
  else savingsScore = 2;

  // 2. Expense to Income Ratio Metric (Ideal <= 60%)
  const expenseRatio = (monthlyExpenses / safeIncome) * 100;
  let expenseScore = 0;
  if (expenseRatio <= 50) expenseScore = 25;
  else if (expenseRatio <= 70) expenseScore = 20;
  else if (expenseRatio <= 85) expenseScore = 14;
  else if (expenseRatio <= 100) expenseScore = 8;
  else expenseScore = 2; // Overspending

  // 3. Debt to Income / EMI Burden (Ideal EMI <= 20% of income)
  const emiRatio = (monthlyEmi / safeIncome) * 100;
  let debtScore = 0;
  if (totalDebts === 0 || emiRatio === 0) debtScore = 20;
  else if (emiRatio <= 15) debtScore = 16;
  else if (emiRatio <= 30) debtScore = 12;
  else if (emiRatio <= 45) debtScore = 6;
  else debtScore = 2;

  // 4. Budget Discipline Metric (How many category budgets stayed within limit)
  let budgetScore = 15;
  if (budgets && budgets.length > 0) {
    let breached = 0;
    budgets.forEach((b) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + t.amount, 0);
      if (spent > b.limit) breached++;
    });
    const adherenceRate = (budgets.length - breached) / budgets.length;
    budgetScore = Math.round(adherenceRate * 15);
  }

  // 5. Emergency Fund & Investment Preparedness (Target: 3 months of expenses)
  const targetEmergencyFund = Math.max(monthlyExpenses * 3, 1000);
  const emergencyCoverage = Math.min((emergencyFundSaved / targetEmergencyFund), 1);
  const hasInvestments = totalInvestments > 0 ? 1 : 0.5;
  const preparednessScore = Math.round((emergencyCoverage * 10) + (hasInvestments * 5));

  const totalScore = Math.min(100, Math.max(10, Math.round(savingsScore + expenseScore + debtScore + budgetScore + preparednessScore)));

  // Tier determination
  let grade = 'Fair';
  let badge = 'Needs Work';
  let color = '#F59E0B';
  let summary = 'Your finances are steady, but there is room for improvement in expense control and saving consistency.';

  if (totalScore >= 85) {
    grade = 'Excellent';
    badge = 'Wealth Master';
    color = '#10B981';
    summary = 'Outstanding financial discipline! You have strong cash flow, well-controlled debt, and solid savings habits.';
  } else if (totalScore >= 70) {
    grade = 'Good';
    badge = 'Smart Saver';
    color = '#3B82F6';
    summary = 'Strong financial health! You are living within your means and steadily building security.';
  } else if (totalScore >= 50) {
    grade = 'Fair';
    badge = 'Budget Builder';
    color = '#F59E0B';
    summary = 'Moderate financial stability. Focus on cutting high-discretionary costs and building your emergency buffer.';
  } else {
    grade = 'Needs Attention';
    badge = 'Debt Fighter';
    color = '#EF4444';
    summary = 'Critical financial pressure detected. High expenses or debt load require immediate budgeting adjustments.';
  }

  return {
    score: totalScore,
    grade,
    badge,
    color,
    summary,
    breakdown: {
      savingsRate: { score: savingsScore, max: 25, value: `${savingsRate.toFixed(1)}%` },
      expenseRatio: { score: expenseScore, max: 25, value: `${expenseRatio.toFixed(1)}%` },
      debtBurden: { score: debtScore, max: 20, value: `${emiRatio.toFixed(1)}% EMI ratio` },
      budgetDiscipline: { score: budgetScore, max: 15, value: `${budgets.length ? budgets.length : 0} budgets monitored` },
      preparedness: { score: preparednessScore, max: 15, value: `${(emergencyCoverage * 100).toFixed(0)}% fund goal` },
    },
  };
}

module.exports = { calculateHealthScore };
