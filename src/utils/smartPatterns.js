export const analyzeUserPatterns = (todos, expenses) => {
  const patterns = {
    frequentTask: null,
    preferredExpenseCategories: [],
    spendingAnomalies: [],
    taskCompletionRate: 0,
    averageTaskDuration: 0,
  };

  // Analyze task patterns
  if (todos.length > 0) {
    const taskFrequency = {};
    const completedTasks = todos.filter(t => t.completed);

    todos.forEach(todo => {
      const words = todo.task.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3) {
          taskFrequency[word] = (taskFrequency[word] || 0) + 1;
        }
      });
    });

    const mostFrequentWord = Object.entries(taskFrequency).sort(([, a], [, b]) => b - a)[0];

    if (mostFrequentWord && mostFrequentWord[1] > 2) {
      patterns.frequentTask = mostFrequentWord[0];
    }

    patterns.taskCompletionRate = ((completedTasks.length / todos.length) * 100).toFixed(1);
  }

  // Analyze expense patterns
  if (expenses.length > 0) {
    const categoryFrequency = {};
    const amounts = expenses.filter(e => !e.is_income).map(e => e.amount);
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

    expenses.forEach(expense => {
      if (!expense.is_income) {
        categoryFrequency[expense.category] = (categoryFrequency[expense.category] || 0) + 1;

        // Detect anomalies (expenses 3x above average)
        if (expense.amount > avgAmount * 3) {
          patterns.spendingAnomalies.push({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
          });
        }
      }
    });

    patterns.preferredExpenseCategories = Object.entries(categoryFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  return patterns;
};

export const generateSmartSuggestions = patterns => {
  const suggestions = [];

  if (patterns.taskCompletionRate < 70) {
    suggestions.push({
      type: 'productivity',
      title: 'Improve Task Completion',
      message: `Your completion rate is ${patterns.taskCompletionRate}%. Try breaking large tasks into smaller ones.`,
      action: 'Set smaller, achievable goals',
    });
  }

  if (patterns.spendingAnomalies.length > 0) {
    suggestions.push({
      type: 'financial',
      title: 'Unusual Spending Detected',
      message: `${patterns.spendingAnomalies.length} large expenses this month. Review if necessary.`,
      action: 'Review large expenses',
    });
  }

  if (patterns.frequentTask) {
    suggestions.push({
      type: 'automation',
      title: 'Recurring Task Detected',
      message: `You often add tasks about "${patterns.frequentTask}". Consider setting a recurring reminder.`,
      action: 'Create recurring task',
    });
  }

  return suggestions;
};
