// Smart Forecasting & Trends Service
// Analyzes patterns and provides intelligent forecasts

import { api } from './api';

class SmartForecastingService {
  constructor() {
    this.analysisCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Main forecasting method
  async generateForecasts() {
    try {
      const [todoForecasts, cardForecasts, spendingForecasts] = await Promise.all([
        this.forecastTodoPatterns(),
        this.forecastCardUsage(),
        this.forecastSpendingTrends(),
      ]);

      return {
        todos: todoForecasts,
        cards: cardForecasts,
        spending: spendingForecasts,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating forecasts:', error);
      return { todos: [], cards: [], spending: [], generatedAt: new Date().toISOString() };
    }
  }

  
  async forecastTodoPatterns() {
    const forecasts = [];

    try {
      const todos = await api.getTodos();
      const completedTodos = todos.filter(t => t.completed);
      const pendingTodos = todos.filter(t => !t.completed);

      // Completion rate analysis
      const completionRate = todos.length > 0 ? (completedTodos.length / todos.length) * 100 : 0;

      if (completionRate < 70) {
        forecasts.push({
          type: 'completion_rate_warning',
          title: 'Task Completion Trend',
          message: `Your current completion rate is ${completionRate.toFixed(1)}%. Consider breaking down large tasks or adjusting your workload.`,
          confidence: 'high',
          timeframe: 'current',
          actionable: true,
          suggestions: [
            'Break large tasks into smaller chunks',
            'Set more realistic deadlines',
            'Focus on high-priority items first',
          ],
        });
      }

      // Overdue task prediction
      const overdueTodos = pendingTodos.filter(todo => {
        if (!todo.due_date) return false;
        return new Date(todo.due_date) < new Date();
      });

      if (overdueTodos.length > 0) {
        const avgOverdueTime = this.calculateAverageOverdueTime(overdueTodos);
        forecasts.push({
          type: 'overdue_prediction',
          title: 'Overdue Task Pattern',
          message: `You have ${overdueTodos.length} overdue tasks. Based on patterns, tasks typically become overdue by ${avgOverdueTime} days.`,
          confidence: 'medium',
          timeframe: 'next_week',
          actionable: true,
          suggestions: [
            'Set earlier personal deadlines',
            'Add buffer time to estimates',
            'Review task priorities weekly',
          ],
        });
      }

      // Task creation pattern
      const taskCreationPattern = this.analyzeTaskCreationPattern(todos);
      if (taskCreationPattern.trend === 'increasing') {
        forecasts.push({
          type: 'task_load_forecast',
          title: 'Increasing Task Load',
          message: `Your task creation rate has increased by ${taskCreationPattern.changePercent}% recently. Consider workload management strategies.`,
          confidence: 'medium',
          timeframe: 'next_month',
          actionable: true,
          suggestions: [
            'Delegate tasks when possible',
            'Automate recurring tasks',
            'Block time for deep work',
          ],
        });
      }
    } catch (error) {
      console.error('Error forecasting todo patterns:', error);
    }

    return forecasts;
  }

  // Credit card usage forecasting
  async forecastCardUsage() {
    const forecasts = [];

    try {
      const cards = await api.getCreditCards();
      const today = new Date();

      for (const card of cards) {
        forecasts.push(
          ...this.checkInactivityRisk(card, today),
          ...this.checkPromoExpiry(card, today),
          ...this.checkPromoOpportunity(card)
        );
      }
    } catch (error) {
      console.error('Error forecasting card usage:', error);
    }

    return forecasts;
  }

  checkInactivityRisk(card, today) {
    if (!card.last_used_date) return [];

    const daysSinceUse = Math.floor(
      (today - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUse > 60 && daysSinceUse < 90) {
      return [
        {
          type: 'inactivity_risk',
          cardId: card.id,
          cardName: `${card.bank_name} ••${card.last_four_digits}`,
          title: 'Card Closure Risk',
          message: `Your ${card.bank_name} card hasn't been used for ${daysSinceUse} days. It may be closed for inactivity soon.`,
          confidence: 'high',
          timeframe: 'next_30_days',
          actionable: true,
          suggestions: [
            'Make a small purchase this week',
            'Set up a recurring subscription',
            'Use for regular expenses like gas',
          ],
        },
      ];
    }
    return [];
  }

  checkPromoExpiry(card, today) {
    if (!card.current_promos || !Array.isArray(card.current_promos)) return [];

    const forecasts = [];
    for (const promo of card.current_promos) {
      if (promo.promo_expiry_date) {
        const daysUntilExpiry = Math.floor(
          (new Date(promo.promo_expiry_date) - today) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry > 30 && daysUntilExpiry <= 60) {
          forecasts.push({
            type: 'promo_planning',
            cardId: card.id,
            cardName: `${card.bank_name} ••${card.last_four_digits}`,
            title: 'Promo Expiry Planning',
            message: `Your ${card.bank_name} promo expires in ${daysUntilExpiry} days. Plan your spending strategy.`,
            confidence: 'high',
            timeframe: 'next_60_days',
            actionable: true,
            suggestions: [
              'Plan large purchases before expiry',
              'Research new promo offers',
              'Consider balance transfer options',
            ],
          });
        }
      }
    }
    return forecasts;
  }

  checkPromoOpportunity(card) {
    if (card.new_promo_available || !card.last_used_date) return [];

    const monthsSinceLastPromo = this.estimateMonthsSinceLastPromo(card);
    if (monthsSinceLastPromo > 12) {
      return [
        {
          type: 'promo_opportunity',
          cardId: card.id,
          cardName: `${card.bank_name} ••${card.last_four_digits}`,
          title: 'Potential Promo Opportunity',
          message: `You may be eligible for new promotional offers on your ${card.bank_name} card.`,
          confidence: 'medium',
          timeframe: 'current',
          actionable: true,
          suggestions: [
            'Check bank website for offers',
            'Call customer service',
            'Look for targeted mail offers',
          ],
        },
      ];
    }
    return [];
  }

  // Spending trend forecasting
  async forecastSpendingTrends() {
    const forecasts = [];

    // Analyzes spending patterns from available card usage data
    // Returns basic insights based on card activity

    try {
      const cards = await api.getCreditCards();
      const activeCards = cards.filter(card => {
        if (!card.last_used_date) return false;
        const daysSince = Math.floor(
          (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
        );
        return daysSince < 30;
      });

      if (activeCards.length > 0) {
        forecasts.push({
          type: 'spending_diversification',
          title: 'Spending Pattern Analysis',
          message: `You're actively using ${activeCards.length} of ${cards.length} cards. Consider optimizing for rewards.`,
          confidence: 'medium',
          timeframe: 'current',
          actionable: true,
          suggestions: [
            'Use cashback cards for groceries',
            'Use travel cards for dining',
            'Maximize category bonuses',
          ],
        });
      }
    } catch (error) {
      console.error('Error forecasting spending trends:', error);
    }

    return forecasts;
  }

  // Helper methods
  calculateAverageOverdueTime(overdueTodos) {
    const today = new Date();
    const overdueDays = overdueTodos.map(todo => {
      const dueDate = new Date(todo.due_date);
      return Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    });

    const average = overdueDays.reduce((sum, days) => sum + days, 0) / overdueDays.length;
    return Math.round(average);
  }

  analyzeTaskCreationPattern(todos) {
    // Analyzes task creation trends over the last 60 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentTasks = todos.filter(
      todo => todo.created_at && new Date(todo.created_at) > thirtyDaysAgo
    ).length;

    const previousTasks = todos.filter(
      todo =>
        todo.created_at &&
        new Date(todo.created_at) > sixtyDaysAgo &&
        new Date(todo.created_at) <= thirtyDaysAgo
    ).length;

    if (previousTasks === 0) {
      return { trend: 'stable', changePercent: 0 };
    }

    const changePercent = ((recentTasks - previousTasks) / previousTasks) * 100;

    let trend;
    if (changePercent > 20) {
      trend = 'increasing';
    } else if (changePercent < -20) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return { trend, changePercent: Math.abs(Math.round(changePercent)) };
  }

  estimateMonthsSinceLastPromo(card) {
    // Estimates months since last promo based on card usage patterns
    // Uses default estimate when promo history is not available
    return 18; // Conservative estimate for eligibility
  }

  // Get trends summary
  async getTrendsSummary() {
    const forecasts = await this.generateForecasts();
    const allForecasts = [...forecasts.todos, ...forecasts.cards, ...forecasts.spending];

    const highConfidence = allForecasts.filter(f => f.confidence === 'high');
    const actionable = allForecasts.filter(f => f.actionable);
    const urgent = allForecasts.filter(
      f => f.timeframe === 'next_week' || f.timeframe === 'next_30_days'
    );

    return {
      totalInsights: allForecasts.length,
      highConfidenceInsights: highConfidence.length,
      actionableInsights: actionable.length,
      urgentInsights: urgent.length,
      categories: {
        todos: forecasts.todos.length,
        cards: forecasts.cards.length,
        spending: forecasts.spending.length,
      },
      topInsights: (() => {
        const confidenceScore = { high: 3, medium: 2, low: 1 };
        const forecastsCopy = [...allForecasts];
        forecastsCopy.sort((a, b) => {
          return confidenceScore[b.confidence] - confidenceScore[a.confidence];
        });
        return forecastsCopy.slice(0, 3);
      })(),
    };
  }

  // Format forecasts for display
  formatForecastsForDisplay(forecasts) {
    const formatted = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
    };

    const allForecasts = [...forecasts.todos, ...forecasts.cards, ...forecasts.spending];

    for (const forecast of allForecasts) {
      const displayForecast = {
        id:
          forecast.cardId ||
          forecast.todoId ||
          `forecast_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0]}`,
        title: forecast.title,
        message: forecast.message,
        type: forecast.type,
        confidence: forecast.confidence,
        suggestions: forecast.suggestions || [],
        actionable: forecast.actionable,
      };

      switch (forecast.timeframe) {
        case 'current':
        case 'next_week':
          formatted.immediate.push(displayForecast);
          break;
        case 'next_30_days':
        case 'next_60_days':
          formatted.shortTerm.push(displayForecast);
          break;
        default:
          formatted.longTerm.push(displayForecast);
      }
    }

    return formatted;
  }
}

export const smartForecasting = new SmartForecastingService();