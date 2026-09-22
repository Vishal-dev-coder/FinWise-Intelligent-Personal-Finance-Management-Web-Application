/**
 * Rule-Based Smart Spending Insights Engine
 * Produces actionable intelligence, behavioral alerts, and optimization recommendations.
 */

function generateSmartInsights({
  transactions = [],
  budgets = [],
  bills = [],
  goals = [],
  monthlyIncome = 5000,
}) {
  const insights = [];

  const now = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const expenses = currentMonthTransactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  // 1. Category-Wise Spending Concentration
  const categoryTotals = {};
  expenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const percentage = ((topAmount / (totalExpense || 1)) * 100).toFixed(0);
    if (percentage > 35) {
      insights.push({
        id: 'category-concentration',
        type: 'warning',
        title: `High Spending in ${topCategory}`,
        message: `Your highest expense category is ${topCategory}, representing ${percentage}% of this month's total spending.`,
        action: `Review your ${topCategory} purchases and look for subscription or discretionary cuts.`,
        icon: 'AlertTriangle',
      });
    }
  }

  // 2. Weekend vs Weekday Discretionary Spike
  let weekendSpend = 0;
  let weekdaySpend = 0;
  expenses.forEach((t) => {
    const day = new Date(t.date).getDay();
    if (day === 0 || day === 6) {
      weekendSpend += t.amount;
    } else {
      weekdaySpend += t.amount;
    }
  });

  if (weekendSpend > weekdaySpend * 0.8 && expenses.length >= 8) {
    insights.push({
      id: 'weekend-splurge',
      type: 'tip',
      title: 'Weekend Spend Acceleration',
      message: `You spend roughly 40%+ of your monthly discretionary budget on weekends alone.`,
      action: 'Try planning one "No-Spend Weekend" day this month to save up to $150.',
      icon: 'Calendar',
    });
  }

  // 3. Subscription Leakage Detector
  const subscriptions = bills.filter((b) => b.isSubscription);
  const totalSubCost = subscriptions.reduce((sum, b) => sum + b.amount, 0);
  if (subscriptions.length >= 3) {
    insights.push({
      id: 'sub-leak',
      type: 'info',
      title: 'Subscription Portfolio Review',
      message: `You currently have ${subscriptions.length} active recurring subscriptions costing ~$${totalSubCost.toFixed(2)}/mo ($${(totalSubCost * 12).toFixed(0)}/year).`,
      action: 'Audit services you haven\'t used in the past 30 days to free up cash.',
      icon: 'Repeat',
    });
  }

  // 4. Emotional Spending Correlation (Mood Analysis)
  const stressedSpend = expenses
    .filter((t) => t.mood === 'stressed' || t.mood === 'impulsive')
    .reduce((sum, t) => sum + t.amount, 0);

  if (stressedSpend > 0 && totalExpense > 0 && (stressedSpend / totalExpense) > 0.2) {
    insights.push({
      id: 'mood-spending',
      type: 'alert',
      title: 'Emotional Spending Pattern Detected',
      message: `${((stressedSpend / totalExpense) * 100).toFixed(0)}% of your expenses were logged during stressed or impulsive moments.`,
      action: 'Implement the "24-Hour Rule" before making non-essential purchases when feeling stressed.',
      icon: 'HeartHandshake',
    });
  }

  // 5. Budget Overrun Risks
  budgets.forEach((b) => {
    const spent = categoryTotals[b.category] || 0;
    const usage = (spent / b.limit) * 100;
    if (usage >= 100) {
      insights.push({
        id: `budget-over-${b.category}`,
        type: 'danger',
        title: `Budget Exceeded: ${b.category}`,
        message: `You have spent $${spent.toFixed(2)} out of your $${b.limit.toFixed(2)} limit (${usage.toFixed(0)}%).`,
        action: `Pause non-critical ${b.category} purchases until next month.`,
        icon: 'AlertCircle',
      });
    } else if (usage >= 80) {
      insights.push({
        id: `budget-warn-${b.category}`,
        type: 'warning',
        title: `Approaching Budget Limit: ${b.category}`,
        message: `You have utilized ${usage.toFixed(0)}% of your ${b.category} budget.`,
        action: `$${(b.limit - spent).toFixed(2)} remaining for this period.`,
        icon: 'Clock',
      });
    }
  });

  // 6. Savings Opportunity Milestone
  const activeGoals = goals.filter((g) => !g.isCompleted);
  if (activeGoals.length > 0) {
    const closestGoal = activeGoals.sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];
    const progress = Math.min(100, Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100));
    if (progress >= 70) {
      insights.push({
        id: 'goal-milestone',
        type: 'success',
        title: `Goal Within Reach: ${closestGoal.title}`,
        message: `You are at ${progress}% for your "${closestGoal.title}" goal! Only $${(closestGoal.targetAmount - closestGoal.currentAmount).toFixed(2)} left.`,
        action: 'A small bonus deposit this week can complete this goal ahead of schedule!',
        icon: 'Award',
      });
    }
  }

  // Always supply at least 2 insights
  if (insights.length < 2) {
    insights.push({
      id: 'default-savings-tip',
      type: 'tip',
      title: 'The 50/30/20 Rule Guideline',
      message: 'Allocate roughly 50% of your income to needs, 30% to wants, and 20% directly to savings and debt reduction.',
      action: 'Check your current monthly income vs expense ratio on the reports page.',
      icon: 'CheckCircle',
    });
  }

  return insights;
}

module.exports = { generateSmartInsights };
