// AI Context Memory Service
// Stores conversation history, user patterns, and provides smart suggestions

class AIContextMemory {
  constructor() {
    this.maxMessages = 10;
    this.maxPatterns = 20;
    this.storageKey = 'finbot_context_memory';
    this.patternsKey = 'finbot_user_patterns';
    this.init();
  }

  init() {
    // Initialize memory from localStorage
    this.memory = this.loadFromStorage(this.storageKey, {
      messages: [],
      lastActivity: null,
      sessionCount: 0,
    });

    this.patterns = this.loadFromStorage(this.patternsKey, {
      frequentQueries: [],
      preferredActions: [],
      timePatterns: [],
      lastUpdated: null,
    });
  }

  loadFromStorage(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from storage:`, error);
      return defaultValue;
    }
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to save ${key} to storage:`, error);
    }
  }

  // Store conversation message
  addMessage(type, content, metadata = {}) {
    const message = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.memory.messages.push(message);

    // Keep only last N messages
    if (this.memory.messages.length > this.maxMessages) {
      this.memory.messages = this.memory.messages.slice(-this.maxMessages);
    }

    this.memory.lastActivity = new Date().toISOString();
    this.saveToStorage(this.storageKey, this.memory);

    // Update patterns if user message
    if (type === 'user') {
      this.updatePatterns(content, metadata);
    }
  }

  // Update user behavior patterns
  updatePatterns(query, metadata = {}) {
    const now = new Date();
    const hour = now.getHours();

    // Update frequent queries
    const existingQuery = this.patterns.frequentQueries.find(q =>
      q.query.toLowerCase().includes(query.toLowerCase().substring(0, 20))
    );

    if (existingQuery) {
      existingQuery.count++;
      existingQuery.lastUsed = now.toISOString();
    } else {
      this.patterns.frequentQueries.push({
        query: query.substring(0, 100),
        count: 1,
        firstUsed: now.toISOString(),
        lastUsed: now.toISOString(),
      });
    }

    // Update time patterns
    const timeSlot = this.getTimeSlot(hour);
    const existingTime = this.patterns.timePatterns.find(t => t.slot === timeSlot);

    if (existingTime) {
      existingTime.count++;
    } else {
      this.patterns.timePatterns.push({
        slot: timeSlot,
        count: 1,
      });
    }

    // Update preferred actions based on metadata
    if (metadata.action) {
      const existingAction = this.patterns.preferredActions.find(a => a.action === metadata.action);
      if (existingAction) {
        existingAction.count++;
      } else {
        this.patterns.preferredActions.push({
          action: metadata.action,
          count: 1,
        });
      }
    }

    // Cleanup old patterns
    this.cleanupPatterns();

    this.patterns.lastUpdated = now.toISOString();
    this.saveToStorage(this.patternsKey, this.patterns);
  }

  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  cleanupPatterns() {
    // Keep only top frequent queries
    this.patterns.frequentQueries.sort((a, b) => b.count - a.count);
    this.patterns.frequentQueries = this.patterns.frequentQueries.slice(0, this.maxPatterns);

    // Keep only top preferred actions
    this.patterns.preferredActions.sort((a, b) => b.count - a.count);
    this.patterns.preferredActions = this.patterns.preferredActions.slice(0, 10);
  }

  // Get recent conversation context
  getRecentContext(limit = 5) {
    return this.memory.messages.slice(-limit);
  }

  // Get smart suggestions based on patterns
  getSmartSuggestions() {
    const suggestions = [];
    const now = new Date();
    const currentTimeSlot = this.getTimeSlot(now.getHours());

    // Time-based suggestions
    const timeBasedSuggestions = {
      morning: [
        'What needs my attention today?',
        'Show me overdue tasks',
        'Check inactive credit cards',
      ],
      afternoon: [
        'How am I doing with my tasks?',
        'Show me spending insights',
        'Any cards need attention?',
      ],
      evening: [
        'What did I accomplish today?',
        "Plan tomorrow's tasks",
        'Review credit card usage',
      ],
      night: ['Quick financial summary', 'Set reminders for tomorrow', 'Check upcoming deadlines'],
    };

    suggestions.push(...(timeBasedSuggestions[currentTimeSlot] || []));

    // Pattern-based suggestions from frequent queries
    const topQueries = this.patterns.frequentQueries.slice(0, 3).map(q => q.query);

    suggestions.push(...topQueries);

    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, 6);
  }

  // Get proactive alerts based on context
  getProactiveAlerts() {
    const alerts = [];
    const recentMessages = this.getRecentContext(3);

    // Check if user hasn't been active recently
    if (this.memory.lastActivity) {
      const lastActivity = new Date(this.memory.lastActivity);
      const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursSinceActivity > 24) {
        alerts.push({
          type: 'engagement',
          message: 'Welcome back! Let me catch you up on what needs attention.',
          priority: 'medium',
        });
      }
    }

    // Check for repeated similar queries
    const recentUserMessages = recentMessages.filter(m => m.type === 'user');
    if (recentUserMessages.length >= 2) {
      const lastTwo = recentUserMessages.slice(-2);
      if (this.areSimilarQueries(lastTwo[0].content, lastTwo[1].content)) {
        alerts.push({
          type: 'clarification',
          message:
            "I notice you're asking similar questions. Would you like me to explain this differently?",
          priority: 'low',
        });
      }
    }

    return alerts;
  }

  areSimilarQueries(query1, query2) {
    const words1 = query1.toLowerCase().split(' ');
    const words2 = query2.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length >= Math.min(words1.length, words2.length) * 0.6;
  }

  // Get contextual insights
  getContextualInsights() {
    const insights = [];
    const recentContext = this.getRecentContext();

    // Analyze conversation flow
    const userMessages = recentContext.filter(m => m.type === 'user');
    const assistantMessages = recentContext.filter(m => m.type === 'assistant');

    if (userMessages.length > assistantMessages.length) {
      insights.push({
        type: 'conversation_flow',
        message: "You've been asking several questions. I'm here to help with all of them!",
        suggestion: 'Feel free to ask follow-up questions or request clarification.',
      });
    }

    // Pattern insights
    const topAction = this.patterns.preferredActions[0];
    if (topAction && topAction.count > 3) {
      insights.push({
        type: 'usage_pattern',
        message: `I notice you frequently ${topAction.action}. I can help streamline this!`,
        suggestion: `Try using shortcuts or bulk operations for ${topAction.action}.`,
      });
    }

    return insights;
  }

  // Clear memory (for privacy)
  clearMemory() {
    this.memory = {
      messages: [],
      lastActivity: null,
      sessionCount: 0,
    };
    this.saveToStorage(this.storageKey, this.memory);
  }

  // Clear patterns
  clearPatterns() {
    this.patterns = {
      frequentQueries: [],
      preferredActions: [],
      timePatterns: [],
      lastUpdated: null,
    };
    this.saveToStorage(this.patternsKey, this.patterns);
  }

  // Get memory stats
  getMemoryStats() {
    return {
      messageCount: this.memory.messages.length,
      sessionCount: this.memory.sessionCount,
      lastActivity: this.memory.lastActivity,
      topQueries: this.patterns.frequentQueries.slice(0, 5),
      topActions: this.patterns.preferredActions.slice(0, 3),
      preferredTimeSlot: this.patterns.timePatterns.sort((a, b) => b.count - a.count)[0]?.slot,
    };
  }
}

// Export singleton instance
export const aiContextMemory = new AIContextMemory();
