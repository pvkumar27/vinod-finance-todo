/**
 * Selector Migration Utility
 * Maps current fragile selectors to recommended data-cy selectors
 */

const SELECTOR_MIGRATION_MAP = {
  // Navigation selectors
  'button:has-text("To-Dos")': '[data-cy="nav-todos-tab"]',
  'button:has-text("Credit")': '[data-cy="nav-credit-tab"]',

  // Todo selectors
  'h2:has-text("To-Do Manager")': '[data-cy="todo-manager-heading"]',
  '#task-input': '[data-cy="task-input-field"]',
  'button:has-text("Add Task")': '[data-cy="task-add-button"]',

  // Credit Card selectors
  'h2:has-text("Credit Cards")': '[data-cy="credit-cards-heading"]',
  'button:has-text("Add Card")': '[data-cy="card-add-button"]',

  // Authentication selectors
  'input[type="email"]': '[data-cy="auth-email-input"]',
  'input[type="password"]': '[data-cy="auth-password-input"]',
  'button[type="submit"]': '[data-cy="auth-submit-button"]',
};

/**
 * Get recommended data-cy selector for a fragile selector
 * @param {string} fragileSelector - Current fragile selector
 * @returns {string} Recommended data-cy selector
 */
function getRecommendedSelector(fragileSelector) {
  return SELECTOR_MIGRATION_MAP[fragileSelector] || fragileSelector;
}

module.exports = {
  SELECTOR_MIGRATION_MAP,
  getRecommendedSelector,
};
