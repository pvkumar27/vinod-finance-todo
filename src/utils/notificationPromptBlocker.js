/**
 * Utility to detect and block notification prompts from being processed as AI queries
 * This prevents the 9am notification generation prompt from accidentally creating tasks
 */

const NOTIFICATION_PROMPT_PATTERNS = [
  // Direct notification generation prompts
  /generate\s+a\s+motivational/i,
  /generate\s+.*notification/i,
  /notification\s+for\s+fintask/i,
  /return\s+only\s+the\s+message/i,
  /keep\s+it\s+under\s+\d+\s+char/i,
  /max\s+\d+\s+chars/i,
  /productivity\s+app/i,
  /fintask\s+app/i,

  // Specific patterns from the notification function
  /user\s+has\s+\d+\s+pending\s+tasks/i,
  /include\s+emoji.*encouraging/i,
  /return\s+only.*notification/i,
  /generate.*morning.*notification/i,
  /generate.*midday.*motivation/i,
  /generate.*afternoon.*boost/i,
  /generate.*evening.*check/i,
  /generate.*goodnight.*message/i,

  // Common AI instruction patterns that shouldn't be processed
  /create\s+a\s+short\s+motivational/i,
  /encourage\s+\d+\s+tasks\s+today/i,
  /tasks\s+remaining.*emoji/i,
  /pending\s+tasks.*tomorrow/i,
];

/**
 * Check if a query appears to be a notification generation prompt
 * @param {string} query - The query to check
 * @returns {boolean} - True if the query should be blocked
 */
export const isNotificationPrompt = query => {
  if (!query || typeof query !== 'string') {
    return false;
  }

  const normalizedQuery = query.trim().toLowerCase();

  // Check against all patterns
  return NOTIFICATION_PROMPT_PATTERNS.some(pattern => pattern.test(normalizedQuery));
};

/**
 * Block notification prompts with a descriptive error
 * @param {string} query - The query to check
 * @throws {Error} - If the query is a notification prompt
 */
export const blockNotificationPrompt = query => {
  if (isNotificationPrompt(query)) {
    console.warn('Blocked notification prompt from being processed as AI query:', query);
    throw new Error('Invalid query: notification generation prompt detected and blocked');
  }
};

/**
 * Safe wrapper for processing queries that blocks notification prompts
 * @param {string} query - The query to process
 * @param {Function} processor - The function to process the query
 * @returns {Promise} - The result of processing or an error response
 */
export const safeProcessQuery = async (query, processor) => {
  try {
    blockNotificationPrompt(query);
    return await processor(query);
  } catch (error) {
    if (error.message.includes('notification generation prompt')) {
      return {
        success: false,
        message: 'Invalid query: notification prompt detected',
        processingMode: 'blocked-notification-prompt',
        blocked: true,
      };
    }
    throw error;
  }
};

const notificationPromptBlocker = {
  isNotificationPrompt,
  blockNotificationPrompt,
  safeProcessQuery,
};

export default notificationPromptBlocker;
