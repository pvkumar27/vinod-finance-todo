import { features } from '../config/features.js';

class GeminiRouter {
  constructor(options = {}) {
    this.cachingEnabled = options.cachingEnabled ?? true;
    this.models = {
      'flash-1.5': { name: 'gemini-1.5-flash', quota: 1500, tier: 'standard', available: true },
      'pro-1.5': { name: 'gemini-1.5-pro', quota: 50, tier: 'pro', available: true },
      'flash-2.5': { name: 'gemini-2.5-flash', quota: 2000, tier: 'standard', available: true },
      'pro-2.5': { name: 'gemini-2.5-pro', quota: 100, tier: 'pro', available: true },
    };
    this.priorityOrder = ['flash-1.5', 'flash-2.5'];
    this.retryCount = 0;
    this.maxRetries = 2;
    this.cache = new Map();
    this.quotaState = {};

    // Initialize quota state for all models
    Object.keys(this.models).forEach(key => {
      this.quotaState[key] = { requests: 0, resetTime: this.getNextMidnightPT() };
    });
  }

  getNextMidnightPT() {
    const now = new Date();
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    pt.setHours(24, 0, 0, 0);
    return pt.getTime();
  }

  resetQuotaIfNeeded() {
    const now = Date.now();
    Object.keys(this.quotaState).forEach(model => {
      if (now >= this.quotaState[model].resetTime) {
        this.quotaState[model].requests = 0;
        this.quotaState[model].resetTime = this.getNextMidnightPT();
      }
    });
  }

  getCacheKey(prompt) {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  getCachedResponse(prompt) {
    if (!this.cachingEnabled) return null;
    const key = this.getCacheKey(prompt);
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 600000) {
      // 10 minutes
      return cached.response;
    }
    return null;
  }

  setCachedResponse(prompt, response) {
    if (!this.cachingEnabled) return;
    const key = this.getCacheKey(prompt);
    this.cache.set(key, { response, timestamp: Date.now() });
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  isQuotaExceeded(error) {
    if (error.status === 429) return true;
    if (error.message?.includes('quota') || error.message?.includes('limit')) return true;
    return false;
  }

  isModelNotFound(error) {
    return error.status === 404 || error.message?.includes('not found');
  }

  selectModel(intentMeta = {}) {
    this.resetQuotaIfNeeded();

    // For critical/complex tasks, try Pro models first if available
    if (intentMeta.preferPro || intentMeta.complex) {
      for (const key of ['pro-2.5', 'pro-1.5']) {
        if (this.models[key].available && this.quotaState[key].requests < this.models[key].quota) {
          return key;
        }
      }
    }

    // Standard priority order for regular tasks
    for (const key of this.priorityOrder) {
      if (this.models[key].available && this.quotaState[key].requests < this.models[key].quota) {
        return key;
      }
    }

    // Last resort: try Pro models even for regular tasks
    for (const key of ['pro-1.5', 'pro-2.5']) {
      if (this.models[key].available && this.quotaState[key].requests < this.models[key].quota) {
        return key;
      }
    }

    // All quotas exhausted - return first model for fallback error
    return this.priorityOrder[0];
  }

  logModelSwitch(from, to, reason, requestId) {
    console.warn(
      JSON.stringify({
        event: 'model_switch',
        from_model: from,
        to_model: to,
        reason,
        request_id: requestId,
        timestamp: new Date().toISOString(),
      })
    );
  }

  async makeRequest(prompt, intentMeta = {}) {
    const requestId = Math.random().toString(36).slice(2);

    // Check cache first
    const cached = this.getCachedResponse(prompt);
    if (cached) return cached;

    this.retryCount = 0;
    let lastError;

    while (this.retryCount < this.maxRetries) {
      const modelKey = this.selectModel(intentMeta);
      const model = this.models[modelKey];
      const modelName = model.name;

      try {
        this.quotaState[modelKey].requests++;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const data = await response.json();

        if (data.error) {
          const error = new Error(data.error.message);
          error.status = response.status;
          throw error;
        }

        // Cache successful response
        this.setCachedResponse(prompt, data);
        return data;
      } catch (error) {
        lastError = error;

        if (this.isModelNotFound(error)) {
          this.logModelSwitch(modelKey, 'next_available', 'model_not_found', requestId);

          // Mark model as unavailable
          this.models[modelKey].available = false;
        } else if (this.isQuotaExceeded(error)) {
          this.logModelSwitch(modelKey, 'next_available', 'quota_exceeded', requestId);

          // Mark current model as exhausted
          this.quotaState[modelKey].requests = this.models[modelKey].quota + 1;
        }

        this.retryCount++;
      }
    }

    throw lastError;
  }
}

export const geminiRouter = new GeminiRouter({
  cachingEnabled: features.GEMINI_CACHING,
});
