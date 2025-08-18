export const generateFinancialInsights = expenses => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonth = expenses.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const income = thisMonth.filter(e => e.is_income).reduce((sum, e) => sum + e.amount, 0);
  const spending = thisMonth.filter(e => !e.is_income).reduce((sum, e) => sum + e.amount, 0);

  const insights = [];

  // Spending vs Income Analysis
  const savingsRate = income > 0 ? (((income - spending) / income) * 100).toFixed(1) : 0;
  if (savingsRate < 20) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      message: `You're saving only ${savingsRate}% this month. Consider reducing expenses.`,
      icon: '⚠️',
    });
  } else if (savingsRate > 50) {
    insights.push({
      type: 'success',
      title: 'Great Savings!',
      message: `Excellent! You're saving ${savingsRate}% this month.`,
      icon: '🎉',
    });
  }

  // Top Spending Category
  const categories = thisMonth
    .filter(e => !e.is_income)
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const topCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0];
  if (topCategory && topCategory[1] > spending * 0.4) {
    insights.push({
      type: 'info',
      title: 'Top Spending Category',
      message: `${topCategory[0]} accounts for ${((topCategory[1] / spending) * 100).toFixed(0)}% of your spending.`,
      icon: '📈',
    });
  }

  // Weekly Trend
  const lastWeek = expenses
    .filter(e => {
      const date = new Date(e.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo && !e.is_income;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const dailyAverage = (lastWeek / 7).toFixed(2);
  insights.push({
    type: 'info',
    title: 'Weekly Spending',
    message: `You spent $${lastWeek.toFixed(2)} this week (avg $${dailyAverage}/day).`,
    icon: '📅',
  });

  return insights;
};
